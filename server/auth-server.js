import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { dbQuery, dbTransaction, ensureDatabase, pool } from './db.js';
import { MAX_ACCOUNT_CAPACITY, ACCOUNT_CAPACITY_LOCK_NAME } from './account-config.js';
import {
  RESERVATION_WINDOW_START_MINUTES as DEFAULT_RESERVATION_START_MINUTES,
  RESERVATION_WINDOW_END_MINUTES as DEFAULT_RESERVATION_END_MINUTES,
  formatReservationWindowMessage,
  isWithinReservationWindow
} from '../shared/reservation-window.js';



const app = express();

const ORGROOM_TIME_ZONE = 'Asia/Manila';

// DATETIME columns in ORGROOM represent UTC wall-clock values. Add an explicit
// Z marker in API payloads so clients never parse them as browser-local times.
function toUtcIso(value) {
  if (value == null || value === '') return null;
  if (value instanceof Date) return Number.isFinite(value.getTime()) ? value.toISOString() : null;
  let text = String(value).trim();
  if (!text) return null;
  if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(text)) text = `${text.replace(' ', 'T')}Z`;
  const date = new Date(text);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

function manilaDateTimeParts(value = new Date()) {
  return Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: ORGROOM_TIME_ZONE,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    weekday: 'long', hourCycle: 'h23'
  }).formatToParts(value).map(part => [part.type, part.value]));
}

function manilaTodayISO() {
  const p = manilaDateTimeParts();
  return `${p.year}-${p.month}-${p.day}`;
}

function manilaCurrentMinutes() {
  const p = manilaDateTimeParts();
  return Number(p.hour) * 60 + Number(p.minute);
}

// Reservation date/time strings are campus wall-clock values, not UTC. Convert
// them to instants with the IANA zone without changing the saved date or slot.
function manilaWallTimeToEpochMs(dateValue, timeValue) {
  const match = String(dateValue || '').slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const minutes = parseTime(timeValue);
  if (!match || !Number.isFinite(minutes)) return null;
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
  const hour = Math.floor(minutes / 60), minute = minutes % 60;
  const wallAsUtc = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  const check = new Date(wallAsUtc);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() + 1 !== month || check.getUTCDate() !== day) return null;
  const localized = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: ORGROOM_TIME_ZONE,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
  }).formatToParts(check).map(part => [part.type, part.value]));
  const localizedAsUtc = Date.UTC(Number(localized.year), Number(localized.month) - 1, Number(localized.day), Number(localized.hour), Number(localized.minute), Number(localized.second));
  return wallAsUtc - (localizedAsUtc - wallAsUtc);
}

function reservationTimeRange(dateValue, timeSlot) {
  const parts = String(timeSlot || '').split(/\s*-\s*/);
  if (parts.length < 2) return [null, null];
  return [manilaWallTimeToEpochMs(dateValue, parts[0]), manilaWallTimeToEpochMs(dateValue, parts[1])];
}

const configuredOrigins = String(process.env.CLIENT_ORIGIN || '').split(',').map(x=>x.trim()).filter(Boolean);
const isLocalNetworkOrigin = origin => {
  try{
    const host=new URL(origin).hostname;
    return host==='localhost' || host==='127.0.0.1' || host==='::1' || /^10\./.test(host) || /^192\.168\./.test(host) || /^172\.(1[6-9]|2\d|3[0-1])\./.test(host);
  }catch{return false;}
};
app.use(cors({ origin:(origin,callback)=>{
  if(!origin || configuredOrigins.includes(origin) || (!configuredOrigins.length && isLocalNetworkOrigin(origin))) return callback(null,true);
  return callback(new Error('CORS origin is not allowed.'));
}, credentials:false }));
app.use(express.json({ limit: '50kb' }));

const PORT = Number(process.env.PORT || process.env.AUTH_PORT || 3001);
const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const CODE_MAX_ATTEMPTS = 5;
const SESSION_COOKIELESS_HEADER = 'authorization';
let reminderJobRunning=false;
const emailGatewayUrl = String(
  process.env.EMAIL_GATEWAY_URL || ''
).trim();

const emailGatewayKey = String(
  process.env.EMAIL_GATEWAY_KEY || ''
).trim();

const allowedEmail = email => /^[^\s@]+@(gmail\.com|cmdi\.edu\.ph)$/i.test(String(email || '').trim());
const normalizeRole = role => String(role || '').trim().toUpperCase();
const isAdminRole = role => ['ADMIN', 'SUPER_ADMIN'].includes(normalizeRole(role));
const isSuperAdminRole = role => normalizeRole(role) === 'SUPER_ADMIN';
const strongPassword = password => typeof password === 'string' && password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);

let runtimeSystemSettings = {
  maxAccounts: MAX_ACCOUNT_CAPACITY,
  reservationStartMinutes: DEFAULT_RESERVATION_START_MINUTES,
  reservationEndMinutes: DEFAULT_RESERVATION_END_MINUTES
};

async function refreshRuntimeSystemSettings() {
  const rows = await dbQuery(
    `SELECT setting_key, setting_value FROM orgroom_system_settings
     WHERE setting_key IN ('max_accounts','reservation_start_minutes','reservation_end_minutes')`
  );
  const stored = Object.fromEntries(rows.map(row => [row.setting_key, Number(row.setting_value)]));
  const maxAccounts = Number.isInteger(stored.max_accounts) && stored.max_accounts >= 1
    ? stored.max_accounts : MAX_ACCOUNT_CAPACITY;
  let start = Number.isInteger(stored.reservation_start_minutes)
    ? stored.reservation_start_minutes : DEFAULT_RESERVATION_START_MINUTES;
  let end = Number.isInteger(stored.reservation_end_minutes)
    ? stored.reservation_end_minutes : DEFAULT_RESERVATION_END_MINUTES;
  if (start < 0 || end > 1439 || start >= end) {
    start = DEFAULT_RESERVATION_START_MINUTES;
    end = DEFAULT_RESERVATION_END_MINUTES;
  }
  runtimeSystemSettings = {
    maxAccounts,
    reservationStartMinutes: start,
    reservationEndMinutes: end
  };
  return runtimeSystemSettings;
}

function withinCurrentReservationWindow(startMinutes, endMinutes) {
  return isWithinReservationWindow(
    startMinutes,
    endMinutes,
    runtimeSystemSettings.reservationStartMinutes,
    runtimeSystemSettings.reservationEndMinutes
  );
}

function currentReservationWindowMessage() {
  return formatReservationWindowMessage(
    runtimeSystemSettings.reservationStartMinutes,
    runtimeSystemSettings.reservationEndMinutes
  );
}

function safeJson(value) {
  if (value == null) return null;
  try { return JSON.stringify(value); } catch { return JSON.stringify({ unavailable: true }); }
}

