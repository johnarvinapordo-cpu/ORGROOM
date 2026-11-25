import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity, BarChart3, Building2, CalendarDays, CheckCircle2, Clock3,
  Crown, FileText, RefreshCw, Save, Settings2, ShieldCheck, Users
} from 'lucide-react';
import './super-admin.css';

const SECTIONS = [
  ['overview', 'Overview', BarChart3],
  ['settings', 'Global settings', Settings2],
  ['facilities', 'Facilities', Building2],
  ['schedules', 'Weekly schedules', CalendarDays],
  ['audit', 'Audit log', FileText]
];

function minuteToTime(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 1439) return '07:00';
  return `${String(Math.floor(number / 60)).padStart(2, '0')}:${String(number % 60).padStart(2, '0')}`;
}

function timeToMinute(value) {
  const match = String(value || '').match(/^(\d{2}):(\d{2})$/);
  if (!match) return NaN;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return NaN;
  return hour * 60 + minute;
}

function dateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila', dateStyle: 'medium', timeStyle: 'short'
  }).format(date);
}

function prettySettingTime(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '—';
  const h = Math.floor(number / 60);
  const m = number % 60;
  return new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila', hour: 'numeric', minute: '2-digit'
  }).format(new Date(Date.UTC(2026, 0, 1, h, m)));
}

function Metric({ label, value, detail, icon: Icon }) {
  return <article className="sa-metric">
    <div className="sa-metric-icon">{Icon ? <Icon size={18} /> : <Activity size={18} />}</div>
    <span>{label}</span>
    <strong>{value ?? '—'}</strong>
    {detail && <small>{detail}</small>}
  </article>;
}