async function writeAuditEvent({ actor = null, action, entityType, entityId = '', previousValues = null, newValues = null, reason = '' }, query = dbQuery) {
  await query(
    `INSERT INTO orgroom_audit_logs
      (actor_user_id,actor_name,actor_email,actor_role,action,entity_type,entity_id,previous_values,new_values,reason)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [
      actor?.id ? Number(actor.id) : null,
      String(actor?.name || 'System').slice(0,255),
      normalizeEmail(actor?.email || ''),
      normalizeRole(actor?.role || 'SYSTEM'),
      String(action || 'SYSTEM_EVENT').slice(0,100),
      String(entityType || 'SYSTEM').slice(0,60),
      String(entityId ?? '').slice(0,100),
      safeJson(previousValues),
      safeJson(newValues),
      String(reason || '').slice(0,2000)
    ]
  );
}

async function writeReservationDecisionHistory({ reservationId, fromStatus = null, toStatus, actionType, actor = null, actorRole = null, reason = '' }, query = dbQuery) {
  await query(
    `INSERT INTO reservation_decision_history
      (reservation_id,from_status,to_status,action_type,actor_user_id,actor_name,actor_role,reason)
     VALUES (?,?,?,?,?,?,?,?)`,
    [
      Number(reservationId),
      fromStatus,
      String(toStatus),
      String(actionType),
      actor?.id ? Number(actor.id) : null,
      String(actor?.name || (actorRole === 'SYSTEM' ? 'ORGROOM System' : 'System')).slice(0,255),
      normalizeRole(actorRole || actor?.role || 'SYSTEM'),
      String(reason || '').slice(0,2000)
    ]
  );
}

function parseJsonColumn(value) {
  if (!value) return null;
  try { return JSON.parse(value); } catch { return null; }
}
async function verifyPassword(password, storedHash){
  const hash=String(storedHash||'');
  if(hash.startsWith('$2a$')||hash.startsWith('$2b$')||hash.startsWith('$2y$')) return bcrypt.compare(String(password||''),hash);
  if(/^[a-f0-9]{64}$/i.test(hash)){
    const legacy=crypto.createHash('sha256').update(String(password||'')).digest('hex');
    return legacy.toLowerCase()===hash.toLowerCase();
  }
  return false;
}
const normalizeEmail = email => String(email || '').trim().toLowerCase();
const normalizeStatus = status => ['PENDING','APPROVED','REJECTED','CANCELLED'].includes(status) ? status : 'PENDING';

function emailGatewayConfigurationMessage() {
  if (!emailGatewayUrl || !emailGatewayKey) {
    return 'Email gateway is not configured. Set EMAIL_GATEWAY_URL and EMAIL_GATEWAY_KEY in Render.';
  }

  return null;
}

async function sendEmail({ to, subject, text, html }) {
  const configError = emailGatewayConfigurationMessage();

  if (configError) {
    throw new Error(configError);
  }

  const response = await fetch(emailGatewayUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      key: emailGatewayKey,
      to: normalizeEmail(to),
      subject: String(subject || ''),
      text: String(text || ''),
      html: String(html || '')
    }),
    signal: AbortSignal.timeout(20000)
  });

  const responseText = await response.text();
  let result;

  try {
    result = JSON.parse(responseText);
  } catch {
    throw new Error(
      `Email gateway returned an unreadable response (HTTP ${response.status}). Check the Apps Script deployment.`
    );
  }

  if (!response.ok || !result?.ok) {
    throw new Error(
      result?.message ||
      `Email gateway rejected the request (HTTP ${response.status}).`
    );
  }

  return result;
}

function emailGatewayErrorMessage(error) {
  const message = String(
    error?.message || error || 'Unknown email gateway error.'
  );

  if (
    error?.name === 'TimeoutError' ||
    /timed out|timeout/i.test(message)
  ) {
    return 'Email gateway request timed out. Check the Apps Script deployment and URL.';
  }

  return `Email gateway failed: ${message}`;
}

function createCode() { return String(crypto.randomInt(0, 1000000)).padStart(6, '0'); }
function createSessionToken(){ return crypto.randomBytes(32).toString('hex'); }
function hashSessionToken(token){ return crypto.createHash('sha256').update(String(token||'')).digest('hex'); }
async function createSession(userId){
  const token=createSessionToken();
  const hash=hashSessionToken(token);
  await dbQuery('DELETE FROM auth_sessions WHERE user_id=? OR expires_at < NOW()',[userId]);
  await dbQuery('INSERT INTO auth_sessions (user_id,token_hash,expires_at) VALUES (?,?,FROM_UNIXTIME(?/1000))',[userId,hash,Date.now()+SESSION_TTL_MS]);
  return token;
}
async function currentUser(req){
  const raw=String(req.headers[SESSION_COOKIELESS_HEADER]||'');
  if(!raw.toLowerCase().startsWith('bearer ')) return null;
  const token=raw.slice(7).trim();
  if(!token) return null;
  const rows=await dbQuery('SELECT u.* FROM auth_sessions s INNER JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>NOW() LIMIT 1',[hashSessionToken(token)]);
  if(!rows[0] || !Boolean(rows[0].is_active)) return null;
  await dbQuery('UPDATE auth_sessions SET last_seen_at=NOW() WHERE token_hash=?',[hashSessionToken(token)]);
  return rows[0];
}
async function requireAuth(req,res){
  const user=await currentUser(req);
  if(!user){res.status(401).json({message:'Your session has expired or is not authenticated. Please sign in again.'});return null;}
  req.orgUser=user;
  return user;
}

async function requireAdminAuth(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return null;

  if (!isAdminRole(user.role)) {
    res.status(403).json({ message: 'Administrator access is required.' });
    return null;
  }
  return user;
}

async function requireSuperAdminAuth(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return null;
  if (!isSuperAdminRole(user.role)) {
    res.status(403).json({ message: 'Super Admin access is required.' });
    return null;
  }
  return user;
}


function userOwnsReservation(user,row){ return Number(user.id)===Number(row.user_id) || (row.user_id==null && normalizeEmail(user.email)===normalizeEmail(row.user_email)); }
function validDbTime(value){ const m=String(value||'').match(/^(\d{2}):(\d{2}):(\d{2})$/); if(!m)return false; const h=Number(m[1]),mi=Number(m[2]),sec=Number(m[3]); return h>=0&&h<24&&mi>=0&&mi<60&&sec>=0&&sec<60; }
function dbTimeMinutes(value){ if(!validDbTime(value)) return NaN; const [h,m]=String(value).split(':').map(Number); return h*60+m; }

async function sendCode(email, code, purpose) {

  const labels = { login: 'Verify your email', forgot: 'Password reset' };
  const subject = `ORGROOM — ${labels[purpose] || 'Verification'}`;
  const text = `Hello,\n\nThank you for using ORGROOM — Facility Reservation Platform.\n\nYour verification code is: ${code}\n\nThis code expires in 10 minutes and can only be used once.\n\nIf you did not request this code, you can ignore this email.\n\nRegards,\nORGROOM\nFacility Reservation Platform`;
  const html = `<div style="margin:0;background:#f5f7fb;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#172033"><div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e9f2;border-radius:20px;overflow:hidden"><div style="padding:28px 32px;background:#2563eb;color:#fff"><div style="font-size:22px;font-weight:800;letter-spacing:.5px">ORGROOM</div><div style="margin-top:4px;font-size:13px;opacity:.9">Facility Reservation Platform</div></div><div style="padding:32px"><h1 style="margin:0 0 12px;font-size:24px">Verify your email</h1><p style="margin:0 0 24px;line-height:1.6;color:#596579">Thank you for registering with ORGROOM. Enter the verification code below to continue.</p><div style="padding:20px;text-align:center;background:#f4f7ff;border:1px solid #dce5ff;border-radius:14px"><div style="font-size:12px;color:#667085;text-transform:uppercase;letter-spacing:1.2px">Verification code</div><div style="margin-top:8px;font-size:36px;font-weight:800;letter-spacing:8px;color:#1d4ed8">${code}</div></div><p style="margin:22px 0 0;line-height:1.6;color:#596579">This code expires in <strong>10 minutes</strong> and can only be used once.</p><p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:#7b8494">If you did not create this account or request this code, you can safely ignore this email.</p></div></div></div>`;
  await sendEmail({
  to: email,
  subject,
  text,
  html
});
}

function escapeHtml(value=''){
  return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

function notificationReservationPath(id,tab='requests'){
  return `/?notificationReservation=OR-${Number(id)}&notificationTab=${encodeURIComponent(tab)}`;
}

function notificationBaseUrl(){
  const configured=String(process.env.CLIENT_ORIGIN||'').split(',')[0].trim();
  return configured || `http://localhost:${Number(process.env.FRONTEND_PORT||5173)}`;
}

async function reservationNotificationData(reservationId){
  const rows=await dbQuery(`
    SELECT r.*, f.name AS facility_lookup_name, u.name AS requester_account_name, u.email AS requester_account_email,
           du.name AS decision_by_name
    FROM reservations r
    LEFT JOIN facilities f ON f.id=r.facility_id
    LEFT JOIN users u ON u.id=r.user_id
    LEFT JOIN users du ON du.id=r.decision_by_user_id
    WHERE r.id=? LIMIT 1
  `,[reservationId]);
  return rows[0] || null;
}

function reservationNotificationDetails(row){
  const date=String(row.reservation_date||'').slice(0,10);
  return {
    requesterName: row.user_name || row.requester_account_name || 'ORGROOM user',
    requesterEmail: row.user_email || row.requester_account_email || '',
    building: row.building || '',
    room: row.room_name || row.facility_lookup_name || 'Room',
    date,
    time: row.time_slot || '',
    purpose: row.purpose || 'No purpose provided',
    status: row.status || 'PENDING',
    submittedAt: row.submitted_at ? String(row.submitted_at) : '',
    decisionBy: row.decision_by_name || '',
    decisionAt: row.decision_at ? String(row.decision_at) : '',
    adminNotes: row.admin_notes || '',
    decisionSource: row.decision_source || 'MANUAL',
    updatedAt: row.updated_at ? String(row.updated_at) : ''
  };
}

async function sendNotificationEmail(notificationId, recipientEmail, type, details){
  const email=normalizeEmail(recipientEmail);
  if(!email) return;
  const existing=(await dbQuery('SELECT * FROM notification_email_deliveries WHERE notification_id=? LIMIT 1',[notificationId]))[0];
  if(existing?.delivery_status==='SENT') return;
  if(existing){
    await dbQuery('UPDATE notification_email_deliveries SET attempts=attempts+1,delivery_status=\'PENDING\',error_message=\'\' WHERE id=?',[existing.id]);
  }else{
    await dbQuery('INSERT INTO notification_email_deliveries (notification_id,recipient_email,delivery_status,attempts) VALUES (?,?,\'PENDING\',1)',[notificationId,email]);
  }
  try{

    const d=details;
    const actionTab=d.isAdmin ? 'requests' : 'reservations';
    const actionUrl=`${notificationBaseUrl()}${notificationReservationPath(d.reservationId || 0,actionTab)}`;
    const isNew=type==='NEW_RESERVATION_REQUEST';
    const isApproved=type==='RESERVATION_APPROVED';
    const isRejected=type==='RESERVATION_REJECTED';
    const isCancelled=type==='RESERVATION_CANCELLED';
    const isModified=type==='RESERVATION_MODIFIED';
    const isOverridden=type==='RESERVATION_OVERRIDDEN';
    const automaticApproval=isApproved && d.decisionSource==='SYSTEM_AUTO_APPROVAL';
    const subject=isNew?'ORGROOM — New Reservation Request':isApproved?'ORGROOM — Reservation Approved':isRejected?'ORGROOM — Reservation Rejected':isCancelled?'ORGROOM — Reservation Cancelled':isOverridden?'ORGROOM — Reservation Decision Updated':'ORGROOM — Reservation Update';
    const intro=isNew?'A new reservation request has been submitted in ORGROOM.':automaticApproval?'Your reservation was automatically approved by the ORGROOM system after availability validation.':isApproved?'Your reservation request has been approved.':isRejected?'Your reservation request has been rejected.':isCancelled?'A reservation request has been cancelled.':isModified?'A reservation request has been modified.':isOverridden?'A Super Admin changed the reservation decision.':'Your ORGROOM reservation has been updated.';
    const statusLabel=d.status==='APPROVED'?'Approved':d.status==='REJECTED'?'Rejected':d.status==='CANCELLED'?'Cancelled':'Pending';
    const reviewer=automaticApproval ? '<p style="margin:12px 0"><strong>Approval source:</strong> ORGROOM System (automatic approval)</p>' : d.decisionBy ? `<p style="margin:12px 0"><strong>${isApproved?'Approved by':'Reviewed by'}:</strong> ${escapeHtml(d.decisionBy)}</p>` : '';
    const reason=((isRejected || isOverridden) && d.adminNotes) ? `<p style="margin:12px 0"><strong>Reason:</strong> ${escapeHtml(d.adminNotes)}</p>` : '';
    const action=isNew||isApproved||isRejected||isModified||isOverridden ? `<p style="margin:24px 0"><a href="${escapeHtml(actionUrl)}" style="display:inline-block;padding:12px 18px;background:#315bea;color:#fff;text-decoration:none;border-radius:10px;font-weight:700">${isNew?'Review Reservation Request':'Open ORGROOM'}</a></p>` : '';
    const text=`Hello ${d.recipientName || 'ORGROOM user'},\n\n${intro}\n\nRequester: ${d.requesterName}\nRequester email: ${d.requesterEmail}\nBuilding: ${d.building}\nRoom: ${d.room}\nDate: ${d.date}\nTime: ${d.time}\nPurpose: ${d.purpose}\nStatus: ${statusLabel}${d.adminNotes&&(isRejected||isOverridden)?`\nReason: ${d.adminNotes}`:''}${automaticApproval?'\nApproval source: ORGROOM System (automatic approval)':d.decisionBy?`\n${isApproved?'Approved by':'Reviewed by'}: ${d.decisionBy}`:''}\n\nPlease log in to ORGROOM for more details.\n\nORGROOM\nFacility Reservation Platform`;
    const html=`<div style="margin:0;background:#f5f7fb;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#172033"><div style="max-width:620px;margin:0 auto;background:#fff;border:1px solid #e5e9f2;border-radius:20px;overflow:hidden"><div style="padding:26px 30px;background:#315bea;color:#fff"><div style="font-size:22px;font-weight:800;letter-spacing:.4px">ORGROOM</div><div style="margin-top:4px;font-size:13px;opacity:.9">Facility Reservation Platform</div></div><div style="padding:30px"><h1 style="margin:0 0 10px;font-size:23px">${escapeHtml(subject.replace('ORGROOM — ','ORGROOM — '))}</h1><p style="margin:0 0 22px;color:#667085;line-height:1.6">${escapeHtml(intro)}</p><div style="padding:18px;background:#f7f9fc;border:1px solid #e6eaf0;border-radius:14px"><p style="margin:0 0 8px"><strong>Requester:</strong> ${escapeHtml(d.requesterName)}</p><p style="margin:8px 0"><strong>Building:</strong> ${escapeHtml(d.building)}</p><p style="margin:8px 0"><strong>Room:</strong> ${escapeHtml(d.room)}</p><p style="margin:8px 0"><strong>Date:</strong> ${escapeHtml(d.date)}</p><p style="margin:8px 0"><strong>Time:</strong> ${escapeHtml(d.time)}</p><p style="margin:8px 0"><strong>Purpose:</strong> ${escapeHtml(d.purpose)}</p><p style="margin:8px 0"><strong>Status:</strong> ${escapeHtml(statusLabel)}</p>${reviewer}${reason}</div>${action}<p style="margin:24px 0 0;font-size:12px;color:#7b8494;line-height:1.6">ORGROOM — Facility Reservation Platform</p></div></div></div>`;
    await sendEmail({
  to: email,
  subject,
  text,
  html
});
    await dbQuery("UPDATE notification_email_deliveries SET delivery_status='SENT',sent_at=NOW(),error_message='' WHERE notification_id=?",[notificationId]);
  }catch(error){
    const message=String(error?.message||error).slice(0,1000);
    await dbQuery("UPDATE notification_email_deliveries SET delivery_status='FAILED',error_message=? WHERE notification_id=?",[message,notificationId]);
    console.error(`ORGROOM notification email failed for ${email}: ${message}`);
  }
}

async function createNotification({recipientUserId,type,reservationId=null,eventKey,title,message,email=null,details={}}){
  if(!recipientUserId) return null;
  try{
    await dbQuery(`INSERT INTO notifications (recipient_user_id,notification_type,reservation_id,event_key,title,message) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,[recipientUserId,type,reservationId,eventKey,title,message]);
    const row=(await dbQuery('SELECT * FROM notifications WHERE recipient_user_id=? AND event_key=? LIMIT 1',[recipientUserId,eventKey]))[0];
    if(!row) return null;
    if(email) await sendNotificationEmail(Number(row.id),email,type,{...details,reservationId});
    return row;
  }catch(error){
    console.error(`ORGROOM notification creation failed: ${error.message||error}`);
    return null;
  }
}

async function notifyReservationEvent(reservationId,type){
  try{
    const row=await reservationNotificationData(reservationId);
    if(!row) return;
    const d=reservationNotificationDetails(row);
    d.reservationId=Number(reservationId);
    const admins=await dbQuery("SELECT id,name,email FROM users WHERE LOWER(role) IN ('admin','super_admin') AND is_verified=1 AND (? IS NULL OR id<>?) AND (?<>'admin' OR LOWER(role)='super_admin') ORDER BY id",[row.user_id==null?null:Number(row.user_id),row.user_id==null?0:Number(row.user_id),String(row.user_role||'teacher').toLowerCase()]);
    const labels={
      NEW_RESERVATION_REQUEST:{title:'New reservation request',adminMessage:`${d.requesterName} (${d.requesterEmail}) submitted ${d.building} — ${d.room} for ${d.date} · ${d.time}. Purpose: ${d.purpose}`,userTitle:'Reservation request submitted',userMessage:`Your request for ${d.building} — ${d.room} on ${d.date} · ${d.time} is now pending admin review.`},
      RESERVATION_APPROVED:{title:'Reservation approved',adminMessage:`${d.requesterName}'s request for ${d.building} — ${d.room} was approved${d.decisionSource==='SYSTEM_AUTO_APPROVAL'?' automatically by ORGROOM':' by '+(d.decisionBy || 'an administrator')}.`,userTitle:'Reservation approved',userMessage:`Your request for ${d.building} — ${d.room} on ${d.date} · ${d.time} was approved${d.decisionSource==='SYSTEM_AUTO_APPROVAL'?' automatically by ORGROOM':' by '+(d.decisionBy || 'an administrator')}.`},
      RESERVATION_REJECTED:{title:'Reservation rejected',adminMessage:`${d.requesterName}'s request for ${d.building} — ${d.room} was rejected by ${d.decisionBy || 'an administrator'}.`,userTitle:'Reservation rejected',userMessage:`Your request for ${d.building} — ${d.room} on ${d.date} · ${d.time} was rejected by ${d.decisionBy || 'an administrator'}.`},
      RESERVATION_CANCELLED:{title:'Reservation cancelled',adminMessage:`${d.requesterName} cancelled the request for ${d.building} — ${d.room} on ${d.date} · ${d.time}.`,userTitle:'Reservation cancelled',userMessage:`Your request for ${d.building} — ${d.room} on ${d.date} · ${d.time} was cancelled.`},
      RESERVATION_MODIFIED:{title:'Reservation request modified',adminMessage:`${d.requesterName} modified the pending request for ${d.building} — ${d.room} on ${d.date} · ${d.time}.`,userTitle:'Reservation request updated',userMessage:`Your pending request for ${d.building} — ${d.room} on ${d.date} · ${d.time} was updated.`},
      RESERVATION_OVERRIDDEN:{title:'Reservation decision updated',adminMessage:`A Super Admin changed the decision for ${d.requesterName}'s reservation for ${d.building} — ${d.room}. New status: ${d.status}. Reason: ${d.adminNotes || 'See ORGROOM for details.'}`,userTitle:'Reservation decision updated',userMessage:`A Super Admin changed your reservation decision. New status: ${d.status}. Reason: ${d.adminNotes || 'See ORGROOM for details.'}`}
    };
    const label=labels[type]; if(!label) return;
    const eventKey=`reservation:${reservationId}:${type}:${String(d.updatedAt||d.decisionAt||d.submittedAt||'').replace(/\s+/g,'_')}`;
    if(type==='NEW_RESERVATION_REQUEST' || type==='RESERVATION_CANCELLED' || type==='RESERVATION_MODIFIED' || type==='RESERVATION_OVERRIDDEN'){
      for(const admin of admins){
        await createNotification({recipientUserId:Number(admin.id),type,reservationId,eventKey:`${eventKey}:admin:${admin.id}`,title:label.title,message:label.adminMessage,email:admin.email,details:{...d,recipientName:admin.name,isAdmin:true}});
      }
    }
    if(row.user_id){
      await createNotification({recipientUserId:Number(row.user_id),type,reservationId,eventKey:`${eventKey}:user:${row.user_id}`,title:label.userTitle,message:label.userMessage,email:row.user_email,details:{...d,recipientName:d.requesterName,isAdmin:false}});
    }
  }catch(error){ console.error(`ORGROOM reservation notification failed for ${reservationId}/${type}: ${error.message||error}`); }
}

async function issueCode(email, purpose, payload = {}) {
  const existing = await dbQuery('SELECT created_at FROM verification_codes WHERE email=? AND purpose=? ORDER BY id DESC LIMIT 1', [email, purpose]);
  if (existing[0] && Date.now() - new Date(toUtcIso(existing[0].created_at)).getTime() < RESEND_COOLDOWN_MS) throw new Error('Please wait 30 seconds before requesting another code.');
  const code = createCode();
  const hash = await bcrypt.hash(code, 10);
  await dbQuery('DELETE FROM verification_codes WHERE email=? AND purpose=?', [email, purpose]);
  await dbQuery('INSERT INTO verification_codes (email,purpose,code_hash,expires_at,attempts) VALUES (?,?,?,DATE_ADD(NOW(), INTERVAL 10 MINUTE),0)', [email, purpose, hash]);
  await sendCode(email, code, purpose);
  return payload;
}

async function consumeCode(email, purpose, code) {
  const rows = await dbQuery('SELECT id,code_hash,expires_at,attempts FROM verification_codes WHERE email=? AND purpose=? ORDER BY id DESC LIMIT 1', [email, purpose]);
  const record = rows[0];
  if (!record) throw new Error('Invalid verification code.');
  if (new Date(toUtcIso(record.expires_at)).getTime() < Date.now()) {
    await dbQuery('DELETE FROM verification_codes WHERE id=?', [record.id]);
    throw new Error('This verification code has expired. Please request a new code.');
  }
  const valid = await bcrypt.compare(String(code || '').trim(), record.code_hash);
  if (!valid) {
    const attempts = Number(record.attempts || 0) + 1;
    if (attempts >= CODE_MAX_ATTEMPTS) {
      await dbQuery('DELETE FROM verification_codes WHERE id=?', [record.id]);
      throw new Error('Too many invalid verification attempts. Please request a new code.');
    }
    await dbQuery('UPDATE verification_codes SET attempts=? WHERE id=?', [attempts, record.id]);
    throw new Error(`Invalid verification code. ${CODE_MAX_ATTEMPTS - attempts} attempts remaining.`);
  }
  await dbQuery('DELETE FROM verification_codes WHERE id=?', [record.id]);
}

function profileFromUser(user) {
  const email = user.email;
  const localName = user.name?.trim() || email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const rawRole = normalizeRole(user.role);
  const role = rawRole === 'SUPER_ADMIN' ? 'super_admin' : rawRole === 'ADMIN' ? 'admin' : 'teacher';
  return { id: Number(user.id), name: localName, email, role, org: user.organization || (isAdminRole(rawRole) ? 'Administration' : 'Academic Faculty'), department: user.department || '', position: user.position || (role === 'teacher' ? 'teacher' : 'admin') };
}

function mapFacility(row) {
  return { id: row.id, name: row.name, building: row.building, buildingCode: row.building_code, capacity: row.capacity == null ? null : Number(row.capacity), type: row.type, description: row.description || '', imageUrl: row.image_url || row.imageUrl || '', status: row.status || 'AVAILABLE', amenities: Array.isArray(row.amenities) ? row.amenities : (typeof row.amenities === 'string' ? JSON.parse(row.amenities || '[]') : []) };
}
function mapReservation(row) {
  const [startMs, endMs] = reservationTimeRange(row.reservation_date, row.time_slot);
  return { id: `OR-${String(row.id).padStart(3,'0')}`, dbId: Number(row.id), userId: row.user_id == null ? null : Number(row.user_id), userName: row.user_name, userEmail: row.user_email, userRole: row.user_role, orgName: row.organization_name, roomName: row.room_name, building: row.building, facilityId: row.facility_id, date: String(row.reservation_date).slice(0,10), timeSlot: row.time_slot, attendees: Number(row.attendees), purpose: row.purpose, eventType: row.event_type, status: row.status, submittedAt: toUtcIso(row.submitted_at) || '', adminNotes: row.admin_notes || '', decisionByUserId: row.decision_by_user_id == null ? null : Number(row.decision_by_user_id), decisionByName: row.decision_by_name || '', decisionByEmail: row.decision_by_email || '', decisionAt: toUtcIso(row.decision_at), decisionSource: row.decision_source || 'MANUAL', priority: Boolean(row.priority), startMs: startMs == null ? (row.start_ms == null ? null : Number(row.start_ms)) : startMs, endMs: endMs == null ? (row.end_ms == null ? null : Number(row.end_ms)) : endMs, startReminderStatus: row.start_reminder_status || 'PENDING', startReminderSentAt: toUtcIso(row.start_reminder_sent_at), endReminderStatus: row.end_reminder_status || 'PENDING', endReminderSentAt: toUtcIso(row.end_reminder_sent_at) };
}
function mapUsageCheck(row) {
  return { id:Number(row.id || row.usage_id), reservationId:Number(row.reservation_id), status:row.usage_status || 'NOT_CHECKED', checkedAt:toUtcIso(row.checked_at), checkedBy:row.checked_by_name || '', checkedByEmail:row.checked_by_email || '', note:row.usage_note || row.note || '', createdAt:toUtcIso(row.usage_created_at || row.created_at), updatedAt:toUtcIso(row.usage_updated_at || row.updated_at) };
}
function mapWeekly(row) { return { id: Number(row.id), facilityId: row.facility_id, dayOfWeek: row.day_of_week, startTime: String(row.start_time).slice(0,5), endTime: String(row.end_time).slice(0,5), activityName: row.activity_name, organizationName: row.organization_name || row.program || '', courseCode: row.course_code || '', courseTitle: row.course_title || row.activity_name || '', program: row.program || '', yearBlock: row.year_block || '', instructor: row.instructor || '', termStart: row.term_start ? String(row.term_start).slice(0,10) : '', termEnd: row.term_end ? String(row.term_end).slice(0,10) : '', termDatesText: row.term_dates_text || '', sourceSheet: row.source_sheet || '', description: row.description || '', isActive: Boolean(row.is_active) }; }

function parseTime(value) {
  const m = String(value || '').trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return NaN;
  let h = Number(m[1]); const min = Number(m[2]); const ap = m[3].toUpperCase();
  if (h < 1 || h > 12 || min > 59) return NaN;
  if (ap === 'PM' && h !== 12) h += 12; if (ap === 'AM' && h === 12) h = 0;
  return h * 60 + min;
}
function timeSlotParts(slot) {
  const parts = String(slot || '').split(/\s*-\s*/);
  return [parseTime(parts[0]), parseTime(parts[1])];
}

function assertWithinReservationWindow(start, end) {
  if (!withinCurrentReservationWindow(start, end)) {
    throw Object.assign(
      new Error(currentReservationWindowMessage()),
      { status: 400 }
    );
  }
}

function localTodayISO() {
  return manilaTodayISO();
}

function validateReservationInput({
  facility,
  facilityId,
  roomName,
  building,
  date,
  timeSlot,
  attendees,
  purpose
}) {
  if (!facilityId || !facility) {
    throw Object.assign(
      new Error('Please select a valid room from the ORGROOM facility list.'),
      { status: 400 }
    );
  }

  if (
    String(facility.name) !== String(roomName) ||
    String(facility.building) !== String(building)
  ) {
    throw Object.assign(
      new Error('The selected room does not match the requested building. Please choose the room again.'),
      { status: 400 }
    );
  }

  if (
    ['MAINTENANCE', 'INACTIVE', 'CLOSED', 'DISABLED', 'UNAVAILABLE']
      .includes(String(facility.status || 'AVAILABLE').toUpperCase())
  ) {
    throw Object.assign(
      new Error('The selected room is currently unavailable for reservations.'),
      { status: 409 }
    );
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ''))) {
    throw Object.assign(
      new Error('Please provide a valid reservation date.'),
      { status: 400 }
    );
  }

  if (String(date) < localTodayISO()) {
    throw Object.assign(
      new Error('Reservations cannot be created for a past date.'),
      { status: 400 }
    );
  }

  const [start, end] = timeSlotParts(timeSlot);

  if (
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    end <= start
  ) {
    throw Object.assign(
      new Error('Invalid reservation time. End time must be later than start time.'),
      { status: 400 }
    );
  }

  assertWithinReservationWindow(start, end);

  if (
    String(date) === localTodayISO() &&
    start <= manilaCurrentMinutes()
  ) {
    throw Object.assign(
      new Error('The selected start time has already passed. Please choose a future time.'),
      { status: 400 }
    );
  }

  if (!Number.isFinite(Number(attendees)) || Number(attendees) < 1) {
    throw Object.assign(
      new Error('At least one attendee is required.'),
      { status: 400 }
    );
  }

  if (facility.capacity && Number(attendees) > Number(facility.capacity)) {
    throw Object.assign(
      new Error(`The selected room capacity is ${facility.capacity}.`),
      { status: 400 }
    );
  }

  if (!String(purpose || '').trim()) {
    throw Object.assign(
      new Error('Please provide a purpose for the reservation.'),
      { status: 400 }
    );
  }
}

async function assertNoConflict({
  facilityId,
  roomName,
  building,
  date,
  timeSlot,
  excludeId = null,
  query = dbQuery
}) {
  const [start, end] = timeSlotParts(timeSlot);

  if (
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    end <= start
  ) {
    throw new Error(
      'Invalid reservation time. End time must be later than start time.'
    );
  }

  // Also protects the Admin approval endpoint:
  // older pending requests cannot bypass the new reservation window.
  assertWithinReservationWindow(start, end);

  // Preserve existing pending and approved reservation checks.
  const reservations = await query(
    `SELECT id,time_slot
     FROM reservations
     WHERE reservation_date=?
       AND status IN ('PENDING','APPROVED')
       AND (
         facility_id=?
         OR (facility_id IS NULL AND room_name=? AND building=?)
       )${excludeId ? ' AND id<>?' : ''}`,
    excludeId
      ? [date, facilityId, roomName, building, excludeId]
      : [date, facilityId, roomName, building]
  );

  for (const row of reservations) {
    const [a, b] = timeSlotParts(row.time_slot);

    // Exact-minute overlap checking is preserved.
    if (
      Number.isFinite(a) &&
      Number.isFinite(b) &&
      a < end &&
      b > start
    ) {
      throw new Error(
        'That room and time already has a pending or approved reservation. Please choose another available time.'
      );
    }
  }

  if (!facilityId) {
    throw Object.assign(
      new Error('A valid facility is required for availability checking.'),
      { status: 400 }
    );
  }

  const d = new Date(`${date}T12:00:00Z`);
  const day = d.toLocaleDateString('en-US', {
    weekday: 'long',
    timeZone: ORGROOM_TIME_ZONE
  });

  const schedules = await query(
    `SELECT start_time,end_time
     FROM weekly_room_schedules
     WHERE facility_id=?
       AND day_of_week=?
       AND is_active=1
       AND HOUR(start_time)<24
       AND HOUR(end_time)<24
       AND end_time>start_time
       AND UPPER(TRIM(activity_name)) NOT IN (
         'MONDAY','TUESDAY','WEDNESDAY','THURSDAY',
         'FRIDAY','SATURDAY','SUNDAY'
       )
       AND UPPER(TRIM(activity_name)) NOT LIKE 'APPROVED BY:%'
       AND (term_start IS NULL OR term_start<=?)
       AND (term_end IS NULL OR term_end>=?)`,
    [facilityId, day, date, date]
  );

  for (const row of schedules) {
    const a = dbTimeMinutes(row.start_time);
    const b = dbTimeMinutes(row.end_time);

    if (
      !Number.isFinite(a) ||
      !Number.isFinite(b) ||
      b <= a
    ) {
      continue;
    }

    if (a < end && b > start) {
      throw new Error(
        'That time is occupied by the room’s recurring schedule. Please choose another available time.'
      );
    }
  }
}
async function withReservationLock(key,work){
  const connection=await pool.getConnection();
  const lockName=`orgroom:reservation:${String(key).slice(0,180)}`;
  let locked=false;
  try{
    await connection.beginTransaction();
    const [lockRows]=await connection.query('SELECT GET_LOCK(?,10) AS acquired',[lockName]);
    locked=Number(lockRows?.[0]?.acquired)===1;
    if(!locked) throw new Error('The reservation system is busy. Please try again.');
    const result=await work(connection);
    await connection.commit();
    return result;
  }catch(error){
    try{await connection.rollback();}catch{}
    throw error;
  }finally{
    if(locked){try{await connection.query('SELECT RELEASE_LOCK(?)',[lockName]);}catch{}}
    connection.release();
  }
}


app.get('/api/health', async (_req, res) => {
  try {
    await dbQuery('SELECT 1');

    res.json({
      ok: true,
      database: true,
      emailConfigured: Boolean(
        emailGatewayUrl && emailGatewayKey
      )
    });
  } catch (e) {
    res.status(503).json({
      ok: false,
      database: false,
      message: 'Database connection failed.'
    });
  }
});

app.post('/api/auth/test-email', async (req, res) => {
  try {
    const admin = await requireAdminAuth(req, res);
    if (!admin) return;

    const configError = emailGatewayConfigurationMessage();

    if (configError) {
      return res.status(503).json({
        ok: false,
        message: configError
      });
    }

    const to = normalizeEmail(req.body.email || admin.email);

    await sendEmail({
      to,
      subject: 'ORGROOM Email Gateway Test',
      text: 'ORGROOM email gateway is configured correctly and can send email.',
      html: '<p>ORGROOM email gateway is configured correctly and can send email.</p>'
    });

    res.json({
      ok: true,
      message: `Test email sent successfully. Check ${to}.`
    });
  } catch (e) {
    res.status(502).json({
      ok: false,
      message: emailGatewayErrorMessage(e)
    });
  }
});

app.post('/api/auth/login/request-code', async (req,res) => { try { const email=normalizeEmail(req.body.email), password=req.body.password; if(!allowedEmail(email)||!password)return res.status(400).json({message:'Valid email and password are required.'}); const rows=await dbQuery('SELECT * FROM users WHERE email=? LIMIT 1',[email]); const user=rows[0]; if(!user||!Boolean(user.is_active)||!(await verifyPassword(password,user.password_hash)))return res.status(401).json({message:'Invalid email or password.'});
    if(user && /^[a-f0-9]{64}$/i.test(String(user.password_hash||''))){ const migrated=await bcrypt.hash(String(password),12); await dbQuery('UPDATE users SET password_hash=? WHERE id=?',[migrated,user.id]); user.password_hash=migrated; } if(Boolean(user.is_verified)){const token=await createSession(user.id);return res.json({message:'Login successful.',verified:true,user:profileFromUser(user),token,expiresInSeconds:SESSION_TTL_MS/1000});} try{await issueCode(email,'login',{userId:user.id});}catch(e){console.error(`ORGROOM login verification email failed: ${e.message||e}`);return res.status(503).json({message:'We could not send the verification email right now. Please try again.'});} res.json({message:'Your email is not verified yet. A 6-digit verification code was sent to your email. The code expires in 10 minutes.',verified:false,requiresVerification:true,expiresInSeconds:600}); }catch(e){res.status(400).json({message:e.message||'Unable to sign in.'})} });
app.post('/api/auth/login/verify', async(req,res)=>{try{const email=normalizeEmail(req.body.email);const user=(await dbQuery('SELECT * FROM users WHERE email=? LIMIT 1',[email]))[0];if(!user||!Boolean(user.is_active))return res.status(401).json({message:'Invalid verification request.'});if(Boolean(user.is_verified)){const token=await createSession(user.id);return res.json({message:'Login successful.',user:profileFromUser(user),token,expiresInSeconds:SESSION_TTL_MS/1000});}await consumeCode(email,'login',req.body.code);await dbQuery('UPDATE users SET is_verified=1 WHERE id=?',[user.id]);const token=await createSession(user.id);res.json({message:'Email verified. Sign-in successful.',user:profileFromUser({...user,is_verified:1}),token,expiresInSeconds:SESSION_TTL_MS/1000});}catch(e){res.status(401).json({message:['Invalid verification code.','This verification code has expired. Please request a new code.'].includes(e.message)?e.message:'Verification failed.'})}});
app.get('/api/auth/me',async(req,res)=>{try{const user=await requireAuth(req,res);if(!user)return;res.json({user:profileFromUser(user)});}catch(e){res.status(401).json({message:'Unable to restore your session.'});}});
app.post('/api/auth/logout',async(req,res)=>{try{const raw=String(req.headers[SESSION_COOKIELESS_HEADER]||'');if(raw.toLowerCase().startsWith('bearer '))await dbQuery('DELETE FROM auth_sessions WHERE token_hash=?',[hashSessionToken(raw.slice(7).trim())]);res.json({message:'Signed out.'});}catch(e){res.status(500).json({message:'Unable to sign out.'});}});

app.post('/api/auth/signup/request-code', (_req,res)=>res.status(410).json({message:'Public account registration is disabled. Contact an ORGROOM administrator for an account.'}));
app.post('/api/auth/signup/verify', (_req,res)=>res.status(410).json({message:'Public account registration is disabled.'}));
app.post('/api/auth/verification/resend',async(req,res)=>{try{const email=normalizeEmail(req.body.email),purpose=String(req.body.purpose||'');if(purpose!=='login'||!allowedEmail(email))return res.status(400).json({message:'Invalid verification request.'});const user=(await dbQuery('SELECT id,is_verified,is_active FROM users WHERE email=? LIMIT 1',[email]))[0];if(!user||!Boolean(user.is_active))return res.status(400).json({message:'Invalid verification request.'});if(Boolean(user.is_verified))return res.status(400).json({message:'This account is already verified. You can sign in normally.'});await issueCode(email,purpose,{userId:user.id});res.json({message:'A new 6-digit verification code was sent. The previous code is no longer valid. The new code expires in 10 minutes.',expiresInSeconds:600});}catch(e){if(String(e.message||'').includes('Please wait 30 seconds'))return res.status(429).json({message:e.message});console.error(`ORGROOM verification resend failed: ${e.message||e}`);res.status(503).json({message:'We could not send the verification email right now. Please try again later.'})}});


app.post('/api/auth/forgot-password/request-code',async(req,res)=>{try{const email=normalizeEmail(req.body.email);if(!allowedEmail(email))return res.status(400).json({message:'Use a valid @gmail.com or @cmdi.edu.ph email address.'});const exists=(await dbQuery('SELECT id FROM users WHERE email=? AND is_active=1 LIMIT 1',[email])).length; if(exists){try{await issueCode(email,'forgot');}catch(e){if(String(e.message||'').includes('Please wait 30 seconds'))return res.status(429).json({message:e.message});throw e;}} res.json({message:'If an ORGROOM account exists for this email, a password reset code has been sent.',expiresInSeconds:600});}catch(e){res.status(400).json({message:e.message||'Unable to send reset code.'})}});
app.post('/api/auth/forgot-password/reset',async(req,res)=>{try{const email=normalizeEmail(req.body.email);if(!strongPassword(req.body.newPassword))return res.status(400).json({message:'New password must be at least 8 characters and contain a letter and a number.'});await consumeCode(email,'forgot',req.body.code);const hash=await bcrypt.hash(req.body.newPassword,12);const result=await dbQuery('UPDATE users SET password_hash=? WHERE email=? AND is_active=1',[hash,email]);if(!result.affectedRows)return res.status(400).json({message:'Unable to reset the password with the supplied verification code.'});const resetUser=(await dbQuery('SELECT id FROM users WHERE email=? LIMIT 1',[email]))[0];if(resetUser) await dbQuery('DELETE FROM auth_sessions WHERE user_id=?',[resetUser.id]);res.json({message:'Password updated successfully. All existing sessions were signed out. You can now sign in.'});}catch(e){res.status(400).json({message:e.message||'Unable to reset password.'})}});

app.get('/api/users', async(req,res)=>{
  try{
    const admin=await requireAdminAuth(req,res);
    if(!admin) return;
    // Regular Admins must never receive Admin or Super Admin account records.
    // The actor comes from the authenticated session, not a client-supplied role.
    const rows=isSuperAdminRole(admin.role)
      ? await dbQuery(`
          SELECT id,name,email,role,organization,department,position,is_verified,is_active,created_at
          FROM users
          ORDER BY CASE WHEN UPPER(role)='SUPER_ADMIN' THEN 0 WHEN UPPER(role)='ADMIN' THEN 1 ELSE 2 END, name ASC, id ASC
        `)
      : await dbQuery(`
          SELECT id,name,email,role,organization,department,position,is_verified,is_active,created_at
          FROM users
          WHERE UPPER(role)='TEACHER'
          ORDER BY name ASC, id ASC
        `);
    res.set('Cache-Control','no-store, no-cache, must-revalidate, proxy-revalidate');
    res.json(rows.map(row=>({
      id:Number(row.id),
      name:row.name,
      email:row.email,
      role:String(row.role||'').toUpperCase(),
      organization:row.organization||'',
      department:row.department||'',
      position:row.position||'',
      isVerified:Boolean(row.is_verified),
      isActive:Boolean(row.is_active),
      createdAt:toUtcIso(row.created_at)
    })));
  }catch(e){
    console.error(`ORGROOM user list failed: ${e.message||e}`);
    res.status(500).json({message:'Unable to load user accounts.'});
  }
});

app.get('/api/users/capacity', async(req,res)=>{
  try{
    const admin=await requireAdminAuth(req,res);
    if(!admin) return;
    const rows=await dbQuery('SELECT COUNT(*) AS total FROM users');
    const currentCount=Number(rows[0]?.total||0);
    res.set('Cache-Control','no-store, no-cache, must-revalidate, proxy-revalidate');
    res.json({
      currentCount,
      maxAccounts:runtimeSystemSettings.maxAccounts,
      remainingSlots:Math.max(0,runtimeSystemSettings.maxAccounts-currentCount),
      isAtCapacity:currentCount>=runtimeSystemSettings.maxAccounts
    });
  }catch(e){
    console.error(`ORGROOM account capacity lookup failed: ${e.message||e}`);
    res.status(500).json({message:'Unable to load account capacity.'});
  }
});

app.post('/api/users', async(req,res)=>{
  let connection=null;
  let lockAcquired=false;
  let transactionStarted=false;
  try{
    const admin=await requireAdminAuth(req,res);
    if(!admin) return;

    const name=String(req.body.name||'').trim().slice(0,255);
    const email=normalizeEmail(req.body.email);
    const password=String(req.body.password||'');
    const role=normalizeRole(req.body.role);

    if(!name) return res.status(400).json({message:'Full name is required.'});
    if(!allowedEmail(email)) return res.status(400).json({message:'Only @gmail.com and @cmdi.edu.ph accounts are allowed.'});
    if(!['TEACHER','ADMIN'].includes(role)) return res.status(400).json({message:'Only Teacher and Admin accounts can be created here. SUPER_ADMIN accounts must use the secure one-time provisioning command.'});
    if(role==='ADMIN' && !isSuperAdminRole(admin.role)) return res.status(403).json({message:'Only the Super Admin can create Admin accounts.'});
    if(!strongPassword(password)) return res.status(400).json({message:'Password must be at least 8 characters and contain a letter and a number.'});

    const passwordHash=await bcrypt.hash(password,12);
    const organization=role==='ADMIN'?'Administration':'Academic Faculty';
    const department=role==='ADMIN'?'Administration':'Academic Faculty';
    const position=role==='ADMIN'?'Administrator':'Teacher';

    connection=await pool.getConnection();
    const [lockRows]=await connection.query('SELECT GET_LOCK(?, 15) AS acquired',[ACCOUNT_CAPACITY_LOCK_NAME]);
    lockAcquired=Number(lockRows[0]?.acquired)===1;
    if(!lockAcquired) return res.status(503).json({message:'Account creation is temporarily busy. Please try again.'});

    await connection.beginTransaction();
    transactionStarted=true;
    const [countRows]=await connection.query('SELECT COUNT(*) AS total FROM users');
    const currentCount=Number(countRows[0]?.total||0);
    if(currentCount>=runtimeSystemSettings.maxAccounts){
      const capacityError=new Error(`The ORGROOM account capacity has been reached (${currentCount} / ${runtimeSystemSettings.maxAccounts}). Increase the configured account limit before creating another. Deactivated accounts still count.`);
      capacityError.status=409;
      throw capacityError;
    }

    const [existing]=await connection.query('SELECT id FROM users WHERE LOWER(email)=LOWER(?) LIMIT 1',[email]);
    if(existing.length){
      const duplicateError=new Error('An ORGROOM account with this email already exists.');
      duplicateError.status=409;
      throw duplicateError;
    }

    const [createdResult]=await connection.query(
      'INSERT INTO users (name,email,password_hash,role,organization,department,position,is_verified,is_active) VALUES (?,?,?,?,?,?,?,0,1)',
      [name,email,passwordHash,role,organization,department,position]
    );
    const userId=Number(createdResult.insertId);
    await writeAuditEvent({
      actor: admin,
      action: 'USER_CREATED',
      entityType: 'USER',
      entityId: userId,
      newValues: { id: userId, name, email, role, organization, department, position, isActive: true, isVerified: false }
    }, async (sql, params = []) => {
      const [result] = await connection.query(sql, params);
      return result;
    });
    await connection.commit();
    transactionStarted=false;

    let verificationSent=true;
    try{ await issueCode(email,'login',{userId}); }
    catch(e){
      verificationSent=false;
      console.error(`ORGROOM account verification email failed for ${email}: ${e.message||e}`);
    }

    const created=(await dbQuery(`
      SELECT id,name,email,role,organization,department,position,is_verified,is_active,created_at
      FROM users WHERE id=?
    `,[userId]))[0];

    res.status(201).json({
      message:verificationSent?`${role==='ADMIN'?'Admin':'Teacher'} account created. A verification code was sent to the account email.`:`${role==='ADMIN'?'Admin':'Teacher'} account created. The user can sign in to request an email verification code.`,
      user:{
        id:Number(created.id),name:created.name,email:created.email,role:String(created.role).toUpperCase(),
        organization:created.organization||'',department:created.department||'',position:created.position||'',
        isVerified:Boolean(created.is_verified),isActive:Boolean(created.is_active),createdAt:toUtcIso(created.created_at)
      }
    });
  }catch(e){
    if(transactionStarted && connection){
      try{await connection.rollback();}catch{}
    }
    if(e.status===409 || e.status===503){
      return res.status(e.status).json({message:e.message});
    }
    if(String(e.code||'')==='ER_DUP_ENTRY') return res.status(409).json({message:'An ORGROOM account with this email already exists.'});
    console.error(`ORGROOM user creation failed: ${e.message||e}`);
    res.status(500).json({message:'Unable to create the account. Please check the entered information and try again.'});
  }finally{
    if(connection){
      if(lockAcquired){try{await connection.query('SELECT RELEASE_LOCK(?)',[ACCOUNT_CAPACITY_LOCK_NAME]);}catch{}}
      connection.release();
    }
  }
});

app.patch('/api/users/:id', async(req,res)=>{
  try{
    const actor=await requireAdminAuth(req,res);
    if(!actor) return;
    const targetId=Number(req.params.id);
    if(!Number.isInteger(targetId)||targetId<=0) return res.status(400).json({message:'Invalid user reference.'});
    if(targetId===Number(actor.id)) return res.status(403).json({message:'You cannot change your own role or account status here.'});
    const target=(await dbQuery('SELECT id,name,email,role,organization,department,position,is_active,is_verified FROM users WHERE id=? LIMIT 1',[targetId]))[0];
    if(!target) return res.status(404).json({message:'User account not found.'});
    const targetRole=normalizeRole(target.role);
    if(targetRole==='SUPER_ADMIN') return res.status(403).json({message:'The Super Admin account is protected and cannot be modified here.'});
    if(!isSuperAdminRole(actor.role) && targetRole!=='TEACHER') return res.status(403).json({message:'Admins can manage Teacher accounts only.'});

    if(req.body.isActive!==undefined && typeof req.body.isActive!=='boolean') return res.status(400).json({message:'Account status must be a boolean value.'});
    const nextRole=req.body.role===undefined?targetRole:normalizeRole(req.body.role);
    const nextActive=req.body.isActive===undefined?Boolean(target.is_active):req.body.isActive;
    const nextName=req.body.name===undefined?String(target.name||''):String(req.body.name||'').trim().slice(0,255);
    const nextEmail=req.body.email===undefined?normalizeEmail(target.email):normalizeEmail(req.body.email);
    if(!nextName) return res.status(400).json({message:'Full name is required.'});
    if(!allowedEmail(nextEmail)) return res.status(400).json({message:'Only @gmail.com and @cmdi.edu.ph accounts are allowed.'});
    if(!['TEACHER','ADMIN'].includes(nextRole)) return res.status(400).json({message:'Only Teacher and Admin roles are available for account management.'});
    if(!isSuperAdminRole(actor.role) && nextRole!=='TEACHER') return res.status(403).json({message:'Admins cannot assign or change accounts to the Admin role.'});
    const emailChanged=nextEmail!==normalizeEmail(target.email);
    const roleChanged=nextRole!==targetRole;
    const nextPosition=roleChanged?(nextRole==='ADMIN'?'Administrator':'Teacher'):(target.position||'');
    const nextOrganization=roleChanged?(nextRole==='ADMIN'?'Administration':'Academic Faculty'):(target.organization||'');
    const nextDepartment=roleChanged?(nextRole==='ADMIN'?'Administration':'Academic Faculty'):(target.department||'');
    if(emailChanged){
      const duplicate=(await dbQuery('SELECT id FROM users WHERE LOWER(email)=LOWER(?) AND id<>? LIMIT 1',[nextEmail,targetId]))[0];
      if(duplicate) return res.status(409).json({message:'Another ORGROOM account already uses that email address.'});
    }

    await dbQuery('UPDATE users SET name=?,email=?,role=?,position=?,organization=?,department=?,is_active=?,is_verified=? WHERE id=?',[
      nextName,nextEmail,nextRole,nextPosition,nextOrganization,nextDepartment,
      nextActive?1:0,emailChanged?0:(Boolean(target.is_verified)?1:0),targetId
    ]);
    if(!nextActive || emailChanged) await dbQuery('DELETE FROM auth_sessions WHERE user_id=?',[targetId]);
    if(emailChanged){
      await dbQuery('DELETE FROM verification_codes WHERE email IN (?,?)',[normalizeEmail(target.email),nextEmail]);
      if(nextActive){try{await issueCode(nextEmail,'login',{userId:targetId});}catch(e){console.error(`ORGROOM changed-email verification failed for ${nextEmail}: ${e.message||e}`);}}
    }
    const updated=(await dbQuery('SELECT id,name,email,role,organization,department,position,is_verified,is_active,created_at FROM users WHERE id=?',[targetId]))[0];
    await writeAuditEvent({
      actor,
      action: !Boolean(target.is_active) && nextActive ? 'USER_RESTORED' : 'USER_UPDATED',
      entityType: 'USER',
      entityId: targetId,
      previousValues: { name: target.name, email: target.email, role: targetRole, isActive: Boolean(target.is_active), isVerified: Boolean(target.is_verified) },
      newValues: { name: updated.name, email: updated.email, role: normalizeRole(updated.role), isActive: Boolean(updated.is_active), isVerified: Boolean(updated.is_verified) }
    });
    res.set('Cache-Control','no-store');
    res.json({message:emailChanged?'Account updated. The new email must be verified at the next sign-in.':'Account updated successfully.',user:{id:Number(updated.id),name:updated.name,email:updated.email,role:normalizeRole(updated.role),organization:updated.organization||'',department:updated.department||'',position:updated.position||'',isVerified:Boolean(updated.is_verified),isActive:Boolean(updated.is_active),createdAt:toUtcIso(updated.created_at)}});
  }catch(e){
    console.error(`ORGROOM user update failed: ${e.message||e}`);
    res.status(500).json({message:'Unable to update the account.'});
  }
});