export default function SuperAdminConsole({ api }) {
  const [section, setSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reports, setReports] = useState(null);
  const [settings, setSettings] = useState(null);
  const [audit, setAudit] = useState([]);
  const [auditHasMore, setAuditHasMore] = useState(false);
  const [auditLoadingMore, setAuditLoadingMore] = useState(false);
  const [facilities, setFacilities] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [facilityForm, setFacilityForm] = useState(null);
  const [facilityReason, setFacilityReason] = useState('');
  const [scheduleForm, setScheduleForm] = useState({
    facilityId: '', dayOfWeek: 'Monday', startTime: '07:00', endTime: '08:00',
    activityName: '', courseCode: '', courseTitle: '', program: '', yearBlock: '',
    instructor: '', termStart: '', termEnd: '', termDatesText: '', isActive: true
  });
  const [scheduleReason, setScheduleReason] = useState('');
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [settingsForm, setSettingsForm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [reportData, settingData, auditData, facilityData, scheduleData] = await Promise.all([
        api('/api/super-admin/reports'),
        api('/api/super-admin/settings'),
        api('/api/super-admin/audit-logs?limit=100'),
        api('/api/facilities'),
        api('/api/super-admin/weekly-schedules')
      ]);
      setReports(reportData);
      setSettings(settingData);
      setSettingsForm({
        maxAccounts: String(settingData.maxAccounts),
        startTime: minuteToTime(settingData.reservationStartMinutes),
        endTime: minuteToTime(settingData.reservationEndMinutes),
        reason: ''
      });
      setAudit(auditData || []);
      setAuditHasMore((auditData || []).length === 100);
      setFacilities(facilityData || []);
      setSchedules(scheduleData || []);
    } catch (e) {
      setError(e.message || 'Unable to load Super Admin system information.');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => { load(); }, [load]);

  const scheduleRows = useMemo(() => schedules.filter(row => row.isActive), [schedules]);

  const loadOlderAudit = async () => {
    setAuditLoadingMore(true);
    try {
      const rows = await api(`/api/super-admin/audit-logs?limit=100&offset=${audit.length}`);
      setAudit(current => [...current, ...(rows || [])]);
      setAuditHasMore((rows || []).length === 100);
    } catch (e) { setError(e.message || 'Unable to load older audit records.'); }
    finally { setAuditLoadingMore(false); }
  };

  const saveSettings = async event => {
    event.preventDefault();
    const start = timeToMinute(settingsForm?.startTime);
    const end = timeToMinute(settingsForm?.endTime);
    const maxAccounts = Number(settingsForm?.maxAccounts);
    if (!Number.isInteger(maxAccounts) || maxAccounts < 1 || maxAccounts > 1000) {
      setError('Account capacity must be a whole number from 1 to 1,000.');
      return;
    }
    if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) {
      setError('Enter a valid reservation window with the start time before the end time.');
      return;
    }
    if (String(settingsForm.reason || '').trim().length < 5) {
      setError('Provide a reason of at least five characters for this global settings change.');
      return;
    }
    setSaving(true); setError(''); setNotice('');
    try {
      await api('/api/super-admin/settings', {
        method: 'PUT',
        body: JSON.stringify({ maxAccounts, reservationStartMinutes: start, reservationEndMinutes: end, reason: settingsForm.reason })
      });
      setNotice('Global settings saved and audit recorded.');
      await load();
    } catch (e) { setError(e.message || 'Unable to save global settings.'); }
    finally { setSaving(false); }
  };

  const openFacility = facility => {
    setSelectedFacility(facility.id);
    setFacilityForm({
      name: facility.name || '', building: facility.building || '', buildingCode: facility.buildingCode || '',
      type: facility.type || '', description: facility.description || '', capacity: facility.capacity ?? '',
      status: facility.status || 'AVAILABLE', imageUrl: facility.imageUrl || '',
      amenities: Array.isArray(facility.amenities) ? facility.amenities.join(', ') : ''
    });
    setFacilityReason('');
  };

  const saveFacility = async event => {
    event.preventDefault();
    if (!selectedFacility || String(facilityReason).trim().length < 5) {
      setError('Select a facility and provide a reason of at least five characters.');
      return;
    }
    setSaving(true); setError(''); setNotice('');
    try {
      await api(`/api/super-admin/facilities/${selectedFacility}`, {
        method: 'PATCH',
        body: JSON.stringify({ ...facilityForm, capacity: facilityForm.capacity, amenities: String(facilityForm.amenities || '').split(',').map(x => x.trim()).filter(Boolean), reason: facilityReason })
      });
      setNotice('Facility details updated. The original facility record was preserved.');
      setSelectedFacility(null); setFacilityForm(null);
      await load();
    } catch (e) { setError(e.message || 'Unable to update facility.'); }
    finally { setSaving(false); }
  };

  const resetScheduleForm = () => {
    setEditingScheduleId(null);
    setScheduleReason('');
    setScheduleForm({
      facilityId: facilities[0]?.id ? String(facilities[0].id) : '', dayOfWeek: 'Monday',
      startTime: '07:00', endTime: '08:00', activityName: '', courseCode: '', courseTitle: '',
      program: '', yearBlock: '', instructor: '', termStart: '', termEnd: '', termDatesText: '', isActive: true
    });
  };

  const editSchedule = row => {
    setEditingScheduleId(row.id);
    setScheduleForm({
      facilityId: String(row.facilityId), dayOfWeek: row.dayOfWeek,
      startTime: String(row.startTime).slice(0, 5), endTime: String(row.endTime).slice(0, 5),
      activityName: row.activityName || '', courseCode: row.courseCode || '', courseTitle: row.courseTitle || '',
      program: row.program || '', yearBlock: row.yearBlock || '', instructor: row.instructor || '',
      termStart: row.termStart || '', termEnd: row.termEnd || '', termDatesText: row.termDatesText || '', isActive: Boolean(row.isActive)
    });
    setScheduleReason('');
  };

  const saveSchedule = async event => {
    event.preventDefault();
    if (!scheduleReason.trim() || scheduleReason.trim().length < 5) {
      setError('Provide a reason of at least five characters for this schedule change.');
      return;
    }
    setSaving(true); setError(''); setNotice('');
    try {
      const payload = { ...scheduleForm, facilityId: Number(scheduleForm.facilityId), reason: scheduleReason };
      await api(editingScheduleId ? `/api/super-admin/weekly-schedules/${editingScheduleId}` : '/api/super-admin/weekly-schedules', {
        method: editingScheduleId ? 'PATCH' : 'POST', body: JSON.stringify(payload)
      });
      setNotice(editingScheduleId ? 'Weekly schedule updated and audit recorded.' : 'Weekly schedule added and audit recorded.');
      resetScheduleForm();
      await load();
    } catch (e) { setError(e.message || 'Unable to save weekly schedule.'); }
    finally { setSaving(false); }
  };

  const deactivateSchedule = async row => {
    const reason = window.prompt(`Reason for deactivating “${row.activityName}” (minimum 5 characters):`);
    if (!reason || reason.trim().length < 5) return;
    if (!window.confirm(`Deactivate this schedule entry? The original record will be preserved.`)) return;
    setSaving(true); setError(''); setNotice('');
    try {
      await api(`/api/super-admin/weekly-schedules/${row.id}`, { method: 'DELETE', body: JSON.stringify({ reason }) });
      setNotice('Schedule entry deactivated. The record was preserved.');
      await load();
    } catch (e) { setError(e.message || 'Unable to deactivate this schedule.'); }
    finally { setSaving(false); }
  };

  return <div className="page sa-console">
    <div className="page-heading sa-page-heading">
      <div>
        <span className="eyebrow">SUPER ADMIN AUTHORITY</span>
        <h2>System oversight</h2>
        <p>Global controls, facility and schedule authority, reporting, and complete administrative activity.</p>
      </div>
      <button type="button" className="outline-btn" onClick={load} disabled={loading || saving}><RefreshCw size={16}/> Refresh</button>
    </div>

    <nav className="sa-tabs" aria-label="Super Admin sections">
      {SECTIONS.map(([key, label, Icon]) => <button key={key} type="button" className={section === key ? 'active' : ''} onClick={() => setSection(key)}><Icon size={16}/>{label}</button>)}
    </nav>

    {error && <div className="sa-alert sa-alert-error" role="alert">{error}</div>}
    {notice && <div className="sa-alert sa-alert-success" role="status">{notice}</div>}
    {loading && <div className="sa-loading"><RefreshCw className="sa-spin" size={18}/> Loading actual ORGROOM records…</div>}

    {!loading && section === 'overview' && reports && <>
      <div className="sa-metric-grid">
        <Metric label="Total accounts" value={reports.users?.total} detail={`${reports.users?.active || 0} active`} icon={Users}/>
        <Metric label="Reservations" value={reports.reservations?.total} detail={`${reports.reservations?.pending || 0} pending review`} icon={CalendarDays}/>
        <Metric label="Approved reservations" value={reports.reservations?.approved} detail="Current database records" icon={CheckCircle2}/>
        <Metric label="Facilities" value={reports.facilities?.length || 0} detail="Registered rooms and spaces" icon={Building2}/>
      </div>
      <div className="sa-two-col">
        <section className="panel sa-panel">
          <div className="panel-head"><div><h3>Account distribution</h3><p>Live counts from the users table.</p></div><Users size={18}/></div>
          <div className="sa-stat-lines">
            <div><span>Teachers</span><b>{reports.users?.teachers ?? 0}</b></div>
            <div><span>Regular Admins</span><b>{reports.users?.admins ?? 0}</b></div>
            <div><span>Super Admins</span><b>{reports.users?.superAdmins ?? 0}</b></div>
          </div>
        </section>
        <section className="panel sa-panel">
          <div className="panel-head"><div><h3>Reservation status</h3><p>Existing reservations grouped by status.</p></div><CalendarDays size={18}/></div>
          <div className="sa-stat-lines">
            {Object.entries(reports.reservations || {}).filter(([key]) => key !== 'total').map(([key, value]) => <div key={key}><span>{key}</span><b>{value}</b></div>)}
          </div>
        </section>
      </div>
      <section className="panel sa-panel">
        <div className="panel-head"><div><h3>Facility utilization</h3><p>Reservation counts and approved use from actual records.</p></div><Building2 size={18}/></div>
        <div className="sa-table-wrap"><table className="sa-table"><thead><tr><th>Facility</th><th>Status</th><th>Requests</th><th>Approved</th><th>Pending</th><th>Approved attendees</th></tr></thead><tbody>
          {(reports.facilities || []).map(row => <tr key={row.id}><td><b>{row.name}</b><small>{row.building}</small></td><td>{row.status}</td><td>{row.reservationCount}</td><td>{row.approvedCount}</td><td>{row.pendingCount}</td><td>{row.approvedAttendees}</td></tr>)}
        </tbody></table></div>
      </section>
      <section className="panel sa-panel">
        <div className="panel-head"><div><h3>Admin activity oversight</h3><p>Actions recorded in the ORGROOM audit log.</p></div><Activity size={18}/></div>
        <div className="sa-table-wrap"><table className="sa-table"><thead><tr><th>Administrator</th><th>Role</th><th>Actions</th><th>Latest activity</th></tr></thead><tbody>
          {(reports.adminActivity || []).map((row, index) => <tr key={`${row.actorUserId}-${index}`}><td><b>{row.actorName}</b><small>{row.actorEmail}</small></td><td>{row.actorRole}</td><td>{row.actionCount}</td><td>{dateTime(row.lastActivity)}</td></tr>)}
          {!reports.adminActivity?.length && <tr><td colSpan="4">No administrator activity has been recorded yet.</td></tr>}
        </tbody></table></div>
      </section>
    </>}

    {!loading && section === 'settings' && settingsForm && <section className="panel sa-panel sa-form-panel">
      <div className="panel-head"><div><h3>Global configuration</h3><p>Changes are validated by the backend and written to the audit log.</p></div><Settings2 size={18}/></div>
      <form onSubmit={saveSettings} className="sa-form-grid">
        <label>Maximum accounts<input type="number" min="1" max="1000" value={settingsForm.maxAccounts} onChange={e => setSettingsForm(v => ({ ...v, maxAccounts: e.target.value }))}/><small>Includes active and deactivated accounts. The limit cannot be set below the current account count.</small></label>
        <label>Earliest reservation start<input type="time" value={settingsForm.startTime} onChange={e => setSettingsForm(v => ({ ...v, startTime: e.target.value }))}/></label>
        <label>Latest reservation end<input type="time" value={settingsForm.endTime} onChange={e => setSettingsForm(v => ({ ...v, endTime: e.target.value }))}/></label>
        <div className="sa-setting-current"><Clock3 size={18}/><span>Current window: <b>{prettySettingTime(settings?.reservationStartMinutes)} – {prettySettingTime(settings?.reservationEndMinutes)}</b><small>Time zone: Asia/Manila</small></span></div>
        <label className="sa-form-wide">Reason for change<textarea required minLength="5" value={settingsForm.reason} onChange={e => setSettingsForm(v => ({ ...v, reason: e.target.value }))} placeholder="Explain why this global configuration is changing."/></label>
        <div className="sa-form-actions sa-form-wide"><button className="primary-btn" disabled={saving}><Save size={16}/>{saving ? 'Saving…' : 'Save global settings'}</button></div>
      </form>
    </section>}

    {!loading && section === 'facilities' && <div className="sa-two-col sa-facility-layout">
      <section className="panel sa-panel">
        <div className="panel-head"><div><h3>Facilities</h3><p>Select a room or space to manage its details.</p></div><Building2 size={18}/></div>
        <div className="sa-facility-list">
          {facilities.map(facility => <button type="button" key={facility.id} className={selectedFacility === facility.id ? 'active' : ''} onClick={() => openFacility(facility)}><span><b>{facility.name}</b><small>{facility.building}</small></span><small>{facility.status}</small></button>)}
        </div>
      </section>
      <section className="panel sa-panel">
        <div className="panel-head"><div><h3>Edit facility</h3><p>Existing record only. Changes are audited.</p></div><PencilFallback/></div>
        {!facilityForm ? <p className="sa-empty">Select a facility from the list.</p> : <form onSubmit={saveFacility} className="sa-form-grid">
          <label>Room / facility name<input required value={facilityForm.name} onChange={e => setFacilityForm(v => ({ ...v, name: e.target.value }))}/></label>
          <label>Building<input required value={facilityForm.building} onChange={e => setFacilityForm(v => ({ ...v, building: e.target.value }))}/></label>
          <label>Building code<input required value={facilityForm.buildingCode} onChange={e => setFacilityForm(v => ({ ...v, buildingCode: e.target.value }))}/></label>
          <label>Facility type<input required value={facilityForm.type} onChange={e => setFacilityForm(v => ({ ...v, type: e.target.value }))}/></label>
          <label>Capacity<input type="number" min="1" max="10000" value={facilityForm.capacity} onChange={e => setFacilityForm(v => ({ ...v, capacity: e.target.value }))}/></label>
          <label>Status<select value={facilityForm.status} onChange={e => setFacilityForm(v => ({ ...v, status: e.target.value }))}><option>AVAILABLE</option><option>MAINTENANCE</option><option>INACTIVE</option><option>CLOSED</option><option>UNAVAILABLE</option></select></label>
          <label className="sa-form-wide">Image URL<input type="url" value={facilityForm.imageUrl} onChange={e => setFacilityForm(v => ({ ...v, imageUrl: e.target.value }))}/></label>
          <label className="sa-form-wide">Description<textarea value={facilityForm.description} onChange={e => setFacilityForm(v => ({ ...v, description: e.target.value }))}/></label>
          <label className="sa-form-wide">Amenities, comma-separated<input value={facilityForm.amenities} onChange={e => setFacilityForm(v => ({ ...v, amenities: e.target.value }))}/></label>
          <label className="sa-form-wide">Reason for change<textarea required minLength="5" value={facilityReason} onChange={e => setFacilityReason(e.target.value)} placeholder="Required for the facility audit record."/></label>
          <div className="sa-form-actions sa-form-wide"><button className="primary-btn" disabled={saving}><Save size={16}/>Save facility</button></div>
        </form>}
      </section>
    </div>}

    {!loading && section === 'schedules' && <div className="sa-schedule-layout">
      <section className="panel sa-panel">
        <div className="panel-head"><div><h3>{editingScheduleId ? `Edit schedule #${editingScheduleId}` : 'Add weekly schedule'}</h3><p>Only Super Admin can change global room schedules. Existing entries are preserved.</p></div><CalendarDays size={18}/></div>
        <form onSubmit={saveSchedule} className="sa-form-grid">
          <label>Facility<select required value={scheduleForm.facilityId} onChange={e => setScheduleForm(v => ({ ...v, facilityId: e.target.value }))}><option value="">Select a facility</option>{facilities.map(f => <option key={f.id} value={f.id}>{f.building} — {f.name}</option>)}</select></label>
          <label>Day<select value={scheduleForm.dayOfWeek} onChange={e => setScheduleForm(v => ({ ...v, dayOfWeek: e.target.value }))}>{['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(day => <option key={day}>{day}</option>)}</select></label>
          <label>Start time<input type="time" required value={scheduleForm.startTime} onChange={e => setScheduleForm(v => ({ ...v, startTime: e.target.value }))}/></label>
          <label>End time<input type="time" required value={scheduleForm.endTime} onChange={e => setScheduleForm(v => ({ ...v, endTime: e.target.value }))}/></label>
          <label>Activity / course<input required value={scheduleForm.activityName} onChange={e => setScheduleForm(v => ({ ...v, activityName: e.target.value }))}/></label>
          <label>Course code<input value={scheduleForm.courseCode} onChange={e => setScheduleForm(v => ({ ...v, courseCode: e.target.value }))}/></label>
          <label>Program<input value={scheduleForm.program} onChange={e => setScheduleForm(v => ({ ...v, program: e.target.value }))}/></label>
          <label>Year / block<input value={scheduleForm.yearBlock} onChange={e => setScheduleForm(v => ({ ...v, yearBlock: e.target.value }))}/></label>
          <label>Instructor<input value={scheduleForm.instructor} onChange={e => setScheduleForm(v => ({ ...v, instructor: e.target.value }))}/></label>
          <label>Term start<input type="date" value={scheduleForm.termStart} onChange={e => setScheduleForm(v => ({ ...v, termStart: e.target.value }))}/></label>
          <label>Term end<input type="date" value={scheduleForm.termEnd} onChange={e => setScheduleForm(v => ({ ...v, termEnd: e.target.value }))}/></label>
          <label className="sa-form-wide">Term date notes<input value={scheduleForm.termDatesText} onChange={e => setScheduleForm(v => ({ ...v, termDatesText: e.target.value }))}/></label>
          <label className="sa-form-wide">Reason for change<textarea required minLength="5" value={scheduleReason} onChange={e => setScheduleReason(e.target.value)} placeholder="Required for the schedule audit record."/></label>
          <div className="sa-form-actions sa-form-wide"><button className="primary-btn" disabled={saving}><Save size={16}/>{editingScheduleId ? 'Save schedule' : 'Add schedule'}</button><button className="outline-btn" type="button" onClick={resetScheduleForm} disabled={saving}>Clear</button></div>
        </form>
      </section>
      <section className="panel sa-panel">
        <div className="panel-head"><div><h3>Current schedule records</h3><p>{scheduleRows.length} active entries · {schedules.length} total records</p></div><CalendarDays size={18}/></div>
        <div className="sa-table-wrap"><table className="sa-table"><thead><tr><th>Day / time</th><th>Facility / activity</th><th>Term</th><th>Actions</th></tr></thead><tbody>
          {schedules.map(row => <tr key={row.id} className={!row.isActive ? 'sa-row-inactive' : ''}><td><b>{row.dayOfWeek}</b><small>{row.startTime}–{row.endTime}</small></td><td><b>{facilities.find(f => Number(f.id) === Number(row.facilityId))?.name || `Facility #${row.facilityId}`}</b><small>{row.activityName}</small></td><td><small>{row.termStart || 'Any start'} – {row.termEnd || 'Any end'}</small><small>{row.isActive ? 'Active' : 'Inactive'}</small></td><td><div className="sa-inline-actions"><button type="button" className="outline-btn sa-small-btn" onClick={() => editSchedule(row)}>Edit</button>{row.isActive && <button type="button" className="outline-btn sa-small-btn" onClick={() => deactivateSchedule(row)}>Deactivate</button>}</div></td></tr>)}
          {!schedules.length && <tr><td colSpan="4">No weekly schedule records found.</td></tr>}
        </tbody></table></div>
      </section>
    </div>}

    {!loading && section === 'audit' && <section className="panel sa-panel">
      <div className="panel-head"><div><h3>Complete audit log</h3><p>Read-only record of system changes and administrative decisions.</p></div><FileText size={18}/></div>
      <div className="sa-audit-list">
        {audit.map(row => <article className="sa-audit-row" key={row.id}>
          <div className="sa-audit-marker"><Activity size={15}/></div>
          <div className="sa-audit-main"><div><b>{row.action.replaceAll('_', ' ')}</b><span>{row.entityType} · {row.entityId || '—'}</span></div><p>{row.actorName} · {row.actorRole} · {row.actorEmail || 'System'}</p>{row.reason && <small>Reason: {row.reason}</small>}
            {(row.previousValues || row.newValues) && <details><summary>View recorded changes</summary><pre>{JSON.stringify({ previous: row.previousValues, new: row.newValues }, null, 2)}</pre></details>}
          </div><time>{dateTime(row.createdAt)}</time>
        </article>)}
        {!audit.length && <p className="sa-empty">No audit entries have been recorded yet.</p>}
      </div>
      {auditHasMore && <div className="sa-load-more"><button type="button" className="outline-btn" onClick={loadOlderAudit} disabled={auditLoadingMore}>{auditLoadingMore ? 'Loading…' : 'Load older audit records'}</button></div>}
    </section>}
  </div>;
}

function PencilFallback() { return <Activity size={18}/>; }