app.delete('/api/users/:id', async(req,res)=>{
  try{
    const actor=await requireAdminAuth(req,res);
    if(!actor) return;
    const targetId=Number(req.params.id);
    if(!Number.isInteger(targetId)||targetId<=0) return res.status(400).json({message:'Invalid user reference.'});
    if(targetId===Number(actor.id)) return res.status(403).json({message:'You cannot deactivate your own account.'});
    const target=(await dbQuery('SELECT id,role,is_active FROM users WHERE id=? LIMIT 1',[targetId]))[0];
    if(!target) return res.status(404).json({message:'User account not found.'});
    const targetRole=normalizeRole(target.role);
    if(targetRole==='SUPER_ADMIN') return res.status(403).json({message:'The Super Admin account is protected.'});
    if(!isSuperAdminRole(actor.role) && targetRole!=='TEACHER') return res.status(403).json({message:'Admins can deactivate Teacher accounts only.'});
    await dbQuery('UPDATE users SET is_active=0 WHERE id=?',[targetId]);
    await dbQuery('DELETE FROM auth_sessions WHERE user_id=?',[targetId]);
    await writeAuditEvent({
      actor,
      action: 'USER_DEACTIVATED',
      entityType: 'USER',
      entityId: targetId,
      previousValues: { role: targetRole, isActive: Boolean(target.is_active) },
      newValues: { role: targetRole, isActive: false }
    });
    res.json({message:'Account deactivated. Reservation and account history have been preserved.'});
  }catch(e){
    console.error(`ORGROOM user deactivation failed: ${e.message||e}`);
    res.status(500).json({message:'Unable to deactivate the account.'});
  }
});


// ------------------------------------------------------------
// Super Admin system oversight, global configuration, and audit APIs
// ------------------------------------------------------------
app.get('/api/system/config', async (req, res) => {
  try {
    const user = await requireAuth(req, res);
    if (!user) return;
    res.set('Cache-Control', 'no-store');
    res.json({
      timeZone: ORGROOM_TIME_ZONE,
      maxAccounts: runtimeSystemSettings.maxAccounts,
      reservationStartMinutes: runtimeSystemSettings.reservationStartMinutes,
      reservationEndMinutes: runtimeSystemSettings.reservationEndMinutes
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to load the current system configuration.' });
  }
});

app.get('/api/super-admin/settings', async (req, res) => {
  const actor = await requireSuperAdminAuth(req, res);
  if (!actor) return;
  res.set('Cache-Control', 'no-store');
  res.json({ ...runtimeSystemSettings, timeZone: ORGROOM_TIME_ZONE });
});

app.put('/api/super-admin/settings', async (req, res) => {
  const actor = await requireSuperAdminAuth(req, res);
  if (!actor) return;

  let connection;
  let lockAcquired = false;
  let transactionStarted = false;
  try {
    const maxAccounts = Number(req.body.maxAccounts);
    const reservationStartMinutes = Number(req.body.reservationStartMinutes);
    const reservationEndMinutes = Number(req.body.reservationEndMinutes);
    const reason = String(req.body.reason || '').trim().slice(0, 2000);
    if (reason.length < 5) return res.status(400).json({ message: 'Provide a reason of at least five characters for changing global settings.' });

    if (!Number.isInteger(maxAccounts) || maxAccounts < 1 || maxAccounts > 1000) {
      return res.status(400).json({ message: 'Account capacity must be a whole number from 1 to 1,000.' });
    }
    if (
      !Number.isInteger(reservationStartMinutes) ||
      !Number.isInteger(reservationEndMinutes) ||
      reservationStartMinutes < 0 ||
      reservationEndMinutes > 1439 ||
      reservationStartMinutes >= reservationEndMinutes
    ) {
      return res.status(400).json({ message: 'Reservation start and end times must be valid minutes after midnight, with the start earlier than the end.' });
    }

    connection = await pool.getConnection();
    const [locks] = await connection.query('SELECT GET_LOCK(?, 15) AS acquired', [ACCOUNT_CAPACITY_LOCK_NAME]);
    lockAcquired = Number(locks[0]?.acquired) === 1;
    if (!lockAcquired) return res.status(503).json({ message: 'System settings are busy. Please try again.' });

    await connection.beginTransaction();
    transactionStarted = true;
    const [countRows] = await connection.query('SELECT COUNT(*) AS total FROM users');
    const currentCount = Number(countRows[0]?.total || 0);
    if (maxAccounts < currentCount) {
      throw Object.assign(new Error(`The account capacity cannot be lower than the current ${currentCount} accounts. Deactivated accounts are included.`), { status: 409 });
    }

    const [activeReservations] = await connection.query(
      `SELECT id,time_slot FROM reservations WHERE status IN ('PENDING','APPROVED')`
    );
    const outsideWindow = activeReservations.find(row => {
      const [start, end] = timeSlotParts(row.time_slot);
      return !isWithinReservationWindow(start, end, reservationStartMinutes, reservationEndMinutes);
    });
    if (outsideWindow) {
      throw Object.assign(new Error(`The new reservation window would exclude active reservation OR-${String(outsideWindow.id).padStart(3, '0')}. Resolve that reservation before narrowing the operating hours.`), { status: 409 });
    }

    const previousValues = { ...runtimeSystemSettings };
    const nextValues = { maxAccounts, reservationStartMinutes, reservationEndMinutes };
    for (const [key, value] of Object.entries({
      max_accounts: maxAccounts,
      reservation_start_minutes: reservationStartMinutes,
      reservation_end_minutes: reservationEndMinutes
    })) {
      await connection.query(
        `INSERT INTO orgroom_system_settings (setting_key,setting_value,updated_by_user_id)
         VALUES (?,?,?)
         ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value),updated_by_user_id=VALUES(updated_by_user_id),updated_at=CURRENT_TIMESTAMP`,
        [key, String(value), actor.id]
      );
    }
    await writeAuditEvent({
      actor,
      action: 'SYSTEM_SETTINGS_UPDATED',
      entityType: 'SYSTEM_SETTINGS',
      entityId: 'global',
      previousValues,
      newValues: nextValues,
      reason
    }, async (sql, params = []) => {
      const [result] = await connection.query(sql, params);
      return result;
    });
    await connection.commit();
    transactionStarted = false;
    await refreshRuntimeSystemSettings();
    res.json({ message: 'Global system settings updated.', ...runtimeSystemSettings, timeZone: ORGROOM_TIME_ZONE });
  } catch (error) {
    if (transactionStarted && connection) {
      try { await connection.rollback(); } catch {}
    }
    console.error(`ORGROOM system settings update failed: ${error.message || error}`);
    res.status(error.status || 500).json({ message: error.message || 'Unable to update global system settings.' });
  } finally {
    if (connection) {
      if (lockAcquired) {
        try { await connection.query('SELECT RELEASE_LOCK(?)', [ACCOUNT_CAPACITY_LOCK_NAME]); } catch {}
      }
      connection.release();
    }
  }
});

app.get('/api/super-admin/audit-logs', async (req, res) => {
  const actor = await requireSuperAdminAuth(req, res);
  if (!actor) return;
  try {
    const limit = Math.max(1, Math.min(200, Number(req.query.limit) || 100));
    const offset = Math.max(0, Number(req.query.offset) || 0);
    const rows = await dbQuery(
      `SELECT id,actor_user_id,actor_name,actor_email,actor_role,action,entity_type,entity_id,
              previous_values,new_values,reason,created_at
       FROM orgroom_audit_logs ORDER BY id DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    res.set('Cache-Control', 'no-store');
    res.json(rows.map(row => ({
      id: Number(row.id), actorUserId: row.actor_user_id == null ? null : Number(row.actor_user_id),
      actorName: row.actor_name, actorEmail: row.actor_email, actorRole: row.actor_role,
      action: row.action, entityType: row.entity_type, entityId: row.entity_id,
      previousValues: parseJsonColumn(row.previous_values), newValues: parseJsonColumn(row.new_values),
      reason: row.reason || '', createdAt: toUtcIso(row.created_at)
    })));
  } catch (error) {
    res.status(500).json({ message: 'Unable to load the audit log.' });
  }
});

app.get('/api/super-admin/reports', async (req, res) => {
  const actor = await requireSuperAdminAuth(req, res);
  if (!actor) return;
  try {
    const [userRows, reservationRows, facilityRows, adminActivityRows] = await Promise.all([
      dbQuery(`SELECT COUNT(*) AS total,
        SUM(is_active=1) AS active,
        SUM(UPPER(role)='TEACHER') AS teachers,
        SUM(UPPER(role)='ADMIN') AS admins,
        SUM(UPPER(role)='SUPER_ADMIN') AS superAdmins
        FROM users`),
      dbQuery(`SELECT status,COUNT(*) AS total FROM reservations GROUP BY status`),
      dbQuery(`SELECT f.id,f.name,f.building,f.status,
          COUNT(r.id) AS reservationCount,
          SUM(CASE WHEN r.status='APPROVED' THEN 1 ELSE 0 END) AS approvedCount,
          SUM(CASE WHEN r.status='PENDING' THEN 1 ELSE 0 END) AS pendingCount,
          COALESCE(SUM(CASE WHEN r.status='APPROVED' THEN r.attendees ELSE 0 END),0) AS approvedAttendees
        FROM facilities f LEFT JOIN reservations r ON r.facility_id=f.id
        GROUP BY f.id,f.name,f.building,f.status
        ORDER BY reservationCount DESC,f.building,f.name`),
      dbQuery(`SELECT actor_user_id,actor_name,actor_email,actor_role,COUNT(*) AS actionCount,
          MAX(created_at) AS lastActivity
        FROM orgroom_audit_logs
        WHERE actor_role IN ('ADMIN','SUPER_ADMIN')
        GROUP BY actor_user_id,actor_name,actor_email,actor_role
        ORDER BY actionCount DESC,lastActivity DESC LIMIT 20`)
    ]);
    const reservationStats = Object.fromEntries(reservationRows.map(row => [String(row.status).toUpperCase(), Number(row.total || 0)]));
    const user = userRows[0] || {};
    res.set('Cache-Control', 'no-store');
    res.json({
      users: {
        total: Number(user.total || 0), active: Number(user.active || 0),
        teachers: Number(user.teachers || 0), admins: Number(user.admins || 0),
        superAdmins: Number(user.superAdmins || 0)
      },
      reservations: {
        total: Object.values(reservationStats).reduce((sum, value) => sum + value, 0),
        pending: reservationStats.PENDING || 0, approved: reservationStats.APPROVED || 0,
        rejected: reservationStats.REJECTED || 0, cancelled: reservationStats.CANCELLED || 0
      },
      facilities: facilityRows.map(row => ({
        id: Number(row.id), name: row.name, building: row.building, status: row.status,
        reservationCount: Number(row.reservationCount || 0), approvedCount: Number(row.approvedCount || 0),
        pendingCount: Number(row.pendingCount || 0), approvedAttendees: Number(row.approvedAttendees || 0)
      })),
      adminActivity: adminActivityRows.map(row => ({
        actorUserId: row.actor_user_id == null ? null : Number(row.actor_user_id),
        actorName: row.actor_name, actorEmail: row.actor_email, actorRole: row.actor_role,
        actionCount: Number(row.actionCount || 0), lastActivity: toUtcIso(row.lastActivity)
      }))
    });
  } catch (error) {
    console.error(`ORGROOM reports failed: ${error.message || error}`);
    res.status(500).json({ message: 'Unable to load system reports.' });
  }
});

app.get('/api/super-admin/reservations/:id/history', async (req, res) => {
  const actor = await requireSuperAdminAuth(req, res);
  if (!actor) return;
  try {
    const reservationId = Number(String(req.params.id).replace(/^OR-/i, ''));
    if (!Number.isInteger(reservationId) || reservationId <= 0) return res.status(400).json({ message: 'Invalid reservation reference.' });
    const rows = await dbQuery(
      `SELECT * FROM reservation_decision_history WHERE reservation_id=? ORDER BY id DESC`,
      [reservationId]
    );
    res.json(rows.map(row => ({
      id: Number(row.id), reservationId: Number(row.reservation_id), fromStatus: row.from_status,
      toStatus: row.to_status, actionType: row.action_type, actorUserId: row.actor_user_id == null ? null : Number(row.actor_user_id),
      actorName: row.actor_name, actorRole: row.actor_role, reason: row.reason || '', createdAt: toUtcIso(row.created_at)
    })));
  } catch (error) {
    res.status(500).json({ message: 'Unable to load reservation decision history.' });
  }
});

app.get('/api/super-admin/weekly-schedules', async (req, res) => {
  const actor = await requireSuperAdminAuth(req, res);
  if (!actor) return;
  try {
    const rows = await dbQuery('SELECT * FROM weekly_room_schedules ORDER BY facility_id,day_of_week,start_time,id');
    res.json(rows.map(mapWeekly));
  } catch (error) {
    res.status(500).json({ message: 'Unable to load weekly schedules for management.' });
  }
});

function normalizeSchedulePayload(body = {}) {
  const dayOfWeek = String(body.dayOfWeek || '').trim();
  const allowedDays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const timeValue = value => {
    const match = String(value || '').trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (!match) return null;
    const hour = Number(match[1]), minute = Number(match[2]), second = Number(match[3] || 0);
    if (hour > 23 || minute > 59 || second > 59) return null;
    return { minutes: hour * 60 + minute, sql: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}` };
  };
  const start = timeValue(body.startTime);
  const end = timeValue(body.endTime);
  const dateValue = value => !value || /^\d{4}-\d{2}-\d{2}$/.test(String(value));
  if (!allowedDays.includes(dayOfWeek)) throw Object.assign(new Error('Choose a valid day of the week.'), { status: 400 });
  if (!start || !end || end.minutes <= start.minutes) throw Object.assign(new Error('Enter valid schedule times and make sure the end is later than the start.'), { status: 400 });
  if (!String(body.activityName || '').trim()) throw Object.assign(new Error('An activity or course name is required.'), { status: 400 });
  if (!dateValue(body.termStart) || !dateValue(body.termEnd)) throw Object.assign(new Error('Term dates must use YYYY-MM-DD.'), { status: 400 });
  if (body.termStart && body.termEnd && body.termEnd < body.termStart) throw Object.assign(new Error('The term end date cannot be earlier than the term start date.'), { status: 400 });
  const facilityId = Number(body.facilityId);
  if (!Number.isInteger(facilityId) || facilityId <= 0) throw Object.assign(new Error('Choose a valid facility.'), { status: 400 });
  return {
    facilityId, dayOfWeek, startTime: start.sql, endTime: end.sql,
    activityName: String(body.activityName).trim().slice(0, 255),
    courseCode: String(body.courseCode || '').trim().slice(0, 80),
    courseTitle: String(body.courseTitle || body.activityName).trim().slice(0, 255),
    program: String(body.program || '').trim().slice(0, 255),
    yearBlock: String(body.yearBlock || '').trim().slice(0, 255),
    instructor: String(body.instructor || '').trim().slice(0, 255),
    termStart: body.termStart || null, termEnd: body.termEnd || null,
    termDatesText: String(body.termDatesText || '').trim().slice(0, 255),
    isActive: body.isActive === undefined ? true : Boolean(body.isActive)
  };
}

async function assertWeeklyScheduleNoOverlap(data, excludeId = null) {
  const existing = await dbQuery(
    `SELECT id,start_time,end_time,term_start,term_end
     FROM weekly_room_schedules
     WHERE facility_id=? AND day_of_week=? AND is_active=1
       AND (? IS NULL OR id<>?)`,
    [data.facilityId, data.dayOfWeek, excludeId, excludeId]
  );
  const nextStart = dbTimeMinutes(data.startTime);
  const nextEnd = dbTimeMinutes(data.endTime);
  for (const row of existing) {
    const timeOverlap = nextStart < dbTimeMinutes(row.end_time) && dbTimeMinutes(row.start_time) < nextEnd;
    const dateOverlap =
      (!row.term_end || !data.termStart || String(row.term_end).slice(0,10) >= data.termStart) &&
      (!data.termEnd || !row.term_start || String(data.termEnd) >= String(row.term_start).slice(0,10));
    if (timeOverlap && dateOverlap) {
      throw Object.assign(new Error(`This schedule overlaps existing active schedule record #${row.id} for the same room and day.`), { status: 409 });
    }
  }
}

app.post('/api/super-admin/weekly-schedules', async (req, res) => {
  const actor = await requireSuperAdminAuth(req, res);
  if (!actor) return;
  try {
    const data = normalizeSchedulePayload(req.body);
    const reason = String(req.body.reason || '').trim();
    if (reason.length < 5) return res.status(400).json({ message: 'Provide a reason of at least five characters for the schedule change.' });
    const facility = (await dbQuery('SELECT id,name,building FROM facilities WHERE id=? LIMIT 1', [data.facilityId]))[0];
    if (!facility) return res.status(404).json({ message: 'The selected facility was not found.' });
    if (data.isActive) await assertWeeklyScheduleNoOverlap(data);
    const result = await dbQuery(
      `INSERT INTO weekly_room_schedules
       (facility_id,day_of_week,start_time,end_time,activity_name,course_code,course_title,program,year_block,instructor,term_start,term_end,term_dates_text,is_active)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [data.facilityId,data.dayOfWeek,data.startTime,data.endTime,data.activityName,data.courseCode,data.courseTitle,data.program,data.yearBlock,data.instructor,data.termStart,data.termEnd,data.termDatesText,data.isActive ? 1 : 0]
    );
    const row = (await dbQuery('SELECT * FROM weekly_room_schedules WHERE id=?', [result.insertId]))[0];
    await writeAuditEvent({ actor, action: 'WEEKLY_SCHEDULE_CREATED', entityType: 'WEEKLY_ROOM_SCHEDULE', entityId: result.insertId, newValues: data, reason });
    res.status(201).json(mapWeekly(row));
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Unable to create the weekly schedule.' });
  }
});

app.patch('/api/super-admin/weekly-schedules/:id', async (req, res) => {
  const actor = await requireSuperAdminAuth(req, res);
  if (!actor) return;
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: 'Invalid weekly schedule reference.' });
    const current = (await dbQuery('SELECT * FROM weekly_room_schedules WHERE id=? LIMIT 1', [id]))[0];
    if (!current) return res.status(404).json({ message: 'Weekly schedule not found.' });
    const merged = normalizeSchedulePayload({
      facilityId: req.body.facilityId ?? current.facility_id,
      dayOfWeek: req.body.dayOfWeek ?? current.day_of_week,
      startTime: req.body.startTime ?? String(current.start_time).slice(0, 8),
      endTime: req.body.endTime ?? String(current.end_time).slice(0, 8),
      activityName: req.body.activityName ?? current.activity_name,
      courseCode: req.body.courseCode ?? current.course_code,
      courseTitle: req.body.courseTitle ?? current.course_title,
      program: req.body.program ?? current.program,
      yearBlock: req.body.yearBlock ?? current.year_block,
      instructor: req.body.instructor ?? current.instructor,
      termStart: req.body.termStart ?? current.term_start,
      termEnd: req.body.termEnd ?? current.term_end,
      termDatesText: req.body.termDatesText ?? current.term_dates_text,
      isActive: req.body.isActive ?? Boolean(current.is_active)
    });
    const reason = String(req.body.reason || '').trim();
    if (reason.length < 5) return res.status(400).json({ message: 'Provide a reason of at least five characters for the schedule change.' });
    const facility = (await dbQuery('SELECT id FROM facilities WHERE id=? LIMIT 1', [merged.facilityId]))[0];
    if (!facility) return res.status(404).json({ message: 'The selected facility was not found.' });
    if (merged.isActive) await assertWeeklyScheduleNoOverlap(merged, id);
    await dbQuery(
      `UPDATE weekly_room_schedules SET facility_id=?,day_of_week=?,start_time=?,end_time=?,activity_name=?,course_code=?,course_title=?,program=?,year_block=?,instructor=?,term_start=?,term_end=?,term_dates_text=?,is_active=? WHERE id=?`,
      [merged.facilityId,merged.dayOfWeek,merged.startTime,merged.endTime,merged.activityName,merged.courseCode,merged.courseTitle,merged.program,merged.yearBlock,merged.instructor,merged.termStart,merged.termEnd,merged.termDatesText,merged.isActive ? 1 : 0,id]
    );
    const row = (await dbQuery('SELECT * FROM weekly_room_schedules WHERE id=?', [id]))[0];
    await writeAuditEvent({ actor, action: 'WEEKLY_SCHEDULE_UPDATED', entityType: 'WEEKLY_ROOM_SCHEDULE', entityId: id, previousValues: mapWeekly(current), newValues: merged, reason });
    res.json(mapWeekly(row));
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Unable to update the weekly schedule.' });
  }
});

app.delete('/api/super-admin/weekly-schedules/:id', async (req, res) => {
  const actor = await requireSuperAdminAuth(req, res);
  if (!actor) return;
  try {
    const id = Number(req.params.id);
    const reason = String(req.body?.reason || '').trim();
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: 'Invalid weekly schedule reference.' });
    if (reason.length < 5) return res.status(400).json({ message: 'Provide a reason of at least five characters to deactivate this schedule.' });
    const current = (await dbQuery('SELECT * FROM weekly_room_schedules WHERE id=? LIMIT 1', [id]))[0];
    if (!current) return res.status(404).json({ message: 'Weekly schedule not found.' });
    await dbQuery('UPDATE weekly_room_schedules SET is_active=0 WHERE id=?', [id]);
    await writeAuditEvent({ actor, action: 'WEEKLY_SCHEDULE_DEACTIVATED', entityType: 'WEEKLY_ROOM_SCHEDULE', entityId: id, previousValues: mapWeekly(current), newValues: { ...mapWeekly(current), isActive: false }, reason });
    res.json({ message: 'Weekly schedule deactivated. The original record is preserved.' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to deactivate the weekly schedule.' });
  }
});

app.patch('/api/super-admin/facilities/:id', async (req, res) => {
  const actor = await requireSuperAdminAuth(req, res);
  if (!actor) return;
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: 'Invalid facility reference.' });
    const current = (await dbQuery('SELECT * FROM facilities WHERE id=? LIMIT 1', [id]))[0];
    if (!current) return res.status(404).json({ message: 'Facility not found.' });
    const reason = String(req.body.reason || '').trim();
    if (reason.length < 5) return res.status(400).json({ message: 'Provide a reason of at least five characters for the facility change.' });
    const name = String(req.body.name ?? current.name).trim().slice(0, 255);
    const building = String(req.body.building ?? current.building).trim().slice(0, 255);
    const buildingCode = String(req.body.buildingCode ?? current.building_code).trim().slice(0, 100);
    const type = String(req.body.type ?? current.type).trim().slice(0, 100);
    const description = String(req.body.description ?? current.description ?? '').trim().slice(0, 5000);
    const capacityValue = req.body.capacity === undefined ? current.capacity : req.body.capacity;
    const capacity = capacityValue === '' || capacityValue == null ? null : Number(capacityValue);
    const status = String(req.body.status ?? current.status ?? 'AVAILABLE').toUpperCase();
    const imageUrl = String(req.body.imageUrl ?? current.image_url ?? '').trim().slice(0, 1000);
    const statusValues = ['AVAILABLE','MAINTENANCE','INACTIVE','CLOSED','DISABLED','UNAVAILABLE'];
    if (!name || !building || !buildingCode || !type) return res.status(400).json({ message: 'Room name, building, building code, and facility type are required.' });
    if (capacity !== null && (!Number.isInteger(capacity) || capacity < 1 || capacity > 10000)) return res.status(400).json({ message: 'Capacity must be blank or a whole number from 1 to 10,000.' });
    if (!statusValues.includes(status)) return res.status(400).json({ message: 'Choose a valid facility status.' });
    if (imageUrl) {
      try { const url = new URL(imageUrl); if (!['http:', 'https:'].includes(url.protocol)) throw new Error('invalid'); }
      catch { return res.status(400).json({ message: 'Facility image must be a valid HTTP or HTTPS URL.' }); }
    }
    let amenities;
    if (req.body.amenities === undefined) amenities = current.amenities || '[]';
    else {
      const values = Array.isArray(req.body.amenities) ? req.body.amenities : String(req.body.amenities).split(',');
      amenities = JSON.stringify(values.map(value => String(value).trim()).filter(Boolean).slice(0, 30));
    }
    await dbQuery(
      `UPDATE facilities SET name=?,building=?,building_code=?,capacity=?,type=?,description=?,status=?,amenities=?,image_url=? WHERE id=?`,
      [name,building,buildingCode,capacity,type,description,status,amenities,imageUrl || null,id]
    );
    const updated = (await dbQuery('SELECT * FROM facilities WHERE id=?', [id]))[0];
    await writeAuditEvent({
      actor, action: 'FACILITY_UPDATED', entityType: 'FACILITY', entityId: id,
      previousValues: mapFacility(current), newValues: mapFacility(updated), reason
    });
    res.json(mapFacility(updated));
  } catch (error) {
    console.error(`ORGROOM facility update failed: ${error.message || error}`);
    res.status(error.status || 500).json({ message: error.message || 'Unable to update the facility.' });
  }
});

app.post('/api/super-admin/reservations/:id/override', async (req, res) => {
  const actor = await requireSuperAdminAuth(req, res);
  if (!actor) return;
  try {
    const id = Number(String(req.params.id).replace(/^OR-/i, ''));
    const nextStatus = String(req.body.status || '').toUpperCase();
    const reason = String(req.body.reason || '').trim().slice(0, 2000);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: 'Invalid reservation reference.' });
    if (!['PENDING','APPROVED','REJECTED','CANCELLED'].includes(nextStatus)) return res.status(400).json({ message: 'Choose a valid reservation status.' });
    if (reason.length < 5) return res.status(400).json({ message: 'A reason of at least five characters is required for every Super Admin override.' });
    const current = (await dbQuery('SELECT * FROM reservations WHERE id=? LIMIT 1', [id]))[0];
    if (!current) return res.status(404).json({ message: 'Reservation not found.' });
    if (String(current.status).toUpperCase() === nextStatus) return res.status(409).json({ message: `This reservation is already ${nextStatus}.` });
    const facilityId = Number(current.facility_id) || null;
    const lockKey = `${facilityId || `${current.building}|${current.room_name}`}|${String(current.reservation_date).slice(0, 10)}`;
    const updated = await withReservationLock(lockKey, async connection => {
      const query = async (sql, params = []) => {
        const [rows] = await connection.query(sql, params);
        return rows;
      };
      const locked = (await query('SELECT * FROM reservations WHERE id=? FOR UPDATE', [id]))[0];
      if (!locked) return null;
      if (String(locked.status).toUpperCase() === nextStatus) {
        throw Object.assign(new Error(`This reservation is already ${nextStatus}.`), { status: 409 });
      }
      if (nextStatus === 'PENDING' && normalizeRole(locked.user_role) === 'SUPER_ADMIN') {
        throw Object.assign(new Error('Super Admin reservations are automatically approved and cannot be returned to the pending review queue.'), { status: 400 });
      }
      if (['PENDING','APPROVED'].includes(nextStatus)) {
        const facilityId = Number(locked.facility_id) || null;
        const facility = facilityId
          ? (await query('SELECT * FROM facilities WHERE id=? LIMIT 1', [facilityId]))[0]
          : null;
        validateReservationInput({
          facility,
          facilityId,
          roomName: locked.room_name,
          building: locked.building,
          date: String(locked.reservation_date).slice(0, 10),
          timeSlot: locked.time_slot,
          attendees: locked.attendees,
          purpose: locked.purpose
        });
        await assertNoConflict({
          facilityId,
          roomName: locked.room_name,
          building: locked.building,
          date: String(locked.reservation_date).slice(0, 10),
          timeSlot: locked.time_slot,
          excludeId: id,
          query
        });
      }
      const previousStatus = locked.status;
      const note = `Super Admin override: ${reason}`;
      await query(
        `UPDATE reservations SET status=?,admin_notes=?,decision_by_user_id=?,decision_at=NOW(),decision_source='SUPER_ADMIN_OVERRIDE' WHERE id=?`,
        [nextStatus, note, actor.id, id]
      );
      await writeReservationDecisionHistory({
        reservationId: id, fromStatus: previousStatus, toStatus: nextStatus,
        actionType: 'SUPER_ADMIN_OVERRIDE', actor, reason
      }, query);
      await writeAuditEvent({
        actor, action: 'RESERVATION_OVERRIDDEN', entityType: 'RESERVATION', entityId: id,
        previousValues: { status: previousStatus, decisionSource: locked.decision_source || 'MANUAL' },
        newValues: { status: nextStatus, decisionSource: 'SUPER_ADMIN_OVERRIDE' }, reason
      }, query);
      const rows = await query(
        `SELECT r.*,du.name AS decision_by_name,du.email AS decision_by_email
         FROM reservations r LEFT JOIN users du ON du.id=r.decision_by_user_id WHERE r.id=?`,
        [id]
      );
      return mapReservation(rows[0]);
    });
    if (!updated) return res.status(404).json({ message: 'Reservation not found.' });
    await notifyReservationEvent(updated.dbId, 'RESERVATION_OVERRIDDEN');
    res.json(updated);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Unable to override the reservation decision.' });
  }
});

// ------------------------------------------------------------
// Teacher-to-Admin persistent messaging API
// ------------------------------------------------------------
const chatSendTimes = new Map();
const CHAT_MESSAGE_MAX_LENGTH = 4000;
const CHAT_SEND_INTERVAL_MS = 700;
function chatConversationId(value){
  if(!/^\d+$/.test(String(value||'')))return null;
  const id=Number(value);
  return Number.isSafeInteger(id)&&id>0?id:null;
}
async function chatUnreadCount(conversationId,user){
  const admin=isAdminRole(user.role);
  const rows=await dbQuery(`
    SELECT COUNT(*) AS count
    FROM orgroom_chat_messages m
    INNER JOIN orgroom_chat_conversations c ON c.id=m.conversation_id
    LEFT JOIN orgroom_chat_reads rd
      ON rd.conversation_id=c.id AND rd.user_id=?
    WHERE m.conversation_id=?
      AND m.id>COALESCE(rd.last_read_message_id,0)
      AND ${admin ? 'm.sender_user_id=c.teacher_user_id' : '(m.sender_user_id IS NULL OR m.sender_user_id<>c.teacher_user_id)'}
  `,[Number(user.id),Number(conversationId)]);
  return Number(rows[0]?.count||0);
}
async function chatConversationForUser(conversationId,user){
  const rows=await dbQuery('SELECT * FROM orgroom_chat_conversations WHERE id=? LIMIT 1',[conversationId]);
  const conversation=rows[0];
  if(!conversation)return null;
  if(!isAdminRole(user.role)&&Number(conversation.teacher_user_id)!==Number(user.id))return null;
  return conversation;
}
async function ensureTeacherConversation(user){
  await dbQuery(`INSERT INTO orgroom_chat_conversations (teacher_user_id) VALUES (?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,[Number(user.id)]);
  const rows=await dbQuery('SELECT * FROM orgroom_chat_conversations WHERE teacher_user_id=? LIMIT 1',[Number(user.id)]);
  return rows[0]||null;
}
async function createChatNotifications(conversation,message,sender){
  try{
    const recipients=isAdminRole(sender.role)
      ? await dbQuery("SELECT id,name FROM users WHERE LOWER(role) IN ('admin','super_admin') AND is_active=1 AND is_verified=1 AND id<>?",[Number(sender.id)])
      : await dbQuery("SELECT id,name FROM users WHERE LOWER(role) IN ('admin','super_admin') AND is_active=1 AND is_verified=1 ORDER BY id");
    if(isAdminRole(sender.role)){
      const teacherId=Number(conversation.teacher_user_id);
      if(teacherId){
        const teacher=(await dbQuery('SELECT id FROM users WHERE id=? AND is_active=1',[teacherId]))[0];
        if(teacher) recipients.push({id:teacherId,name:'Teacher'});
      }
    }
    const preview=String(message.message_text||'').replace(/\s+/g,' ').slice(0,180);
    const title=isAdminRole(sender.role)?'New Admin reply':'New message from Teacher';
    const messageText=`${sender.name||'ORGROOM user'}: ${preview}`;
    for(const recipient of recipients){
      await dbQuery(
        `INSERT INTO notifications (recipient_user_id,notification_type,reservation_id,event_key,title,message)
         VALUES (?,'CHAT_MESSAGE',NULL,?,?,?)
         ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
        [Number(recipient.id),`chat:${Number(conversation.id)}:${Number(message.id)}:${Number(recipient.id)}`,title,messageText]
      );
    }
  }catch(error){
    // A notification write must never turn an already-saved message into a failed send.
    console.error(`ORGROOM chat notification creation failed: ${error.message||error}`);
  }
}

app.get('/api/chat/conversation',async(req,res)=>{
  try{
    const user=await requireAuth(req,res);if(!user)return;
    if(isAdminRole(user.role))return res.status(403).json({message:'Use the shared Admin inbox.'});
    if(normalizeRole(user.role)!=='TEACHER')return res.status(403).json({message:'Teacher messaging access is required.'});
    const rows=await dbQuery(`
      SELECT c.*,u.name AS teacher_name,
        (SELECT m.id FROM orgroom_chat_messages m WHERE m.conversation_id=c.id ORDER BY m.id DESC LIMIT 1) AS last_message_id,
        (SELECT m.message_text FROM orgroom_chat_messages m WHERE m.conversation_id=c.id ORDER BY m.id DESC LIMIT 1) AS last_message,
        (SELECT m.created_at FROM orgroom_chat_messages m WHERE m.conversation_id=c.id ORDER BY m.id DESC LIMIT 1) AS last_message_at,
        (SELECT m.sender_user_id FROM orgroom_chat_messages m WHERE m.conversation_id=c.id ORDER BY m.id DESC LIMIT 1) AS last_sender_id,
        (SELECT m.id FROM orgroom_chat_messages m WHERE m.conversation_id=c.id AND (m.sender_user_id IS NULL OR m.sender_user_id<>c.teacher_user_id) ORDER BY m.id DESC LIMIT 1) AS last_admin_message_id,
        (SELECT m.message_text FROM orgroom_chat_messages m WHERE m.conversation_id=c.id AND (m.sender_user_id IS NULL OR m.sender_user_id<>c.teacher_user_id) ORDER BY m.id DESC LIMIT 1) AS last_admin_message,
        (SELECT m.created_at FROM orgroom_chat_messages m WHERE m.conversation_id=c.id AND (m.sender_user_id IS NULL OR m.sender_user_id<>c.teacher_user_id) ORDER BY m.id DESC LIMIT 1) AS last_admin_message_at
      FROM orgroom_chat_conversations c
      LEFT JOIN users u ON u.id=c.teacher_user_id
      WHERE c.teacher_user_id=? LIMIT 1
    `,[Number(user.id)]);
    const conversation=rows[0]||null;
    const unreadCount=conversation?await chatUnreadCount(conversation.id,user):0;
    res.set('Cache-Control','no-store');
    res.json({conversation:conversation?{id:Number(conversation.id),teacherName:conversation.teacher_name||user.name,updatedAt:toUtcIso(conversation.updated_at),lastMessageId:conversation.last_message_id==null?null:Number(conversation.last_message_id),lastMessage:conversation.last_message||'',lastMessageAt:toUtcIso(conversation.last_message_at || conversation.updated_at),lastSenderId:conversation.last_sender_id==null?null:Number(conversation.last_sender_id),lastAdminMessageId:conversation.last_admin_message_id==null?null:Number(conversation.last_admin_message_id),lastAdminMessage:conversation.last_admin_message||'',lastAdminMessageAt:toUtcIso(conversation.last_admin_message_at || conversation.updated_at)}:null,unreadCount});
  }catch(e){console.error('Chat conversation lookup failed:',e.message);res.status(500).json({message:'Unable to load your conversation.'});}
});

app.post('/api/chat/conversation',async(req,res)=>{
  try{
    const user=await requireAuth(req,res);if(!user)return;
    if(normalizeRole(user.role)!=='TEACHER')return res.status(403).json({message:'Only Teachers can start a Teacher-to-Admin conversation.'});
    const conversation=await ensureTeacherConversation(user);
    if(!conversation)return res.status(500).json({message:'Unable to create your conversation.'});
    res.json({conversation:{id:Number(conversation.id),teacherName:user.name,updatedAt:toUtcIso(conversation.updated_at)}});
  }catch(e){console.error('Chat conversation creation failed:',e.message);res.status(500).json({message:'Unable to start your conversation.'});}
});

app.get('/api/chat/inbox',async(req,res)=>{
  try{
    const user=await requireAdminAuth(req,res);if(!user)return;
    const rows=await dbQuery(`
      SELECT c.id,c.teacher_user_id,c.created_at,c.updated_at,u.name AS teacher_name,u.email AS teacher_email,
        (SELECT m.message_text FROM orgroom_chat_messages m WHERE m.conversation_id=c.id ORDER BY m.id DESC LIMIT 1) AS last_message,
        (SELECT m.created_at FROM orgroom_chat_messages m WHERE m.conversation_id=c.id ORDER BY m.id DESC LIMIT 1) AS last_message_at,
        (SELECT m.id FROM orgroom_chat_messages m WHERE m.conversation_id=c.id ORDER BY m.id DESC LIMIT 1) AS last_message_id,
        (SELECT m.id FROM orgroom_chat_messages m WHERE m.conversation_id=c.id AND m.sender_user_id=c.teacher_user_id ORDER BY m.id DESC LIMIT 1) AS last_teacher_message_id,
        (SELECT m.message_text FROM orgroom_chat_messages m WHERE m.conversation_id=c.id AND m.sender_user_id=c.teacher_user_id ORDER BY m.id DESC LIMIT 1) AS last_teacher_message,
        (SELECT m.created_at FROM orgroom_chat_messages m WHERE m.conversation_id=c.id AND m.sender_user_id=c.teacher_user_id ORDER BY m.id DESC LIMIT 1) AS last_teacher_message_at,
        (SELECT COUNT(*) FROM orgroom_chat_messages m
          LEFT JOIN orgroom_chat_reads rd ON rd.conversation_id=c.id AND rd.user_id=?
          WHERE m.conversation_id=c.id AND m.id>COALESCE(rd.last_read_message_id,0)
          AND m.sender_user_id=c.teacher_user_id) AS unread_count
      FROM orgroom_chat_conversations c
      LEFT JOIN users u ON u.id=c.teacher_user_id
      ORDER BY COALESCE(last_message_at,c.updated_at) DESC,c.id DESC
    `,[Number(user.id)]);
    res.set('Cache-Control','no-store');
    res.json({conversations:rows.map(r=>({id:Number(r.id),teacherId:r.teacher_user_id==null?null:Number(r.teacher_user_id),teacherName:r.teacher_name||'Former Teacher account',teacherEmail:r.teacher_email||'',lastMessage:r.last_message||'',lastMessageAt:toUtcIso(r.last_message_at || r.updated_at),lastMessageId:r.last_message_id==null?null:Number(r.last_message_id),lastTeacherMessageId:r.last_teacher_message_id==null?null:Number(r.last_teacher_message_id),lastTeacherMessage:r.last_teacher_message||'',lastTeacherMessageAt:toUtcIso(r.last_teacher_message_at || r.updated_at),unreadCount:Number(r.unread_count||0)}))});
  }catch(e){console.error('Chat inbox failed:',e.message);res.status(500).json({message:'Unable to load the Admin inbox.'});}
});

app.get('/api/chat/conversations/:id/messages',async(req,res)=>{
  try{
    const user=await requireAuth(req,res);if(!user)return;
    if(!isAdminRole(user.role)&&normalizeRole(user.role)!=='TEACHER')return res.status(403).json({message:'Messaging access is required.'});
    const id=chatConversationId(req.params.id);if(!id)return res.status(400).json({message:'Invalid conversation.'});
    const conversation=await chatConversationForUser(id,user);if(!conversation)return res.status(404).json({message:'Conversation not found.'});
    const rows=await dbQuery(`
      SELECT m.id,m.conversation_id,m.sender_user_id,m.message_text,m.created_at,u.name AS sender_name,u.role AS sender_role
      FROM orgroom_chat_messages m LEFT JOIN users u ON u.id=m.sender_user_id
      WHERE m.conversation_id=? ORDER BY m.id ASC
    `,[id]);
    res.set('Cache-Control','no-store');
    res.json({messages:rows.map(m=>({id:Number(m.id),conversationId:Number(m.conversation_id),senderId:m.sender_user_id==null?null:Number(m.sender_user_id),senderName:m.sender_name||'Former account',senderRole:m.sender_role||'FORMER_ACCOUNT',text:m.message_text,createdAt:toUtcIso(m.created_at)})),unreadCount:await chatUnreadCount(id,user)});
  }catch(e){console.error('Chat message retrieval failed:',e.message);res.status(500).json({message:'Unable to load conversation messages.'});}
});

app.post('/api/chat/conversations/:id/messages',async(req,res)=>{
  try{
    const user=await requireAuth(req,res);if(!user)return;
    if(!isAdminRole(user.role)&&normalizeRole(user.role)!=='TEACHER')return res.status(403).json({message:'Messaging access is required.'});
    const id=chatConversationId(req.params.id);if(!id)return res.status(400).json({message:'Invalid conversation.'});
    const conversation=await chatConversationForUser(id,user);if(!conversation)return res.status(404).json({message:'Conversation not found.'});
    if(!isAdminRole(user.role)&&normalizeRole(user.role)!=='TEACHER')return res.status(403).json({message:'You cannot send messages.'});
    const text=String(req.body?.message||'').trim();
    if(!text)return res.status(400).json({message:'Enter a message before sending.'});
    if(text.length>CHAT_MESSAGE_MAX_LENGTH)return res.status(400).json({message:`Messages must be ${CHAT_MESSAGE_MAX_LENGTH} characters or fewer.`});
    const now=Date.now(),history=chatSendTimes.get(Number(user.id))||{lastAt:0,recent:[]};
    history.recent=history.recent.filter(timestamp=>now-timestamp<60000);
    if(now-history.lastAt<CHAT_SEND_INTERVAL_MS||history.recent.length>=30)return res.status(429).json({message:'Please wait before sending more messages.'});
    history.lastAt=now;history.recent.push(now);chatSendTimes.set(Number(user.id),history);
    const result=await dbQuery('INSERT INTO orgroom_chat_messages (conversation_id,sender_user_id,message_text,created_at) VALUES (?,?,?,UTC_TIMESTAMP())',[id,Number(user.id),text]);
    await dbQuery('UPDATE orgroom_chat_conversations SET updated_at=UTC_TIMESTAMP() WHERE id=?',[id]);
    const savedMessage=(await dbQuery('SELECT created_at FROM orgroom_chat_messages WHERE id=? LIMIT 1',[result.insertId]))[0];
    const message={id:Number(result.insertId),conversation_id:id,sender_user_id:Number(user.id),message_text:text,created_at:toUtcIso(savedMessage?.created_at),sender_name:user.name,sender_role:user.role};
    await createChatNotifications(conversation,message,user);
    res.status(201).json({message:{id:message.id,conversationId:id,senderId:Number(user.id),senderName:user.name,senderRole:user.role,text,createdAt:message.created_at}});
  }catch(e){console.error('Chat send failed:',e.message);res.status(500).json({message:'Unable to send your message.'});}
});

app.post('/api/chat/conversations/:id/read',async(req,res)=>{
  try{
    const user=await requireAuth(req,res);if(!user)return;
    if(!isAdminRole(user.role)&&normalizeRole(user.role)!=='TEACHER')return res.status(403).json({message:'Messaging access is required.'});
    const id=chatConversationId(req.params.id);if(!id)return res.status(400).json({message:'Invalid conversation.'});
    const conversation=await chatConversationForUser(id,user);if(!conversation)return res.status(404).json({message:'Conversation not found.'});
    const requestedReadId=Number(req.body?.lastReadMessageId);
    let latest=null;
    if(Number.isSafeInteger(requestedReadId)&&requestedReadId>0){
      latest=(await dbQuery('SELECT MAX(id) AS id FROM orgroom_chat_messages WHERE conversation_id=? AND id<=?',[id,requestedReadId]))[0]?.id||null;
    }
    if(latest!==null){
      await dbQuery(`
        INSERT INTO orgroom_chat_reads (conversation_id,user_id,last_read_message_id,last_read_at)
        VALUES (?,?,?,NOW())
        ON DUPLICATE KEY UPDATE
          last_read_message_id=GREATEST(COALESCE(last_read_message_id,0),VALUES(last_read_message_id)),
          last_read_at=NOW()
      `,[id,Number(user.id),Number(latest)]);
      await dbQuery(
        `UPDATE notifications SET is_read=1,read_at=COALESCE(read_at,NOW())
         WHERE recipient_user_id=? AND event_key LIKE ?
           AND CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(event_key,':',3),':',-1) AS UNSIGNED)<=?`,
        [Number(user.id),`chat:${id}:%:${Number(user.id)}`,Number(latest)]
      );
    }
    res.json({ok:true,unreadCount:await chatUnreadCount(id,user)});
  }catch(e){console.error('Chat read update failed:',e.message);res.status(500).json({message:'Unable to update message read status.'});}
});

app.get('/api/notifications',async(req,res)=>{
  try{
    const user=await requireAuth(req,res); if(!user)return;
    const limit=Math.min(Math.max(Number(req.query.limit)||30,1),100);
    const rows=await dbQuery(`SELECT n.*, r.user_name AS requester_name, r.room_name, r.building, r.reservation_date, r.time_slot FROM notifications n LEFT JOIN reservations r ON r.id=n.reservation_id WHERE n.recipient_user_id=? ORDER BY n.created_at DESC,n.id DESC LIMIT ${limit}`,[user.id]);
    const unreadRows=await dbQuery('SELECT COUNT(*) AS count FROM notifications WHERE recipient_user_id=? AND is_read=0',[user.id]);
    res.set('Cache-Control','no-store');
    res.json({notifications:rows.map(row=>({id:Number(row.id),type:row.notification_type,reservationId:row.reservation_id==null?null:Number(row.reservation_id),conversationId:String(row.event_key||'').startsWith('chat:')?Number(String(row.event_key).split(':')[1])||null:null,title:row.title,message:row.message,isRead:Boolean(row.is_read),createdAt:toUtcIso(row.created_at),readAt:toUtcIso(row.read_at),requesterName:row.requester_name||'',roomName:row.room_name||'',building:row.building||'',date:row.reservation_date?String(row.reservation_date).slice(0,10):'',timeSlot:row.time_slot||''})),unreadCount:Number(unreadRows[0]?.count||0)});
  }catch(e){res.status(500).json({message:'Unable to load notifications.'});}
});

app.post('/api/notifications/:id/read',async(req,res)=>{
  try{
    const user=await requireAuth(req,res); if(!user)return;
    const id=Number(req.params.id); if(!Number.isInteger(id)||id<=0)return res.status(400).json({message:'Invalid notification reference.'});
    await dbQuery('UPDATE notifications SET is_read=1,read_at=COALESCE(read_at,NOW()) WHERE id=? AND recipient_user_id=?',[id,user.id]);
    res.json({ok:true});
  }catch(e){res.status(500).json({message:'Unable to mark notification as read.'});}
});

app.get('/api/facilities',async(req,res)=>{try{if(!await requireAuth(req,res))return;res.set('Cache-Control','no-store, no-cache, must-revalidate, proxy-revalidate');res.set('Pragma','no-cache');const rows=await dbQuery('SELECT * FROM facilities ORDER BY building,name');res.json(rows.map(mapFacility));}catch(e){res.status(500).json({message:'Unable to load facilities.'})}});
app.get('/api/reservations',async(req,res)=>{try{const user=await requireAuth(req,res);if(!user)return;res.set('Cache-Control','no-store, no-cache, must-revalidate, proxy-revalidate');res.set('Pragma','no-cache');const isAdmin=isAdminRole(user.role);const rows=await dbQuery(`SELECT r.*, f.name AS facility_lookup_name, du.name AS decision_by_name, du.email AS decision_by_email, sr.delivery_status AS start_reminder_status, sr.sent_at AS start_reminder_sent_at, er.delivery_status AS end_reminder_status, er.sent_at AS end_reminder_sent_at FROM reservations r LEFT JOIN facilities f ON f.id=r.facility_id LEFT JOIN users du ON du.id=r.decision_by_user_id LEFT JOIN reservation_reminders sr ON sr.reservation_id=r.id AND sr.reminder_type='START' LEFT JOIN reservation_reminders er ON er.reservation_id=r.id AND er.reminder_type='END' WHERE ?=1 OR r.user_id=? OR (r.user_id IS NULL AND LOWER(r.user_email)=LOWER(?)) ORDER BY r.id DESC`,[isAdmin?1:0,user.id,user.email]);res.json(rows.map(mapReservation));}catch(e){res.status(500).json({message:'Unable to load reservations.'})}});

app.get('/api/weekly-room-schedules',async(req,res)=>{try{if(!await requireAuth(req,res))return;res.set('Cache-Control','no-store, no-cache, must-revalidate, proxy-revalidate');res.set('Pragma','no-cache');const rows=await dbQuery(`SELECT * FROM weekly_room_schedules WHERE is_active=1 AND HOUR(start_time)<24 AND HOUR(end_time)<24 AND end_time>start_time AND UPPER(TRIM(activity_name)) NOT IN ('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY') AND UPPER(TRIM(activity_name)) NOT LIKE 'APPROVED BY:%' ORDER BY facility_id,day_of_week,start_time`);res.json(rows.map(mapWeekly));}catch(e){res.status(500).json({message:'Unable to load recurring room schedules.'})}});


function buildRoomAvailabilitySegments(weeklyRows, reservationRows){
  const operatingStart=runtimeSystemSettings.reservationStartMinutes;
  const operatingEnd=runtimeSystemSettings.reservationEndMinutes;
  const points=new Set([operatingStart,operatingEnd]);
  const intervals=[];
  for(const row of weeklyRows||[]){
    const start=dbTimeMinutes(row.start_time), end=dbTimeMinutes(row.end_time);
    if(Number.isFinite(start)&&Number.isFinite(end)&&end>start){
      const a=Math.max(operatingStart,start), b=Math.min(operatingEnd,end);
      if(b>a){intervals.push({start:a,end:b,status:'OCCUPIED'});points.add(a);points.add(b);}
    }
  }
  for(const row of reservationRows||[]){
    const [rawStart,rawEnd]=timeSlotParts(row.time_slot);
    if(Number.isFinite(rawStart)&&Number.isFinite(rawEnd)&&rawEnd>rawStart){
      const a=Math.max(operatingStart,rawStart), b=Math.min(operatingEnd,rawEnd);
      if(b>a){intervals.push({start:a,end:b,status:String(row.status||'').toUpperCase()==='PENDING'?'PENDING':'OCCUPIED'});points.add(a);points.add(b);}
    }
  }
  const sorted=[...points].sort((a,b)=>a-b);
  const segments=[];
  for(let i=0;i<sorted.length-1;i++){
    const start=sorted[i],end=sorted[i+1];
    if(end<=start)continue;
    const active=intervals.filter(x=>x.start<end&&x.end>start);
    let status='AVAILABLE';
    if(active.some(x=>x.status==='OCCUPIED')) status='OCCUPIED';
    else if(active.some(x=>x.status==='PENDING')) status='PENDING';
    const last=segments[segments.length-1];
    if(last&&last.status===status&&last.end===start) last.end=end;
    else segments.push({start,end,status,label:status==='AVAILABLE'?'Available':status==='PENDING'?'Pending reservation request':'Occupied / scheduled'});
  }
  return segments;
}

// Authenticated global search. Room availability is calculated with the same
// segment builder used by /api/room-schedule, never inferred from facility rows.
app.get('/api/search',async(req,res)=>{
  try{
    const user=await requireAuth(req,res);
    if(!user)return;
    const query=String(req.query.q||'').replace(/[\%_]/g,' ').replace(/\s+/g,' ').trim().slice(0,80);
    const lowerQuery=query.toLowerCase();
    if(query.length<2){res.set('Cache-Control','no-store');return res.json({query,rooms:[],availableRooms:[],people:[],pages:[]});}

    const wantsAvailability=/\b(available|availability|free|open)\b/i.test(query);
    const wantsClassroom=/\bclassrooms?\b/i.test(query);
    const wantsLaboratory=/\b(labs?|laboratory|laboratories)\b/i.test(query);
    const roomTerm=query.replace(/\b(available|availability|free|open|currently|right|now|rooms?|classrooms?|labs?|laboratory|laboratories|in|the|for|and)\b/gi,' ').replace(/\s+/g,' ').trim();
    const roomSearchTerms=(roomTerm||query).replace(/[^\p{L}\p{N}\s]/gu,' ').split(/\s+/).filter(Boolean).slice(0,6);
    const isAdmin=isAdminRole(user.role);

    let facilities;
    if(wantsAvailability && !roomTerm){
      facilities=await dbQuery('SELECT id,name,building,building_code,capacity,type,status FROM facilities ORDER BY building,name LIMIT 150');
    }else if(!roomSearchTerms.length){
      facilities=[];
    }else{
      // Match each meaningful word against the room name, building, or type.
      // This also handles punctuation such as "School Building — Room 2".
      const termFilterSql=roomSearchTerms.map(()=>`(LOWER(COALESCE(name,'')) LIKE LOWER(?) OR LOWER(COALESCE(building,'')) LIKE LOWER(?) OR LOWER(COALESCE(type,'')) LIKE LOWER(?))`);
      const termFilterParams=roomSearchTerms.flatMap(term=>[`%${term}%`,`%${term}%`,`%${term}%`]);
      const typeFilterSql=[
        ...(wantsClassroom?[`LOWER(COALESCE(type,'')) LIKE LOWER(?)`]:[]),
        ...(wantsLaboratory?[`LOWER(COALESCE(type,'')) LIKE LOWER(?)`]:[])
      ];
      const typeFilterParams=[...(wantsClassroom?['%classroom%']:[]),...(wantsLaboratory?['%laboratory%']:[])];
      facilities=await dbQuery(`SELECT id,name,building,building_code,capacity,type,status FROM facilities WHERE ${termFilterSql.join(' AND ')}${typeFilterSql.length?` AND ${typeFilterSql.join(' AND ')}`:''} ORDER BY building,name LIMIT 60`,[...termFilterParams,...typeFilterParams]);
    }
    if(wantsClassroom) facilities=facilities.filter(facility=>String(facility.type||'').toLowerCase().includes('classroom'));
    if(wantsLaboratory) facilities=facilities.filter(facility=>String(facility.type||'').toLowerCase().includes('laboratory'));

    // ORGROOM's campus timetable uses Philippine local dates and clock times.
    // Derive these in Asia/Manila instead of relying on Aiven's server timezone.
    const manilaParts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{
      timeZone:'Asia/Manila',year:'numeric',month:'2-digit',day:'2-digit',
      weekday:'long',hour:'2-digit',minute:'2-digit',hourCycle:'h23'
    }).formatToParts(new Date()).map(part=>[part.type,part.value]));
    const today=`${manilaParts.year}-${manilaParts.month}-${manilaParts.day}`;
    const dayName=manilaParts.weekday;
    const currentMinute=Number(manilaParts.hour)*60+Number(manilaParts.minute);
    let weeklyRows=[],reservationRows=[];
    const facilityIds=facilities.map(item=>Number(item.id)).filter(Number.isInteger);
    if(facilityIds.length){
      const placeholders=facilityIds.map(()=>'?').join(',');
      weeklyRows=await dbQuery(`SELECT facility_id,start_time,end_time FROM weekly_room_schedules WHERE facility_id IN (${placeholders}) AND day_of_week=? AND is_active=1 AND HOUR(start_time)<24 AND HOUR(end_time)<24 AND end_time>start_time AND UPPER(TRIM(activity_name)) NOT IN ('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY') AND UPPER(TRIM(activity_name)) NOT LIKE 'APPROVED BY:%' AND (term_start IS NULL OR term_start<=?) AND (term_end IS NULL OR term_end>=?)`,[...facilityIds,dayName,today,today]);
      reservationRows=await dbQuery(`SELECT facility_id,room_name,building,status,time_slot FROM reservations WHERE reservation_date=? AND status IN ('PENDING','APPROVED') AND (facility_id IN (${placeholders}) OR facility_id IS NULL)`,[today,...facilityIds]);
    }

    const availabilityByFacility=new Map();
    for(const facility of facilities){
      const id=Number(facility.id);
      const schedules=weeklyRows.filter(row=>Number(row.facility_id)===id);
      const reservations=reservationRows.filter(row=>Number(row.facility_id)===id || (row.facility_id==null && String(row.room_name||'').toLowerCase()===String(facility.name||'').toLowerCase() && String(row.building||'').toLowerCase()===String(facility.building||'').toLowerCase()));
      let availabilityStatus='UNKNOWN';
      if(['MAINTENANCE','INACTIVE','CLOSED','DISABLED','UNAVAILABLE'].includes(String(facility.status||'AVAILABLE').toUpperCase())) availabilityStatus='UNAVAILABLE';
      else if(Number.isFinite(currentMinute) && currentMinute>=runtimeSystemSettings.reservationStartMinutes && currentMinute<runtimeSystemSettings.reservationEndMinutes){
        const segments=buildRoomAvailabilitySegments(schedules,reservations);
        const segment=segments.find(item=>item.start<=currentMinute && currentMinute<item.end);
        availabilityStatus=segment?.status||'UNKNOWN';
      }else availabilityStatus='OUTSIDE_HOURS';
      availabilityByFacility.set(id,availabilityStatus);
    }

    const roomMatches=(wantsAvailability && !roomTerm)?[]:facilities.slice(0,8);
    const rooms=roomMatches.map(facility=>({
      id:Number(facility.id),type:'room',title:facility.name,description:facility.building,
      roomName:facility.name,building:facility.building,facilityType:facility.type,
      capacity:facility.capacity==null?null:Number(facility.capacity),availabilityStatus:availabilityByFacility.get(Number(facility.id))||'UNKNOWN'
    }));

    let availableFacilities=[];
    if(wantsAvailability){
      availableFacilities=facilities.filter(facility=>availabilityByFacility.get(Number(facility.id))==='AVAILABLE').slice(0,8);
    }
    const availableRooms=availableFacilities.map(facility=>({
      id:Number(facility.id),type:'available_room',title:facility.name,description:`${facility.building}${facility.capacity?` · ${facility.capacity} seats`:''}`,
      roomName:facility.name,building:facility.building,facilityType:facility.type,capacity:facility.capacity==null?null:Number(facility.capacity),availabilityStatus:'AVAILABLE'
    }));

    // Instructor names are part of the school timetable already available to
    // authenticated users. Searching them does not expose private user accounts.
    const peopleLike=`%${query}%`;
    const instructorRows=await dbQuery(`
      SELECT w.id,w.instructor,w.course_code,w.course_title,w.activity_name,
             w.day_of_week,TIME_FORMAT(w.start_time,'%h:%i %p') AS start_label,
             TIME_FORMAT(w.end_time,'%h:%i %p') AS end_label,
             f.id AS facility_id,f.name AS room_name,f.building
      FROM weekly_room_schedules w
      INNER JOIN facilities f ON f.id=w.facility_id
      WHERE w.is_active=1
        AND w.instructor IS NOT NULL AND TRIM(w.instructor)<>''
        AND LOWER(w.instructor) LIKE LOWER(?)
        AND HOUR(w.start_time)<24 AND HOUR(w.end_time)<24
        AND w.end_time>w.start_time
        AND UPPER(TRIM(w.activity_name)) NOT IN ('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY')
        AND UPPER(TRIM(w.activity_name)) NOT LIKE 'APPROVED BY:%'
        AND (w.term_start IS NULL OR w.term_start<=?)
        AND (w.term_end IS NULL OR w.term_end>=?)
      ORDER BY w.instructor,w.day_of_week,w.start_time,w.id
      LIMIT 30
    `,[peopleLike,today,today]);
    const instructorPeople=[];
    const seenInstructors=new Set();
    for(const row of instructorRows){
      const name=String(row.instructor||'').trim();
      const key=name.toLowerCase();
      if(!name||seenInstructors.has(key))continue;
      seenInstructors.add(key);
      const course=String(row.course_title||row.activity_name||'Class schedule');
      instructorPeople.push({
        id:`instructor-${Number(row.id)}`,
        type:'person',
        personKind:'instructor',
        title:name,
        description:`${course} · ${row.room_name} · ${row.building} · ${row.day_of_week} ${row.start_label}–${row.end_label}`,
        role:'Instructor',
        schedule:{
          course,roomName:String(row.room_name||''),building:String(row.building||''),
          dayOfWeek:String(row.day_of_week||''),startTime:String(row.start_label||''),
          endTime:String(row.end_label||''),facilityId:Number(row.facility_id)
        }
      });
      if(instructorPeople.length>=6)break;
    }

    let accountPeople=[];
    let accountEmails=new Set();
    if(isAdmin){
      const rows=await dbQuery(`SELECT id,name,email,role,organization,department FROM users WHERE LOWER(name) LIKE LOWER(?) OR LOWER(email) LIKE LOWER(?) ORDER BY name,id LIMIT 6`,[peopleLike,peopleLike]);
      accountEmails=new Set(rows.map(row=>String(row.email||'').trim().toLowerCase()).filter(Boolean));
      accountPeople=rows.map(row=>({id:Number(row.id),type:'person',personKind:'account',title:String(row.name||'Unnamed user'),description:[row.organization,row.department].filter(Boolean).join(' · ')||'ORGROOM account',role:String(row.role||'').toUpperCase()}));
    }else{
      const rows=await dbQuery('SELECT id,name,role,organization,department FROM users WHERE id=? AND LOWER(name) LIKE LOWER(?) LIMIT 1',[user.id,peopleLike]);
      accountPeople=rows.map(row=>({id:Number(row.id),type:'person',personKind:'account',title:String(row.name||'Your profile'),description:'Your ORGROOM profile',role:String(row.role||'').toUpperCase()}));
    }

    let reservationPeople=[];
    if(isAdmin){
      const requesterRows=await dbQuery(`
        SELECT id,user_name,user_email,room_name,building
        FROM reservations
        WHERE LOWER(COALESCE(user_name,'')) LIKE LOWER(?)
           OR LOWER(COALESCE(user_email,'')) LIKE LOWER(?)
        ORDER BY id DESC
        LIMIT 20
      `,[peopleLike,peopleLike]);
      const seenRequesters=new Set();
      for(const row of requesterRows){
        const email=String(row.user_email||'').trim().toLowerCase();
        const name=String(row.user_name||'').trim();
        const key=email||name.toLowerCase();
        if(!name||!key||accountEmails.has(email)||seenRequesters.has(key))continue;
        seenRequesters.add(key);
        reservationPeople.push({
          id:`requester-${Number(row.id)}`,
          type:'person',
          personKind:'requester',
          title:name,
          description:`Reservation requester · ${row.room_name||'Room'} · ${row.building||'Campus'}`,
          role:'Requester'
        });
        if(reservationPeople.length>=4)break;
      }
    }
    const people=[...accountPeople,...instructorPeople,...reservationPeople].slice(0,10);

    const destinations=[
      {tab:'home',title:'Dashboard',description:'Your ORGROOM overview',keywords:'home overview dashboard'},
      {tab:'rooms',title:'Available Rooms',description:'Browse facilities and request a room',keywords:'available rooms currently available right now facilities classrooms laboratories'},
      {tab:'calendar',title:'Room Calendar',description:'View room schedules and reservation activity',keywords:'calendar schedule timetable'},
      {tab:'reservations',title:isAdmin?'Reservations':'My Reservations',description:'Track reservation requests and history',keywords:'reservations my reservations history bookings'},
      ...(isAdmin?[{tab:'requests',title:'Admin Requests',description:'Review pending reservation requests',keywords:'admin requests approvals'},{tab:'room-usage',title:'Room Usage Check',description:'Review approved room usage',keywords:'room usage check'},{tab:'user-management',title:'User Management',description:'Manage Teacher and Admin accounts',keywords:'user management users accounts'}]:[]),
      {tab:'profile',title:'Profile Settings',description:'Account details and preferences',keywords:'profile settings account'}
    ];
    const pageTerms=lowerQuery.split(/\s+/).filter(term=>!['in','the','for','and','please'].includes(term));
    const pages=destinations.filter(item=>{const text=`${item.title} ${item.description} ${item.keywords}`.toLowerCase();return pageTerms.every(term=>text.includes(term));}).slice(0,6).map(item=>({...item,type:'page'}));
    res.set('Cache-Control','no-store, no-cache, must-revalidate, proxy-revalidate');
    res.json({query,rooms,availableRooms,people,pages,availabilityChecked:true,availabilityDate:today,availabilityMinute:Number.isFinite(currentMinute)?currentMinute:null});
  }catch(error){
    console.error(`ORGROOM global search failed: ${error.message||error}`);
    res.status(error.status||500).json({message:'Search is temporarily unavailable. Please try again.'});
  }
});

app.get('/api/room-schedule',async(req,res)=>{try{if(!await requireAuth(req,res))return;const facilityId=Number(req.query.facilityId);const date=String(req.query.date||'').trim();if(!Number.isInteger(facilityId)||facilityId<=0||!/^\d{4}-\d{2}-\d{2}$/.test(date))return res.status(400).json({message:'A valid facility and date are required.'});res.set('Cache-Control','no-store, no-cache, must-revalidate, proxy-revalidate');res.set('Pragma','no-cache');const weeklyRows=await dbQuery(`SELECT * FROM weekly_room_schedules WHERE facility_id=? AND is_active=1 AND day_of_week=DAYNAME(?) AND HOUR(start_time)<24 AND HOUR(end_time)<24 AND end_time>start_time AND UPPER(TRIM(activity_name)) NOT IN ('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY') AND UPPER(TRIM(activity_name)) NOT LIKE 'APPROVED BY:%' AND (term_start IS NULL OR term_start<=?) AND (term_end IS NULL OR term_end>=?) ORDER BY start_time`,[facilityId,date,date,date]);const reservationRows=await dbQuery(`SELECT r.* FROM reservations r WHERE r.reservation_date=? AND r.status IN ('PENDING','APPROVED') AND (r.facility_id=? OR (r.facility_id IS NULL AND r.room_name=(SELECT name FROM facilities WHERE id=? LIMIT 1) AND r.building=(SELECT building FROM facilities WHERE id=? LIMIT 1))) ORDER BY r.time_slot,r.id`,[date,facilityId,facilityId,facilityId]);const segments=buildRoomAvailabilitySegments(weeklyRows,reservationRows);res.json({date,facilityId,operatingStart:runtimeSystemSettings.reservationStartMinutes,operatingEnd:runtimeSystemSettings.reservationEndMinutes,segments,weekly:weeklyRows.map(mapWeekly),reservations:reservationRows.map(mapReservation)});}catch(e){res.status(500).json({message:'Unable to load the room schedule.'})}});

app.post('/api/reservations', async (req, res) => {
  try {
    const user = await requireAuth(req, res);
    if (!user) return;
    const body = req.body || {};
    if (!body.roomName || !body.building || !body.date || !body.timeSlot) {
      return res.status(400).json({ message: 'Required reservation information is missing.' });
    }

    const facilityId = Number(body.facilityId) || null;
    const facility = facilityId
      ? (await dbQuery('SELECT * FROM facilities WHERE id=? LIMIT 1', [facilityId]))[0]
      : null;
    validateReservationInput({
      facility,
      facilityId,
      roomName: body.roomName,
      building: body.building,
      date: body.date,
      timeSlot: body.timeSlot,
      attendees: body.attendees,
      purpose: body.purpose
    });

    const requesterRole = normalizeRole(user.role);
    const autoApproved = requesterRole === 'SUPER_ADMIN';
    const initialStatus = autoApproved ? 'APPROVED' : 'PENDING';
    const decisionSource = autoApproved ? 'SYSTEM_AUTO_APPROVAL' : 'AWAITING_APPROVAL';
    const key = `${facilityId}|${body.date}`;

    const created = await withReservationLock(key, async connection => {
      const query = async (sql, params = []) => {
        const [rows] = await connection.query(sql, params);
        return rows;
      };
      await assertNoConflict({
        facilityId,
        roomName: facility.name,
        building: facility.building,
        date: body.date,
        timeSlot: body.timeSlot,
        query
      });

      const result = await query(
        `INSERT INTO reservations
          (user_id,user_name,user_email,user_role,organization_name,facility_id,room_name,building,
           reservation_date,time_slot,attendees,purpose,event_type,status,admin_notes,
           decision_by_user_id,decision_at,decision_source,priority)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NULL,${autoApproved ? 'NOW()' : 'NULL'},?,?)`,
        [
          Number(user.id), user.name, user.email, requesterRole.toLowerCase(),
          body.orgName || user.organization || '', facility.id, facility.name, facility.building,
          body.date, body.timeSlot, Number(body.attendees),
          String(body.purpose || '').trim().slice(0, 500),
          String(body.eventType || 'Academic Lecture').slice(0, 100),
          initialStatus, '', decisionSource,
          requesterRole === 'TEACHER' || Boolean(body.priority) ? 1 : 0
        ]
      );

      const rows = await query('SELECT * FROM reservations WHERE id=?', [result.insertId]);
      const mapped = mapReservation(rows[0]);

      await writeAuditEvent({
        actor: user,
        action: autoApproved ? 'RESERVATION_AUTO_APPROVED' : 'RESERVATION_SUBMITTED',
        entityType: 'RESERVATION',
        entityId: result.insertId,
        newValues: {
          status: initialStatus,
          decisionSource,
          requesterRole,
          facilityId: facility.id,
          roomName: facility.name,
          building: facility.building,
          date: body.date,
          timeSlot: body.timeSlot,
          attendees: Number(body.attendees),
          purpose: String(body.purpose || '').trim().slice(0, 500)
        }
      }, query);

      if (autoApproved) {
        await writeReservationDecisionHistory({
          reservationId: result.insertId,
          fromStatus: null,
          toStatus: 'APPROVED',
          actionType: 'SYSTEM_AUTO_APPROVAL',
          actorRole: 'SYSTEM',
          reason: 'Automatically approved after all standard room, schedule, capacity, time-window, and conflict validations passed.'
        }, query);
      }

      return mapped;
    });

    await notifyReservationEvent(
      created.dbId,
      autoApproved ? 'RESERVATION_APPROVED' : 'NEW_RESERVATION_REQUEST'
    );
    res.status(201).json(created);
  } catch (error) {
    res.status(error.status || 409).json({
      message: error.message || 'Unable to create reservation.'
    });
  }
});

app.get('/api/server-time',async(req,res)=>{try{if(!await requireAuth(req,res))return;const row=(await dbQuery('SELECT UNIX_TIMESTAMP(UTC_TIMESTAMP()) * 1000 AS server_now_ms'))[0];res.set('Cache-Control','no-store');res.json({serverNowMs:Number(row.server_now_ms)});}catch(e){res.status(500).json({message:'Unable to read server time.'})}});

async function sendReservationReminder(row,type){
  const isStart=type==='START';
  const subject=isStart ? 'ORGROOM Reservation Reminder — Starting Soon' : 'ORGROOM Reservation Reminder — Ending Soon';
  const lead=isStart ? 'Your reservation is about to start.' : 'Your reservation is ending soon.';
  const extra=isStart ? `Your reservation at ${row.building} — ${row.room_name} starts in about 15 minutes.` : `Your reservation for ${row.building} — ${row.room_name} ends in about 15 minutes. Please prepare to leave the room on time.`;
  const text=`Hello ${row.verified_user_name || row.user_name || 'ORGROOM user'},\n\n${lead}\n\n${extra}\n\nReservation date: ${String(row.reservation_date).slice(0,10)}\nTime: ${row.time_slot}\nBuilding: ${row.building}\nRoom: ${row.room_name}\n\nORGROOM — Facility Reservation Platform`;
  const html=`<div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937"><h2>${subject}</h2><p>Hello ${row.verified_user_name || row.user_name || 'ORGROOM user'},</p><p>${lead}</p><p>${extra}</p><div style="padding:16px;border:1px solid #e5e7eb;border-radius:12px"><b>${row.building} — ${row.room_name}</b><br/>${String(row.reservation_date).slice(0,10)}<br/>${row.time_slot}</div><p>ORGROOM — Facility Reservation Platform</p></div>`;
  await sendEmail({
  to: normalizeEmail(row.recipient_email || row.user_email),
  subject,
  text,
  html
});
}

async function ensureReminderState(reservationId, reminderType, scheduledMs){
  const existing=(await dbQuery('SELECT id,sent_at,UNIX_TIMESTAMP(scheduled_at)*1000 AS scheduled_ms FROM reservation_reminders WHERE reservation_id=? AND reminder_type=? LIMIT 1',[reservationId,reminderType]))[0];
  if(!existing){
    await dbQuery("INSERT INTO reservation_reminders (reservation_id,reminder_type,scheduled_at,delivery_status) VALUES (?,?,FROM_UNIXTIME(?/1000),'PENDING')",[reservationId,reminderType,scheduledMs]);
    return false;
  }
  if(Number(existing.scheduled_ms)!==Number(scheduledMs)){
    await dbQuery("UPDATE reservation_reminders SET scheduled_at=FROM_UNIXTIME(?/1000),sent_at=NULL,delivery_status='PENDING',error_message='' WHERE id=?",[scheduledMs,existing.id]);
    return false;
  }
  return Boolean(existing.sent_at);
}

async function processReservationReminders(){
  if(reminderJobRunning) return;
  reminderJobRunning=true;
  try{
    const today=manilaTodayISO();
    const rows=await dbQuery(`SELECT r.*, u.email AS recipient_email, u.name AS verified_user_name,
      LOWER(COALESCE(u.role,'')) AS recipient_role,
      UNIX_TIMESTAMP(UTC_TIMESTAMP())*1000 AS server_now_ms
      FROM reservations r
      INNER JOIN users u ON u.id=r.user_id AND u.is_verified=1
      WHERE r.status='APPROVED'
        AND LOWER(COALESCE(u.role,''))='teacher'
        AND r.reservation_date BETWEEN DATE_SUB(?,INTERVAL 7 DAY) AND DATE_ADD(?,INTERVAL 7 DAY)`,[today,today]);
    for(const row of rows){
      const now=Number(row.server_now_ms);
      const [start,end]=reservationTimeRange(row.reservation_date,row.time_slot);
      if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start) continue;

      // Preserve the existing 15-minute email reminders.
      for(const [type,target] of [['START',start-15*60*1000],['END',end-15*60*1000]]){
        const windowStart=target, windowEnd=target+15*60*1000;
        if(now<windowStart || now>=windowEnd) continue;
        const existing=(await dbQuery('SELECT id,UNIX_TIMESTAMP(scheduled_at)*1000 AS scheduled_ms,sent_at,delivery_status FROM reservation_reminders WHERE reservation_id=? AND reminder_type=? LIMIT 1',[row.id,type]))[0];
        if(existing && existing.sent_at && Number(existing.scheduled_ms)===target) continue;
        if(existing && existing.sent_at) await dbQuery("UPDATE reservation_reminders SET scheduled_at=FROM_UNIXTIME(?/1000),sent_at=NULL,delivery_status='PENDING',error_message='' WHERE id=?",[target,existing.id]);
        else if(existing) await dbQuery("UPDATE reservation_reminders SET scheduled_at=FROM_UNIXTIME(?/1000),delivery_status='PENDING',error_message='' WHERE id=?",[target,existing.id]);
        else await dbQuery('INSERT INTO reservation_reminders (reservation_id,reminder_type,scheduled_at) VALUES (?,?,FROM_UNIXTIME(?/1000))',[row.id,type,target]);
        try{
          await sendReservationReminder(row,type);
          await dbQuery("UPDATE reservation_reminders SET sent_at=NOW(),delivery_status='SENT',error_message='' WHERE reservation_id=? AND reminder_type=?",[row.id,type]);
        }catch(e){
          await dbQuery("UPDATE reservation_reminders SET delivery_status='FAILED',error_message=? WHERE reservation_id=? AND reminder_type=?",[String(e.message||e).slice(0,1000),row.id,type]);
          console.error(`ORGROOM ${type} reminder failed for reservation ${row.id}: ${e.message||e}`);
        }
      }

      // Persistent in-app warning at the real five-minute point. No email is sent for this new alarm.
      if(now>=end-5*60*1000 && now<end){
        const reminderType='ENDING_5';
        const scheduled=end-5*60*1000;
        const sent=await ensureReminderState(row.id,reminderType,scheduled);
        if(!sent){
          const details=reservationNotificationDetails(row);
          const eventKey=`reservation:${row.id}:ENDING_5_MINUTES:${end}`;
          const notification=await createNotification({
            recipientUserId:Number(row.user_id),
            type:'RESERVATION_ENDING_5_MINUTES',
            reservationId:Number(row.id),
            eventKey,
            title:'Reservation Ending Soon',
            message:`Your reservation for ${details.room} at ${details.building} ends in 5 minutes at ${row.time_slot.split(' - ').pop() || 'the scheduled end time'}. Please begin wrapping up and leave the room on time.`,
            details:{...details,recipientName:row.verified_user_name || row.user_name,isAdmin:false}
          });
          if(notification) await dbQuery("UPDATE reservation_reminders SET sent_at=NOW(),delivery_status='SENT',error_message='' WHERE reservation_id=? AND reminder_type=?",[row.id,reminderType]);
        }
      }

      // Persistent end-time alarm. It is created once, even if the backend was briefly offline.
      if(now>=end){
        const reminderType='END_ALARM';
        const sent=await ensureReminderState(row.id,reminderType,end);
        if(!sent){
          const details=reservationNotificationDetails(row);
          const eventKey=`reservation:${row.id}:RESERVATION_ENDED:${end}`;
          const notification=await createNotification({
            recipientUserId:Number(row.user_id),
            type:'RESERVATION_ENDED',
            reservationId:Number(row.id),
            eventKey,
            title:'Reservation Time Ended',
            message:`Your scheduled reservation for ${details.room} at ${details.building} has reached its end time. Please leave the room and allow the next scheduled user to use the facility.`,
            details:{...details,recipientName:row.verified_user_name || row.user_name,isAdmin:false}
          });
          if(notification) await dbQuery("UPDATE reservation_reminders SET sent_at=NOW(),delivery_status='SENT',error_message='' WHERE reservation_id=? AND reminder_type=?",[row.id,reminderType]);
        }
      }
    }
  }catch(e){ console.error(`ORGROOM reminder job failed: ${e.message||e}`); }
  finally{ reminderJobRunning=false; }
}


app.get('/api/room-usage',async(req,res)=>{
  if(!await requireAdminAuth(req,res)) return;
  try{
    const date=String(req.query.date||'').slice(0,10);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({message:'A valid date is required.'});
    const rows=await dbQuery(`SELECT r.id AS reservation_id,r.user_name,r.user_email,r.user_role,r.organization_name,r.room_name,r.building,r.facility_id,r.reservation_date,r.time_slot,r.attendees,r.purpose,r.event_type,r.status AS reservation_status,r.submitted_at,u.id AS usage_id,u.usage_status,u.checked_at,u.note AS usage_note,u.created_at AS usage_created_at,u.updated_at AS usage_updated_at,cu.name AS checked_by_name,cu.email AS checked_by_email FROM reservations r LEFT JOIN room_usage_checks u ON u.reservation_id=r.id LEFT JOIN users cu ON cu.id=u.checked_by_user_id WHERE r.reservation_date=? AND r.status='APPROVED' ORDER BY r.building,r.room_name,r.time_slot,r.id`,[date]);
    res.json(rows.map(row=>({reservation:{id:`OR-${String(row.reservation_id).padStart(3,'0')}`,dbId:Number(row.reservation_id),userName:row.user_name,userEmail:row.user_email,userRole:row.user_role,orgName:row.organization_name,roomName:row.room_name,building:row.building,facilityId:row.facility_id,date:String(row.reservation_date).slice(0,10),timeSlot:row.time_slot,attendees:Number(row.attendees),purpose:row.purpose,eventType:row.event_type,status:row.reservation_status,submittedAt:toUtcIso(row.submitted_at) || ''},usage:row.usage_id?mapUsageCheck(row):{id:null,reservationId:Number(row.reservation_id),status:'NOT_CHECKED',checkedAt:null,checkedBy:'',checkedByEmail:'',note:'',createdAt:null,updatedAt:null}})));
  }catch(e){res.status(500).json({message:'Unable to load room usage checks.'});}
});

app.put('/api/room-usage/:reservationId',async(req,res)=>{
  const admin=await requireAdminAuth(req,res); if(!admin) return;
  try{
    const reservationId=Number(req.params.reservationId);
    const reservation=(await dbQuery(`SELECT id FROM reservations WHERE id=? AND status='APPROVED'`,[reservationId]))[0];
    if(!reservation)return res.status(404).json({message:'Approved reservation not found.'});
    const status=['NOT_CHECKED','CHECKED_IN','NOT_USED'].includes(String(req.body.status||''))?String(req.body.status):null;
    if(!status)return res.status(400).json({message:'Invalid usage status.'});
    const note=String(req.body.note||'').trim().slice(0,1000);
    const checkerId=Number(admin.id)||null;
    const checkedAt=status==='NOT_CHECKED'?null:new Date();
    await dbQuery(`INSERT INTO room_usage_checks (reservation_id,checked_by_user_id,usage_status,checked_at,note) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE checked_by_user_id=VALUES(checked_by_user_id),usage_status=VALUES(usage_status),checked_at=VALUES(checked_at),note=VALUES(note)`,[reservationId,checkerId,status,checkedAt,note]);
    const row=(await dbQuery(`SELECT u.*,cu.name AS checked_by_name,cu.email AS checked_by_email FROM room_usage_checks u LEFT JOIN users cu ON cu.id=u.checked_by_user_id WHERE u.reservation_id=?`,[reservationId]))[0];
    await writeAuditEvent({actor:admin,action:'ROOM_USAGE_CHECK_UPDATED',entityType:'RESERVATION',entityId:reservationId,newValues:{usageStatus:status,note}});
    res.json(mapUsageCheck(row));
  }catch(e){res.status(500).json({message:'Unable to save room usage check.'});}
});

app.post('/api/reservations/:id/decision', async (req, res) => {
  try {
    const admin = await requireAdminAuth(req, res);
    if (!admin) return;
    const id = Number(String(req.params.id).replace(/^OR-/i, ''));
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Invalid reservation reference.' });
    }
    const decision = String(req.body.status || '').toUpperCase();
    if (!['APPROVED', 'REJECTED'].includes(decision)) {
      return res.status(400).json({ message: 'A valid approval decision is required.' });
    }
    const note = String(req.body.adminNotes || '').trim().slice(0, 2000);
    const current = (await dbQuery('SELECT * FROM reservations WHERE id=?', [id]))[0];
    if (!current) return res.status(404).json({ message: 'Reservation not found.' });
    if (current.status !== 'PENDING') {
      return res.status(409).json({ message: 'This reservation request has already been reviewed.' });
    }
    if (userOwnsReservation(admin, current)) {
      return res.status(403).json({ message: 'You cannot approve your own reservation request.' });
    }

    const requesterRole = normalizeRole(current.user_role);
    if (requesterRole === 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Super Admin reservations are automatically approved. Use the Super Admin override workflow only for an exceptional correction.' });
    }
    if (requesterRole === 'ADMIN' && !isSuperAdminRole(admin.role)) {
      return res.status(403).json({ message: 'Only a Super Admin can approve or reject reservations submitted by a regular Admin.' });
    }

    const facilityId = Number(current.facility_id) || null;
    const lockKey = `${facilityId || `${current.building}|${current.room_name}`}|${String(current.reservation_date).slice(0, 10)}`;
    const updated = await withReservationLock(lockKey, async connection => {
      const query = async (sql, params = []) => {
        const [rows] = await connection.query(sql, params);
        return rows;
      };
      const locked = (await query('SELECT * FROM reservations WHERE id=? FOR UPDATE', [id]))[0];
      if (!locked) return null;
      if (locked.status !== 'PENDING') {
        throw Object.assign(new Error('This reservation request has already been reviewed.'), { status: 409 });
      }
      if (userOwnsReservation(admin, locked)) {
        throw Object.assign(new Error('You cannot approve your own reservation request.'), { status: 403 });
      }
      const lockedRequesterRole = normalizeRole(locked.user_role);
      if (lockedRequesterRole === 'SUPER_ADMIN') {
        throw Object.assign(new Error('Super Admin reservations use the automatic approval workflow.'), { status: 403 });
      }
      if (lockedRequesterRole === 'ADMIN' && !isSuperAdminRole(admin.role)) {
        throw Object.assign(new Error('Only a Super Admin can review a regular Admin reservation.'), { status: 403 });
      }
      if (decision === 'APPROVED') {
        await assertNoConflict({
          facilityId: Number(locked.facility_id) || null,
          roomName: locked.room_name,
          building: locked.building,
          date: String(locked.reservation_date).slice(0, 10),
          timeSlot: locked.time_slot,
          excludeId: id,
          query
        });
      }

      const source = isSuperAdminRole(admin.role) ? 'SUPER_ADMIN_DECISION' : 'ADMIN_DECISION';
      await query(
        'UPDATE reservations SET status=?,admin_notes=?,decision_by_user_id=?,decision_at=NOW(),decision_source=? WHERE id=?',
        [decision, note || (decision === 'APPROVED' ? 'Reservation approved.' : 'Reservation request rejected.'), admin.id, source, id]
      );
      await writeReservationDecisionHistory({
        reservationId: id,
        fromStatus: locked.status,
        toStatus: decision,
        actionType: 'STANDARD_DECISION',
        actor: admin,
        reason: note
      }, query);
      await writeAuditEvent({
        actor: admin,
        action: decision === 'APPROVED' ? 'RESERVATION_APPROVED' : 'RESERVATION_REJECTED',
        entityType: 'RESERVATION',
        entityId: id,
        previousValues: { status: locked.status },
        newValues: { status: decision, decisionSource: source, adminNotes: note },
        reason: note
      }, query);
      const rows = await query(
        `SELECT r.*, du.name AS decision_by_name, du.email AS decision_by_email
         FROM reservations r LEFT JOIN users du ON du.id=r.decision_by_user_id WHERE r.id=?`,
        [id]
      );
      return mapReservation(rows[0]);
    });
    if (!updated) return res.status(404).json({ message: 'Reservation not found.' });
    await notifyReservationEvent(updated.dbId, decision === 'APPROVED' ? 'RESERVATION_APPROVED' : 'RESERVATION_REJECTED');
    res.json(updated);
  } catch (error) {
    res.status(error.status || 409).json({ message: error.message || 'Unable to review reservation.' });
  }
});

app.put('/api/reservations/:id',async(req,res)=>{try{const user=await requireAuth(req,res);if(!user)return;const id=Number(String(req.params.id).replace(/^OR-/i,''));if(!Number.isInteger(id)||id<=0)return res.status(400).json({message:'Invalid reservation reference.'});const current=(await dbQuery('SELECT * FROM reservations WHERE id=?',[id]))[0];if(!current)return res.status(404).json({message:'Reservation not found.'});const isAdmin=isAdminRole(user.role);const requesterRole=normalizeRole(current.user_role);if(!isAdmin&&!userOwnsReservation(user,current))return res.status(403).json({message:'You are not allowed to modify this reservation.'});if(isAdmin&&!isSuperAdminRole(user.role)&&requesterRole!=='TEACHER'&&!userOwnsReservation(user,current))return res.status(403).json({message:'Regular Admins can manage Teacher reservations and their own requests only.'});if(isAdmin&&!isSuperAdminRole(user.role)&&requesterRole==='SUPER_ADMIN')return res.status(403).json({message:'Regular Admins cannot modify Super Admin reservations.'});const requestedStatus=normalizeStatus(req.body.status||current.status);if(isAdmin&&requestedStatus!==current.status)return res.status(403).json({message:'Use the reservation review action to approve or reject a pending request.'});if(!isAdmin&&(current.status!=='PENDING'||requestedStatus!=='PENDING'))return res.status(403).json({message:'Only your pending reservation requests can be edited.'});if(!isAdmin && (req.body.userId||req.body.userEmail||req.body.userName)) return res.status(403).json({message:'Reservation ownership cannot be changed.'});const b={...mapReservation(current),...req.body};const facilityId=Number(b.facilityId||current.facility_id)||null;const facility=facilityId?(await dbQuery('SELECT * FROM facilities WHERE id=? LIMIT 1',[facilityId]))[0]:null;validateReservationInput({facility,facilityId,roomName:b.roomName,building:b.building,date:b.date,timeSlot:b.timeSlot,attendees:b.attendees,purpose:b.purpose});const key=`${facilityId}|${b.date}`;const updated=await withReservationLock(key,async connection=>{const query=(sql,params=[])=>connection.query(sql,params).then(([rows])=>rows);if(requestedStatus==='PENDING'||requestedStatus==='APPROVED')await assertNoConflict({facilityId,roomName:facility.name,building:facility.building,date:b.date,timeSlot:b.timeSlot,excludeId:id,query});await query(`UPDATE reservations SET room_name=?,building=?,facility_id=?,reservation_date=?,time_slot=?,attendees=?,purpose=?,event_type=?,status=?,admin_notes=?,priority=? WHERE id=?`,[facility.name,facility.building,facility.id,b.date,b.timeSlot,Number(b.attendees),String(b.purpose||'').trim().slice(0,500),String(b.eventType||'').slice(0,100),requestedStatus,isAdmin?String(b.adminNotes||'').slice(0,2000):current.admin_notes||'',isAdmin&&Boolean(b.priority)?1:current.priority?1:0,id]);const rows=await query(`SELECT r.* FROM reservations r WHERE r.id=?`,[id]);const mapped=mapReservation(rows[0]);await writeAuditEvent({actor:user,action:'RESERVATION_UPDATED',entityType:'RESERVATION',entityId:id,previousValues:{roomName:current.room_name,building:current.building,date:String(current.reservation_date).slice(0,10),timeSlot:current.time_slot,attendees:Number(current.attendees),purpose:current.purpose,eventType:current.event_type},newValues:{roomName:mapped.roomName,building:mapped.building,date:mapped.date,timeSlot:mapped.timeSlot,attendees:mapped.attendees,purpose:mapped.purpose,eventType:mapped.eventType}},query);return mapped;});if(!isAdmin && current.status==='PENDING' && (String(current.room_name)!==String(b.roomName)||String(current.building)!==String(b.building)||String(current.reservation_date).slice(0,10)!==String(b.date)||String(current.time_slot)!==String(b.timeSlot)||String(current.purpose)!==String(b.purpose||'')||String(current.event_type)!==String(b.eventType||'')||Number(current.attendees)!==Number(b.attendees)||Boolean(current.priority)!==Boolean(b.priority))) await notifyReservationEvent(updated.dbId,'RESERVATION_MODIFIED');res.json(updated);}catch(e){res.status(e.status||409).json({message:e.message||'Unable to update reservation.'})}});
app.delete('/api/reservations/:id',async(req,res)=>{try{const user=await requireAuth(req,res);if(!user)return;const id=Number(String(req.params.id).replace(/^OR-/i,''));const current=(await dbQuery('SELECT * FROM reservations WHERE id=?',[id]))[0];if(!current)return res.status(404).json({message:'Reservation not found.'});const isAdmin=isAdminRole(user.role);const requesterRole=normalizeRole(current.user_role);if(!isAdmin&&!userOwnsReservation(user,current))return res.status(403).json({message:'You are not allowed to cancel this reservation.'});if(isAdmin&&!isSuperAdminRole(user.role)&&requesterRole!=='TEACHER'&&!userOwnsReservation(user,current))return res.status(403).json({message:'Regular Admins can cancel Teacher reservations and their own requests only.'});if(isSuperAdminRole(user.role)&&!userOwnsReservation(user,current))return res.status(403).json({message:'Use the Super Admin override workflow to cancel another user’s reservation with an auditable reason.'});if(current.status==='REJECTED'||current.status==='CANCELLED')return res.status(409).json({message:'This reservation is already closed.'});if(!isAdmin&& !['PENDING','APPROVED'].includes(current.status))return res.status(403).json({message:'Only your pending or approved reservation can be cancelled.'});await dbQuery("UPDATE reservations SET status='CANCELLED',decision_by_user_id=?,decision_at=NOW(),decision_source='REQUESTER_CANCELLATION',admin_notes=CASE WHEN admin_notes IS NULL OR admin_notes='' THEN 'Cancelled by requester.' ELSE admin_notes END WHERE id=?",[user.id,id]);await writeReservationDecisionHistory({reservationId:id,fromStatus:current.status,toStatus:'CANCELLED',actionType:'REQUESTER_CANCELLATION',actor:user,reason:'Cancelled through the existing reservation cancellation action.'});await writeAuditEvent({actor:user,action:'RESERVATION_CANCELLED',entityType:'RESERVATION',entityId:id,previousValues:{status:current.status},newValues:{status:'CANCELLED'}});await notifyReservationEvent(id,'RESERVATION_CANCELLED');const row=(await dbQuery(`SELECT r.* FROM reservations r WHERE r.id=?`,[id]))[0];res.json(mapReservation(row));}catch(e){res.status(e.status||500).json({message:e.message||'Unable to cancel reservation.'})}});

async function retryFailedNotificationEmails(){
if (!emailGatewayUrl || !emailGatewayKey) return;
  try{
    const rows=await dbQuery(`SELECT d.notification_id,d.recipient_email,n.notification_type,n.reservation_id,r.* ,u.name AS recipient_name
      FROM notification_email_deliveries d
      INNER JOIN notifications n ON n.id=d.notification_id
      LEFT JOIN reservations r ON r.id=n.reservation_id
      LEFT JOIN users u ON u.id=n.recipient_user_id
      WHERE d.delivery_status='FAILED' AND d.updated_at < DATE_SUB(NOW(),INTERVAL 30 SECOND)
      ORDER BY d.updated_at LIMIT 10`);
    for(const row of rows){
      const details=row.reservation_id ? {...reservationNotificationDetails(row),recipientName:row.recipient_name,isAdmin:row.notification_type==='NEW_RESERVATION_REQUEST'||row.notification_type==='RESERVATION_CANCELLED'||row.notification_type==='RESERVATION_MODIFIED'||row.notification_type==='RESERVATION_OVERRIDDEN'} : {recipientName:row.recipient_name,isAdmin:false,reservationId:null};
      await sendNotificationEmail(Number(row.notification_id),row.recipient_email,row.notification_type,details);
    }
  }catch(e){console.error(`ORGROOM notification retry failed: ${e.message||e}`);}
}

await ensureDatabase();
await refreshRuntimeSystemSettings();
setInterval(processReservationReminders,30000);
setInterval(retryFailedNotificationEmails,60000);
processReservationReminders();
retryFailedNotificationEmails();
if (emailGatewayUrl && emailGatewayKey) {
  console.log('ORGROOM email gateway is configured.');
} else {
  console.warn(
    'ORGROOM email gateway is not configured. Email sending is disabled.'
  );
}

try {
  await dbQuery('SELECT 1');
  console.log('ORGROOM MariaDB connected.');
} catch (e) {
  console.error(`ORGROOM database connection failed: ${e.message}`);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ORGROOM API running on http://0.0.0.0:${PORT}`);
});