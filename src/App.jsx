import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays, ChevronLeft, ChevronRight, Clock3, DoorOpen, LayoutDashboard,
  LogOut, Menu, Search, Settings, ShieldCheck, UserRound, Users, Building2,
  CheckCircle2, XCircle, CircleAlert, Plus, Trash2, Pencil, SlidersHorizontal,
  ClipboardList, GraduationCap, BarChart3, Sparkles, Mail, LockKeyhole, Eye,
  EyeOff, RefreshCw, CalendarCheck2, MapPin, Wifi, Monitor, Wind, Armchair,
  Check, X, Send, ListChecks, Sun, Moon, ChevronDown, BellRing, Navigation, LocateFixed, Layers, RotateCcw, ArrowUp, ArrowDown, Footprints, Building, DoorClosed, Accessibility, Info, AlertTriangle
} from 'lucide-react';
import './styles.css';

const API = '';
const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const emptyForm = {
  orgName:'',
  eventType:'Academic Lecture',
  date:'',
  startTime:'09:00 AM',
  endTime:'10:00 AM',
  attendees:20,
  purpose:''
};

async function api(path, options={}) {
  let token='';
  try{ token=localStorage.getItem('orgroom-session')||''; }catch{}
  const res = await fetch(`${API}${path}`, {
    cache:'no-store',
    headers:{
      'Content-Type':'application/json',
      ...(token?{Authorization:`Bearer ${token}`}:{ }),
      ...(options.headers||{})
    },
    ...options
  });
  const body = await res.json().catch(()=>({}));
  if(!res.ok) {
    if(res.status===401 && path!=='/api/auth/me'){ try{localStorage.removeItem('orgroom-session');}catch{} }
    throw new Error(body.message || body.detail || 'Request failed.');
  }
  return body;
}

function initials(name='User'){
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0,2)
    .map(x=>x[0])
    .join('')
    .toUpperCase() || 'U';
}

function statusClass(status){
  return String(status||'').toLowerCase();
}

function parseTime(v){
  const m=String(v||'').match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if(!m) return NaN;

  let h=+m[1];
  let min=+m[2];

  if(m[3].toUpperCase()==='PM'&&h!==12) h+=12;
  if(m[3].toUpperCase()==='AM'&&h===12) h=0;

  return h*60+min;
}

function localTodayISO(){
  const d=new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function availabilityForRoom(room,{weekly=[],reservations=[],dateISO=localTodayISO(),now=new Date(),calendarIndicators=true}={}){
  const name=String(room?.name||room?._displayName||'').toLowerCase();
  if(calendarIndicators && (name.includes('church') || name.includes('pool'))) return {key:'available',status:'AVAILABLE',intervals:[]};
  const facilityStatus=String(room?.status||'AVAILABLE').toUpperCase();
  if(['MAINTENANCE','INACTIVE','CLOSED','DISABLED','UNAVAILABLE'].includes(facilityStatus)) return {key:'unavailable',status:'UNAVAILABLE',intervals:[]};
  const dayName=new Date(`${dateISO}T12:00:00`).toLocaleDateString('en-US',{weekday:'long'});
  const toMinutes=value=>{
    const m=String(value||'').trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i); if(!m)return NaN;
    let h=Number(m[1]), min=Number(m[2]); if(min>59)return NaN;
    if(m[3]){if(h<1||h>12)return NaN;if(m[3].toUpperCase()==='PM'&&h!==12)h+=12;if(m[3].toUpperCase()==='AM'&&h===12)h=0;}
    return h*60+min;
  };
  const intervals=[];
  (weekly||[]).filter(x=>Number(x.facilityId)===Number(room.id)&&x.dayOfWeek===dayName&&(!x.termStart||dateISO>=x.termStart)&&(!x.termEnd||dateISO<=x.termEnd)).forEach(x=>{const a=toMinutes(x.startTime),b=toMinutes(x.endTime);if(Number.isFinite(a)&&Number.isFinite(b)&&b>a)intervals.push([a,b,'SCHEDULED']);});
  (reservations||[]).filter(x=>x.date===dateISO&&(x.status==='APPROVED'||x.status==='PENDING')&&((x.facilityId&&Number(x.facilityId)===Number(room.id))||(!x.facilityId&&String(x.roomName).toLowerCase()===String(room.name).toLowerCase()&&String(x.building).toLowerCase()===String(room.building).toLowerCase()))).forEach(x=>{const parts=String(x.timeSlot||'').split(/\s*(?:-|–|—|to)\s*/i);const a=toMinutes(parts[0]),b=toMinutes(parts[1]);if(Number.isFinite(a)&&Number.isFinite(b)&&b>a)intervals.push([a,b,x.status]);});
  const nowMinutes=now.getHours()*60+now.getMinutes();
  const active=intervals.some(([a,b,status])=>status==='APPROVED'&&dateISO===localTodayISO()&&a<=nowMinutes&&nowMinutes<b);
  const pending=intervals.some(([, ,status])=>status==='PENDING');
  if(active)return {key:'unavailable',status:'OCCUPIED',intervals};
  if(pending || intervals.length)return {key:'limited',status:'LIMITED',intervals};
  return {key:'available',status:'AVAILABLE',intervals:[]};
}

function prettyDate(v){
  if(!v) return '';

  const d=new Date(`${v}T12:00:00`);

  return d.toLocaleDateString('en-US',{
    month:'short',
    day:'numeric',
    year:'numeric'
  });
}


/* ============================================================
   AUTHENTICATION
   ============================================================ */

function Auth({onLogin}){
  const [mode,setMode]=useState('login');
  const [step,setStep]=useState('form');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [position,setPosition]=useState('teacher');
  const [code,setCode]=useState('');
  const [newPassword,setNewPassword]=useState('');
  const [show,setShow]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [info,setInfo]=useState('');
  const [resendBusy,setResendBusy]=useState(false);

  const reset=()=>{
    setStep('form');
    setCode('');
    setError('');
    setInfo('');
  };

  const resendCode=async()=>{
    setResendBusy(true);
    setError('');
    setInfo('');
    try{
      const purpose=mode==='signup'?'signup':'login';
      const r=await api('/api/auth/verification/resend',{method:'POST',body:JSON.stringify({email,purpose})});
      setInfo(r.message);
    }catch(e){setError(e.message);}
    finally{setResendBusy(false);}
  };

  const submit=async()=>{
    setBusy(true);
    setError('');
    setInfo('');

    try{
      if(mode==='login'){

        if(step==='form'){
          const r=await api('/api/auth/login/request-code',{
            method:'POST',
            body:JSON.stringify({email,password})
          });
          if(r.verified && r.user){
            try{localStorage.setItem('orgroom-session',r.token||'');}catch{}
            onLogin(r.user);
            return;
          }
          setStep('code');
          setInfo(r.message);
        }else{
          const r=await api('/api/auth/login/verify',{
            method:'POST',
            body:JSON.stringify({email,code})
          });
          try{localStorage.setItem('orgroom-session',r.token||'');}catch{}
          onLogin(r.user);
        }

      } else if(mode==='signup'){

        if(step==='form'){

          const r=await api('/api/auth/signup/request-code',{
            method:'POST',
            body:JSON.stringify({
              email,
              password,
              position
            })
          });

          if(r.alreadyExists){
            setInfo(r.message);
            setStep('form');
          }else{
            setStep('code');
            setInfo(r.message);
          }

        } else {

          const r=await api('/api/auth/signup/verify',{
            method:'POST',
            body:JSON.stringify({
              email,
              code
            })
          });

          setMode('login');
          setStep('form');
          setPassword('');
          setCode('');
          setInfo('Account verified and created. Please sign in.');
        }

      } else {

        if(step==='form'){

          const r=await api('/api/auth/forgot-password/request-code',{
            method:'POST',
            body:JSON.stringify({
              email
            })
          });

          setStep('reset');
          setInfo(r.message);

        } else {

          await api('/api/auth/forgot-password/reset',{
            method:'POST',
            body:JSON.stringify({
              email,
              code,
              newPassword
            })
          });

          setMode('login');
          setStep('form');
          setPassword('');
          setNewPassword('');
          setCode('');
          setInfo('Password updated. You can sign in now.');
        }
      }

    }catch(e){
      setError(e.message);
    }finally{
      setBusy(false);
    }
  };

  const title=
    step==='code' && (mode==='login'||mode==='signup')
      ? 'Verify your email'
      : mode==='login'
        ? 'Welcome back'
        : mode==='signup'
          ? 'Create your account'
          : 'Reset your password';

  return (
    <div className="auth-page">

      <div className="auth-art">

        <div className="brand brand-lg">
          <div className="brand-mark">
            <DoorOpen/>
          </div>

          <div>
            <b>ORGROOM</b>
            <span>Campus space management</span>
          </div>
        </div>

        <div className="art-copy">

          <span className="eyebrow">
            CAMPUS OPERATIONS
          </span>

          <h1>
            Find a room.
            <br/>
            <em>Make it happen.</em>
          </h1>

          <p>
            One clean workspace for room availability,
            reservations, schedules, and approvals.
          </p>

          <div className="art-stats">

            <div>
              <strong>24/7</strong>
              <span>Availability view</span>
            </div>

            <div>
              <strong>1</strong>
              <span>Campus workspace</span>
            </div>

            <div>
              <strong>2</strong>
              <span>User roles</span>
            </div>

          </div>

        </div>
      </div>


      <div className="auth-card">

        <div className="mobile-brand brand">

          <div className="brand-mark">
            <DoorOpen/>
          </div>

          <div>
            <b>ORGROOM</b>
            <span>Campus space management</span>
          </div>

        </div>


        <div className="auth-head">

          <span className="eyebrow">
            SECURE ACCESS
          </span>

          <h2>
            {title}
          </h2>

          <p>
            {
              step==='code' && (mode==='login'||mode==='signup')
                ? 'We sent a verification code to your email address. Enter it below to continue.'
                : mode==='login'
                  ? 'Sign in to manage your campus space.'
                  : mode==='signup'
                    ? 'Use your approved campus email to register.'
                    : 'We will verify your email before changing the password.'
            }
          </p>

        </div>


        {error && (
          <div className="alert danger">
            <CircleAlert/>
            {error}
          </div>
        )}


        {info && (
          <div className="alert success">
            <CheckCircle2/>
            {info}
          </div>
        )}


        {step==='form' && mode!=='forgot' && (
          <div className="form-stack">

            <label>
              Email

              <input
                value={email}
                onChange={e=>setEmail(e.target.value)}
                placeholder="you@gmail.com"
                type="email"
              />
            </label>


            <label>
              Password

              <div className="input-icon">

                <LockKeyhole/>

                <input
                  value={password}
                  onChange={e=>setPassword(e.target.value)}
                  placeholder="••••••••"
                  type={show?'text':'password'}
                />

                <button
                  type="button"
                  onClick={()=>setShow(!show)}
                >
                  {show ? <EyeOff/> : <Eye/>}
                </button>

              </div>
            </label>


            {mode==='signup' && (
              <label>
                Position

                <select
                  value={position}
                  onChange={e=>setPosition(e.target.value)}
                >
                  <option value="teacher">Teacher</option>

                </select>
              </label>
            )}


            {mode==='login' && (
              <button
                className="link-button"
                onClick={()=>{
                  setMode('forgot');
                  reset();
                }}
              >
                Forgot password?
              </button>
            )}

          </div>
        )}


        {mode==='forgot' && step==='form' && (
          <div className="form-stack">

            <label>
              Email

              <input
                value={email}
                onChange={e=>setEmail(e.target.value)}
                placeholder="you@gmail.com"
                type="email"
              />
            </label>

          </div>
        )}


        {((mode==='login'&&step==='code')||(mode==='signup'&&step==='code')) && (
          <div className="form-stack">

            <label>
              Verification code

              <input
                className="code-input"
                value={code}
                onChange={e=>setCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
              />
            </label>

            <small>
              We sent a 6-digit code to <strong>{email}</strong>. It expires in 10 minutes.
            </small>

            {(mode==='login'||mode==='signup') && (
              <button type="button" className="auth-link-button" disabled={resendBusy} onClick={resendCode}>
                {resendBusy ? 'Sending…' : 'Resend Code'}
              </button>
            )}

          </div>
        )}


        {mode==='forgot' && step==='reset' && (
          <div className="form-stack">

            <label>
              Verification code

              <input
                className="code-input"
                value={code}
                onChange={e=>setCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
              />
            </label>

            <label>
              New password

              <input
                value={newPassword}
                onChange={e=>setNewPassword(e.target.value)}
                type="password"
                placeholder="At least 8 characters"
              />
            </label>

          </div>
        )}


        <button
          className="primary-btn auth-submit"
          disabled={busy}
          onClick={submit}
        >
          {
            busy
              ? 'Please wait…'
              : mode==='login'
                ? (step==='code'?'Verify & Sign in':'Sign in')
                : mode==='signup'
                  ? (step==='code'?'Verify account':'Create account')
                  : (step==='reset'?'Reset password':'Send code')
          }

          <ChevronRight/>
        </button>


        <div className="auth-switch">

          {
            mode==='login'
              ? (
                <>
                  No account?

                  <button
                    onClick={()=>{
                      setMode('signup');
                      reset();
                    }}
                  >
                    Create one
                  </button>
                </>
              )
              : (
                <>
                  Back to

                  <button
                    onClick={()=>{
                      setMode('login');
                      reset();
                    }}
                  >
                    Sign in
                  </button>
                </>
              )
          }

        </div>

      </div>
    </div>
  );
}


/* ============================================================
   REUSABLE CONFIRMATION DIALOG
   ============================================================ */
function ConfirmationDialog({open,title,description,confirmLabel='CONFIRM',cancelLabel='CANCEL',severity='normal',loading=false,error='',onCancel,onConfirm}){
  const cancelRef=React.useRef(null);
  useEffect(()=>{
    if(!open) return;
    const previous=document.activeElement;
    const timer=setTimeout(()=>cancelRef.current?.focus(),0);
    const onKeyDown=e=>{
      if(e.key==='Escape'){e.preventDefault();if(!loading)onCancel();return;}
      if(e.key==='Tab'){
        const nodes=[cancelRef.current,document.getElementById('orgroom-confirm-confirm')].filter(Boolean);
        if(nodes.length<2)return;
        const index=nodes.indexOf(document.activeElement);
        if(e.shiftKey&&index<=0){e.preventDefault();nodes[nodes.length-1].focus();}
        else if(!e.shiftKey&&index===nodes.length-1){e.preventDefault();nodes[0].focus();}
      }
    };
    document.addEventListener('keydown',onKeyDown);
    return()=>{clearTimeout(timer);document.removeEventListener('keydown',onKeyDown);previous?.focus?.();};
  },[open,loading,onCancel]);
  if(!open)return null;
  return <div className="modal-backdrop confirmation-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget&&!loading)onCancel();}}>
    <div className={`modal confirmation-modal ${severity==='danger'?'confirmation-danger':''}`} role="dialog" aria-modal="true" aria-labelledby="orgroom-confirm-title" aria-describedby="orgroom-confirm-description" onMouseDown={e=>e.stopPropagation()}>
      <div className={`confirmation-icon ${severity==='danger'?'danger':''}`} aria-hidden="true">{severity==='danger'?<AlertTriangle/>:<CircleAlert/>}</div>
      <div className="confirmation-copy"><h2 id="orgroom-confirm-title">{title}</h2><p id="orgroom-confirm-description">{description}</p>{error&&<div className="confirmation-error" role="alert"><CircleAlert/><span>{error}</span></div>}</div>
      <div className="confirmation-actions">
        <button ref={cancelRef} type="button" className="outline-btn" onClick={onCancel} disabled={loading}>{cancelLabel}</button>
        <button id="orgroom-confirm-confirm" type="button" className={severity==='danger'?'danger-btn':'primary-btn'} onClick={onConfirm} disabled={loading}>{loading?<><RefreshCw className="spin"/> Processing…</>:confirmLabel}</button>
      </div>
    </div>
  </div>;
}

/* ============================================================
   SIDEBAR
   ============================================================ */

function Sidebar({
  tab,
  setTab,
  user,
  onLogout,
  mobileOpen,
  setMobileOpen,
  sidebarCollapsed,
  setSidebarCollapsed
}){

  const items =
    user.role==='admin'
      ? [
          ['home','Overview',LayoutDashboard],
          ['calendar','Calendar',CalendarDays],
          ['rooms','Available Rooms',DoorOpen],
          ['reservations','Reservations',ClipboardList],
          ['requests','Requests',ShieldCheck],
        ]
      : [
          ['home','Overview',LayoutDashboard],
          ['calendar','Calendar',CalendarDays],
          ['rooms','Available Rooms',DoorOpen],
          ['reservations','My reservations',ClipboardList],
        ];

  return (
    <aside className={`sidebar ${mobileOpen?'open':''} ${sidebarCollapsed?'collapsed':''}`}>

      <div className="side-brand brand">

        <div className="brand-mark">
          <DoorOpen/>
        </div>

        <div className="brand-copy">
          <b>ORGROOM</b>
          <span>Campus operations</span>
        </div>

        <button
          className="sidebar-collapse-btn"
          onClick={()=>setSidebarCollapsed(v=>!v)}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!sidebarCollapsed}
        >
          {sidebarCollapsed ? <ChevronRight/> : <ChevronLeft/>}
        </button>

        <button
          className="mobile-close"
          onClick={()=>setMobileOpen(false)}
        >
          <X/>
        </button>

      </div>


      <div className="side-label">
        Workspace
      </div>


      <nav>

        {items.map(([id,label,Icon])=>(
          <button
            key={id}
            className={tab===id?'active':''}
            title={sidebarCollapsed ? label : undefined}
            onClick={()=>{
              setTab(id);
              setMobileOpen(false);
            }}
          >
            <Icon/>
            <span>{label}</span>

            {id==='requests' && (
              <span className="nav-dot">
                !
              </span>
            )}

          </button>
        ))}

      </nav>


      <div className="side-spacer"/>


      <div
        className="side-profile"
        onClick={()=>{
          setTab('profile');
          setMobileOpen(false);
        }}
      >

        <div className="avatar">
          {initials(user.name)}
        </div>

        <div className="side-user">
          <b>{user.name}</b>
          <span>
            {user.role} · {user.org}
          </span>
        </div>

        <Settings/>

      </div>


      <button
        className="logout-btn"
        onClick={onLogout}
      >
        <LogOut/>
        <span>Sign out</span>
      </button>

    </aside>
  );
}


/* ============================================================
   ADMIN SIDEBAR
   ============================================================ */

/* ============================================================
   ANDROID / MOBILE NAVIGATION
   Keeps the full desktop navigation intact while providing a
   native-app-style bottom navigation on small Android screens.
   ============================================================ */

function MobileBottomNav({tab,setTab,user}){
  const items = user.role==='admin'
    ? [
        ['home','Home',LayoutDashboard],
        ['requests','Requests',ShieldCheck],
        ['reservations','Reservations',ClipboardList],
        ['rooms','Available Rooms',DoorOpen],
        ['room-usage','Usage Check',ShieldCheck],
        ['user-management','Users',Users],
        ['profile','Profile',UserRound]
      ]
    : [
        ['home','Home',LayoutDashboard],
        ['calendar','Calendar',CalendarDays],
        ['rooms','Available Rooms',DoorOpen],
        ['reservations','Reservations',ClipboardList],
        ['profile','Profile',UserRound]
      ];

  return (
    <nav className="mobile-bottom-nav" style={{'--mobile-nav-count':items.length}} aria-label="Mobile navigation">
      {items.map(([id,label,Icon])=>(
        <button
          key={id}
          className={tab===id?'active':''}
          onClick={()=>setTab(id)}
          aria-label={label}
        >
          <span className="mobile-nav-icon">
            <Icon/>
            {id==='requests' && <i/>}
          </span>
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}


function AdminSidebar({
  tab,
  setTab,
  user,
  onLogout,
  mobileOpen,
  setMobileOpen,
  sidebarCollapsed,
  setSidebarCollapsed
}){

  const items=[
    ['home','Dashboard',LayoutDashboard],
    ['requests','Pending requests',ShieldCheck],
    ['reservations','Reservations',ClipboardList],
    ['rooms','Facilities',DoorOpen],
    ['calendar','Room calendar',CalendarDays],
    ['room-usage','Room Usage Check',ShieldCheck],
    ['user-management','User Management',Users],
  ];

  const pendingCount=0;

  return (
    <aside className={`sidebar admin-sidebar ${mobileOpen?'open':''} ${sidebarCollapsed?'collapsed':''}`}>

      <div className="admin-brand-block">
        <div className="side-brand brand">
          <div className="brand-mark admin-brand-mark">
            <ShieldCheck/>
          </div>
          <div className="brand-copy">
            <b>ORGROOM</b>
            <span>Admin control center</span>
          </div>
          <button
            className="sidebar-collapse-btn"
            onClick={()=>setSidebarCollapsed(v=>!v)}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!sidebarCollapsed}
          >
            {sidebarCollapsed ? <ChevronRight/> : <ChevronLeft/>}
          </button>
          <button
            className="mobile-close"
            onClick={()=>setMobileOpen(false)}
          >
            <X/>
          </button>
        </div>

        <div className="admin-role-badge">
          <ShieldCheck/>
          <span>Administrator</span>
        </div>
      </div>

      <div className="side-label">Management</div>

      <nav>
        {items.map(([id,label,Icon])=>(
          <button
            key={id}
            className={tab===id?'active':''}
            title={sidebarCollapsed ? label : undefined}
            onClick={()=>{
              setTab(id);
              setMobileOpen(false);
            }}
          >
            <Icon/>
            <span>{label}</span>
            {id==='requests' && pendingCount>0 && (
              <span className="nav-dot">{pendingCount}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="admin-side-summary">
        <span>OPERATIONS</span>
        <b>Keep campus spaces moving.</b>
        <p>Review requests, monitor rooms, and manage reservations from one place.</p>
      </div>

      <div className="side-spacer"/>

      <div
        className="side-profile admin-side-profile"
        onClick={()=>{
          setTab('profile');
          setMobileOpen(false);
        }}
      >
        <div className="avatar">{initials(user.name)}</div>
        <div className="side-user">
          <b>{user.name}</b>
          <span>Administrator · {user.org}</span>
        </div>
        <Settings/>
      </div>

      <button className="logout-btn" onClick={onLogout}>
        <LogOut/>
        <span>Sign out</span>
      </button>

    </aside>
  );
}


/* ============================================================
   TOPBAR
   ============================================================ */

function Topbar({
  title,
  subtitle,
  user,
  onMenu,
  onRefresh,
  loading,
  theme,
  onToggleTheme,
  notifications=[],
  unreadCount=0,
  onNotificationOpen,
  onNotificationClose,
  notificationsOpen=false
}){

  return (
    <header className={`topbar ${user.role==='admin' ? 'admin-topbar' : ''}`}>

      <button
        className="menu-btn"
        onClick={onMenu}
      >
        <Menu/>
      </button>


      <div>

        <h1>{title}</h1>
        <p>{subtitle}</p>

      </div>


      <div className="top-actions">

        <button
          className="theme-toggle"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun/> : <Moon/>}
        </button>

        <div className="notification-anchor">
          <button
            className={`icon-btn notification-btn ${notificationsOpen?'active':''}`}
            onClick={onNotificationOpen}
            title={unreadCount ? `${unreadCount} unread notification${unreadCount===1?'':'s'}` : 'Notifications'}
            aria-label={unreadCount ? `${unreadCount} unread notifications` : 'Notifications'}
            aria-expanded={notificationsOpen}
          >
            <BellRing/>
            {unreadCount>0 && <span className="notification-badge">{unreadCount>99?'99+':unreadCount}</span>}
          </button>
          {notificationsOpen && (
            <NotificationCenter
              notifications={notifications}
              unreadCount={unreadCount}
              onClose={onNotificationClose}
            />
          )}
        </div>

        <button
          className="icon-btn"
          onClick={onRefresh}
          title="Refresh"
        >
          <RefreshCw className={loading?'spin':''}/>
        </button>


        <div className="top-user">

          <div className="avatar">
            {initials(user.name)}
          </div>

          <div>
            <b>{user.name}</b>
            <span>{user.role}</span>
          </div>

        </div>

      </div>

    </header>
  );
}


/* ============================================================
   NOTIFICATIONS
   ============================================================ */

function NotificationCenter({notifications=[],unreadCount=0,onClose}){
  const navigate=async(notification)=>{
    try{ await api(`/api/notifications/${notification.id}/read`,{method:'POST'}); }catch{}
    if(typeof onClose==='function') onClose(notification);
  };

  return (
    <div className="notification-panel" role="dialog" aria-label="Notifications">
      <div className="notification-panel-head">
        <div>
          <span className="eyebrow">ORGROOM</span>
          <h3>Notifications</h3>
          <p>{unreadCount ? `${unreadCount} unread notification${unreadCount===1?'':'s'}` : 'You are all caught up.'}</p>
        </div>
        <button className="icon-btn notification-close" onClick={()=>onClose?.()} title="Close notifications" aria-label="Close notifications"><X/></button>
      </div>
      <div className="notification-list">
        {!notifications.length ? (
          <div className="notification-empty"><BellRing/><b>No new notifications</b><span>Important reservation activity will appear here.</span></div>
        ) : notifications.map(item=>(
          <button key={item.id} className={`notification-item ${item.isRead?'read':'unread'}`} onClick={()=>navigate(item)}>
            <span className={`notification-item-icon ${String(item.type||'').toLowerCase()}`}>
              {item.type==='RESERVATION_APPROVED'?<CheckCircle2/>:item.type==='RESERVATION_REJECTED'?<XCircle/>:item.type==='RESERVATION_CANCELLED'?<X/>:item.type==='RESERVATION_ENDING_5_MINUTES'?<AlertTriangle/>:item.type==='RESERVATION_ENDED'?<BellRing/>:<BellRing/>}
            </span>
            <span className="notification-item-copy">
              <span className="notification-item-title"><b>{item.title}</b>{!item.isRead&&<i/>}</span>
              <span>{item.message}</span>
              {(item.building||item.roomName) && <small>{item.building}{item.roomName?` · ${item.roomName}`:''}{item.date?` · ${prettyDate(item.date)}`:''}{item.timeSlot?` · ${item.timeSlot}`:''}</small>}
              <time>{notificationRelativeTime(item.createdAt)}</time>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function notificationRelativeTime(value){
  const time=new Date(value).getTime();
  if(!Number.isFinite(time)) return '';
  const diff=Math.max(0,Date.now()-time);
  const minutes=Math.floor(diff/60000);
  if(minutes<1) return 'Just now';
  if(minutes<60) return `${minutes}m ago`;
  const hours=Math.floor(minutes/60);
  if(hours<24) return `${hours}h ago`;
  const days=Math.floor(hours/24);
  if(days<7) return `${days}d ago`;
  return new Date(value).toLocaleDateString('en-US',{month:'short',day:'numeric'});
}

/* ============================================================
   STAT
   ============================================================ */

function Stat({
  icon:Icon,
  label,
  value,
  detail,
  tone=''
}){
  return (
    <div className={`stat-card ${tone}`}>

      <div className="stat-icon">
        <Icon/>
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>

    </div>
  );
}


/* ============================================================
   STATUS
   ============================================================ */

function Status({value}){
  return (
    <span className={`status ${statusClass(value)}`}>
      <i/>
      {value}
    </span>
  );
}


/* ============================================================
   OVERVIEW
   ============================================================ */

function Overview({
  user,
  rooms,
  reservations,
  setTab
}){

  const mine =
    user.role==='admin'
      ? reservations
      : reservations.filter(
          r=>r.userEmail===user.email
        );

  const approved =
    mine.filter(
      r=>r.status==='APPROVED'
    ).length;

  const pending =
    mine.filter(
      r=>r.status==='PENDING'
    ).length;

  const available =
    rooms.filter(
      r=>r.status==='AVAILABLE'
    ).length;

  return (
    <div className="page">

      <div className="welcome">

        <div>

          <span className="eyebrow">
            GOOD TO SEE YOU
          </span>

          <h2>
            {
              user.role==='admin'
                ? 'Operations overview'
                : `Hello, ${user.name.split(' ')[0]}.`
            }
          </h2>

          <p>
            {
              user.role==='admin'
                ? 'Monitor room demand and keep campus requests moving.'
                : 'Everything you need to find a space and keep track of your requests.'
            }
          </p>

        </div>


        <button
          className="primary-btn"
          onClick={()=>setTab('rooms')}
        >
          <Plus/>
          New reservation
        </button>

      </div>


      <div className="stats-grid">

        <Stat
          icon={DoorOpen}
          label="Available rooms"
          value={available}
          detail={`of ${rooms.length} facilities`}
          tone="green"
        />

        <Stat
          icon={ClipboardList}
          label={
            user.role==='admin'
              ? 'All requests'
              : 'My requests'
          }
          value={mine.length}
          detail={`${pending} awaiting action`}
          tone="blue"
        />

        <Stat
          icon={CheckCircle2}
          label="Approved"
          value={approved}
          detail="confirmed reservations"
          tone="purple"
        />

        <Stat
          icon={CalendarCheck2}
          label="Today"
          value={
            reservations.filter(
              r=>r.date===new Date().toISOString().slice(0,10)
            ).length
          }
          detail="reservations on campus"
          tone="orange"
        />

      </div>


      <div className="two-col">

        <section className="panel">

          <div className="panel-head">

            <div>
              <h3>
                {
                  user.role==='admin'
                    ? 'Recent requests'
                    : 'My recent requests'
                }
              </h3>

              <p>
                Latest reservation activity
              </p>
            </div>

            <button
              className="text-btn"
              onClick={()=>
                setTab(
                  user.role==='admin'
                    ? 'requests'
                    : 'reservations'
                )
              }
            >
              View all
              <ChevronRight/>
            </button>

          </div>


          {mine.slice(0,5).map(r=>(
            <div
              className="list-row"
              key={r.id}
            >

              <div className="row-icon">
                <DoorOpen/>
              </div>

              <div className="row-main">
                <b>{r.roomName}</b>
                <span>
                  {r.building} · {prettyDate(r.date)} · {r.timeSlot}
                </span>
              </div>

              <Status value={r.status}/>

            </div>
          ))}


          {!mine.length && (
            <Empty
              icon={ClipboardList}
              text="No reservations yet."
              action="Find a room"
              onClick={()=>setTab('rooms')}
            />
          )}

        </section>


        <section className="panel highlight-panel">

          <div className="panel-head">

            <div>
              <h3>Quick access</h3>
              <p>Jump to common tasks</p>
            </div>

            <Sparkles/>

          </div>


          <button
            className="quick-card"
            onClick={()=>setTab('rooms')}
          >
            <div>
              <DoorOpen/>
              <b>Explore rooms</b>
              <span>Browse facilities and capacity</span>
            </div>

            <ChevronRight/>
          </button>


          <button
            className="quick-card"
            onClick={()=>setTab('calendar')}
          >
            <div>
              <CalendarDays/>
              <b>Check calendar</b>
              <span>See scheduled room activity</span>
            </div>

            <ChevronRight/>
          </button>


          <button
            className="quick-card"
            onClick={()=>setTab('reservations')}
          >
            <div>
              <ClipboardList/>
              <b>My reservations</b>
              <span>Track your requests and reservation status</span>
            </div>

            <ChevronRight/>
          </button>

        </section>

      </div>


      {user.role==='admin' && (
        <section className="panel">

          <div className="panel-head">

            <div>
              <h3>Facility snapshot</h3>
              <p>Current room status</p>
            </div>

            <button
              className="text-btn"
              onClick={()=>setTab('rooms')}
            >
              Open rooms
              <ChevronRight/>
            </button>

          </div>


          <div className="mini-grid">

            {rooms.slice(0,8).map(r=>(
              <div
                className="mini-room"
                key={r.id}
              >

                <div>
                  <b>{r.name}</b>
                  <span>{r.building}</span>
                </div>

                <Status value={r.status}/>

              </div>
            ))}

          </div>

        </section>
      )}

    </div>
  );
}


/* ============================================================
   ADMIN DASHBOARD
   ============================================================ */

function AdminDashboard({
  rooms,
  reservations,
  weekly,
  setTab,
  onRefresh,
  loading
}){

  const pending=reservations.filter(r=>r.status==='PENDING');
  const approved=reservations.filter(r=>r.status==='APPROVED');
  const rejected=reservations.filter(r=>r.status==='REJECTED');
  const available=rooms.filter(r=>r.status==='AVAILABLE');
  const occupied=rooms.filter(r=>r.status!=='AVAILABLE');
  const today=new Date().toISOString().slice(0,10);
  const todayReservations=reservations.filter(r=>r.date===today);

  return (
    <div className="page admin-page">

      <section className="admin-welcome">
        <div>
          <span className="eyebrow">ADMINISTRATION</span>
          <h2>Operations control center</h2>
          <p>Monitor campus room activity, review requests, and keep reservations moving.</p>
        </div>

        <div className="admin-header-actions">
          <button className="outline-btn" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={loading?'spin':''}/>
            Refresh data
          </button>
          <button className="primary-btn" onClick={()=>setTab('requests')}>
            <ShieldCheck/>
            Review requests
          </button>
        </div>
      </section>

      <div className="admin-stat-grid">
        <div className="admin-stat-card admin-stat-alert" onClick={()=>setTab('requests')}>
          <div className="admin-stat-icon"><ShieldCheck/></div>
          <div>
            <span>Pending requests</span>
            <strong>{pending.length}</strong>
            <small>Requires admin review</small>
          </div>
          <ChevronRight/>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon"><CheckCircle2/></div>
          <div>
            <span>Approved reservations</span>
            <strong>{approved.length}</strong>
            <small>{todayReservations.length} scheduled today</small>
          </div>
        </div>

        <div className="admin-stat-card" onClick={()=>setTab('rooms')}>
          <div className="admin-stat-icon"><DoorOpen/></div>
          <div>
            <span>Available facilities</span>
            <strong>{available.length}</strong>
            <small>of {rooms.length} total rooms</small>
          </div>
          <ChevronRight/>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon"><ClipboardList/></div>
          <div>
            <span>Total requests</span>
            <strong>{reservations.length}</strong>
            <small>{rejected.length} rejected</small>
          </div>
        </div>
      </div>

      <div className="admin-dashboard-grid">

        <section className="panel admin-panel admin-request-panel">
          <div className="admin-panel-head">
            <div>
              <span className="eyebrow">ACTION QUEUE</span>
              <h3>Requests needing attention</h3>
              <p>Review the newest reservation requests first.</p>
            </div>
            <button className="text-btn" onClick={()=>setTab('requests')}>
              Open queue <ChevronRight/>
            </button>
          </div>

          {pending.slice(0,5).map(r=>(
            <div className="admin-request-row" key={r.id}>
              <div className="admin-request-icon"><ClipboardList/></div>
              <div className="admin-row-main">
                <b>{r.roomName}</b>
                <span>{r.userName} · {prettyDate(r.date)} · {r.timeSlot}</span>
              </div>
              <div className="admin-row-meta">
                <Status value={r.status}/>
              </div>
            </div>
          ))}

          {!pending.length && (
            <div className="admin-clear-state">
              <CheckCircle2/>
              <div>
                <b>No pending requests</b>
                <span>The admin queue is clear.</span>
              </div>
            </div>
          )}
        </section>

        <section className="panel admin-panel admin-actions-panel">
          <div className="admin-panel-head">
            <div>
              <span className="eyebrow">MANAGEMENT</span>
              <h3>Administrative tools</h3>
              <p>Jump directly to the areas you manage most.</p>
            </div>
          </div>

          <button className="admin-action-card" onClick={()=>setTab('rooms')}>
            <span className="admin-action-icon"><DoorOpen/></span>
            <span><b>Manage facilities</b><small>{rooms.length} rooms in the system</small></span>
            <ChevronRight/>
          </button>

          <button className="admin-action-card" onClick={()=>setTab('reservations')}>
            <span className="admin-action-icon"><ClipboardList/></span>
            <span><b>Reservation management</b><small>{reservations.length} reservation records</small></span>
            <ChevronRight/>
          </button>

          <button className="admin-action-card" onClick={()=>setTab('calendar')}>
            <span className="admin-action-icon"><CalendarDays/></span>
            <span><b>Room calendar</b><small>{weekly.length} scheduled entries loaded</small></span>
            <ChevronRight/>
          </button>
        </section>
      </div>

      <div className="admin-dashboard-grid admin-lower-grid">
        <section className="panel admin-panel">
          <div className="admin-panel-head">
            <div>
              <span className="eyebrow">FACILITY STATUS</span>
              <h3>Room availability</h3>
              <p>Current status of campus spaces.</p>
            </div>
            <button className="text-btn" onClick={()=>setTab('rooms')}>View facilities <ChevronRight/></button>
          </div>

          <div className="admin-room-grid">
            {rooms.slice(0,8).map(room=>(
              <div className="admin-room-status" key={room.id}>
                <div className="admin-room-status-icon"><DoorOpen/></div>
                <div>
                  <b>{room.name}</b>
                  <span>{room.building} · {room.capacity ? `${room.capacity} seats` : 'Capacity not listed'}</span>
                </div>
                <Status value={room.status}/>
              </div>
            ))}
          </div>
        </section>

        <section className="panel admin-panel admin-activity-panel">
          <div className="admin-panel-head">
            <div>
              <span className="eyebrow">RECENT ACTIVITY</span>
              <h3>Latest reservations</h3>
              <p>Most recently submitted requests.</p>
            </div>
          </div>

          {reservations.slice(0,6).map(r=>(
            <div className="admin-activity-row" key={r.id}>
              <div className="admin-activity-dot"/>
              <div>
                <b>{r.roomName}</b>
                <span>{r.userName} · {prettyDate(r.date)}</span>
              </div>
              <Status value={r.status}/>
            </div>
          ))}

          {!reservations.length && (
            <div className="admin-clear-state">
              <ClipboardList/>
              <div>
                <b>No reservation activity</b>
                <span>New requests will appear here.</span>
              </div>
            </div>
          )}
        </section>
      </div>

      <div className="admin-summary-strip">
        <div><span>Available</span><b>{available.length}</b></div>
        <div><span>In use / unavailable</span><b>{occupied.length}</b></div>
        <div><span>Today</span><b>{todayReservations.length}</b></div>
        <div><span>Pending</span><b>{pending.length}</b></div>
      </div>

    </div>
  );
}


/* ============================================================
   ROOM / BUILDING DISPLAY NORMALIZATION
   Keeps the stored database values intact while normalizing
   obvious schedule naming variations for display.
   ============================================================ */

const ROOM_BUILDING_ORDER = [
  'School Building',
  'BDO Building',
  'Building A',
  'Building B',
  'TECHVOC Building',
  'SHS Bay 2 Building'
];

function cleanRoomText(value=''){
  return String(value || '')
    .replace(/\s+/g,' ')
    .replace(/\s*[-–—]\s*/g,' - ')
    .trim();
}

function normalizeBuildingName(building='', roomName=''){
  const value=cleanRoomText(building);
  const room=cleanRoomText(roomName);
  const source=`${value} ${room}`.trim();

  if(/^(school building|sch\.?\s*bldg\.?)/i.test(value) || /^(school building|sch\.?\s*bldg\.?)/i.test(room))
    return 'School Building';

  if(/^bdo\s*(building|bldg\.?)/i.test(value) || /^bdo\s*(building|bldg\.?)/i.test(room))
    return 'BDO Building';

  if(/^building\s*a\b/i.test(value) || /^building\s*a\b/i.test(room))
    return 'Building A';

  if(/^building\s*b\b/i.test(value) || /^building\s*b\b/i.test(room))
    return 'Building B';

  if(/^techvoc\s*(building)?/i.test(value) || /^techvoc\s*(building)?/i.test(room))
    return 'TECHVOC Building';

  if(/^shs\s*(bay\s*2\s*)?(campus|building)/i.test(value) || /^shs\s*(bay\s*2\s*)?(campus|building)/i.test(room))
    return 'SHS Bay 2 Building';

  if(/^wellness\s*room/i.test(value) || /^wellness\s*room/i.test(room))
    return 'Wellness Room';

  if(/^computer laboratory bay 2/i.test(value) || /^computer laboratory bay 2/i.test(room))
    return 'Computer Laboratory Bay 2';

  return value || room || 'Other Facilities';
}

function normalizeRoomName(name='', building=''){
  let value=cleanRoomText(name);
  const source=`${cleanRoomText(building)} ${value}`.trim();

  value=value
    .replace(/^school\s+building\s*/i,'')
    .replace(/^sch\.?\s*bldg\.?\s*/i,'')
    .replace(/^bdo\s+(?:building|bldg\.?)\s*/i,'')
    .replace(/^building\s+a\s*/i,'')
    .replace(/^building\s+b\s*/i,'')
    .replace(/^techvoc\s+building\s*/i,'')
    .replace(/^shs\s+bay\s*2\s+(?:campus|building)\s*/i,'')
    .replace(/^shs\s+(?:campus|building)\s*/i,'')
    .replace(/^computer\s+laboratory\s+bay\s*2\s*[-–—]?\s*/i,'')
    .replace(/^wellness\s+room\s*/i,'');

  value=value
    .replace(/^rm\.?\s*/i,'Room ')
    .replace(/^room\s*/i,'Room ')
    .replace(/\s+/g,' ')
    .trim();

  if(/^\d+$/.test(value)) value=`Room ${value}`;

  if(/^chemistry$/i.test(value)) value='Chemistry Laboratory';
  if(/^sch\.?\s*bldg\.?\s*[-–—]?\s*chemistry laboratory$/i.test(source)) value='Chemistry Laboratory';
  if(/^activity area$/i.test(value)) value='Activity Area';

  return value || cleanRoomText(name) || 'Unnamed Room';
}

function roomDisplayData(room){
  const building=normalizeBuildingName(room.building,room.name);
  const name=normalizeRoomName(room.name,room.building);
  return {
    ...room,
    _displayBuilding:building,
    _displayName:name
  };
}

function isBuildingOnlyFacility(room){
  const building=normalizeBuildingName(room.building,room.name).toLowerCase();
  const name=normalizeRoomName(room.name,room.building).toLowerCase();
  const rawName=cleanRoomText(room.name).toLowerCase();
  const rawBuilding=cleanRoomText(room.building).toLowerCase();

  if(!rawName || !rawBuilding) return false;

  const looksLikeBuilding=/\b(building|bldg\.?|campus)\b/i.test(rawName) ||
    /^(school|bdo|techvoc|shs)\b/i.test(rawName);

  return looksLikeBuilding && (
    rawName===rawBuilding ||
    /^(school building|sch\.?\s*bldg\.?|bdo building|bdo bldg\.?|building a|building b|techvoc building|shs bay 2 building|shs campus)$/i.test(rawName)
  );
}

function naturalRoomSort(a,b){
  const an=a._displayName || a.name || '';
  const bn=b._displayName || b.name || '';
  const aNum=an.match(/\d+/);
  const bNum=bn.match(/\d+/);

  if(aNum && bNum && Number(aNum[0])!==Number(bNum[0]))
    return Number(aNum[0])-Number(bNum[0]);

  if(aNum && !bNum) return -1;
  if(!aNum && bNum) return 1;

  return an.localeCompare(bn,undefined,{numeric:true,sensitivity:'base'});
}

function buildingSort(a,b){
  const ai=ROOM_BUILDING_ORDER.indexOf(a);
  const bi=ROOM_BUILDING_ORDER.indexOf(b);

  if(ai!==-1 || bi!==-1){
    if(ai===-1) return 1;
    if(bi===-1) return -1;
    return ai-bi;
  }

  return a.localeCompare(b,undefined,{numeric:true,sensitivity:'base'});
}

function groupRoomsByBuilding(rooms=[]){
  const groups=new Map();

  rooms
    .filter(room=>!isBuildingOnlyFacility(room))
    .map(room=>roomDisplayData(room))
    .forEach(room=>{
      if(!groups.has(room._displayBuilding))
        groups.set(room._displayBuilding,[]);

      groups.get(room._displayBuilding).push(room);
    });

  return [...groups.entries()]
    .sort((a,b)=>buildingSort(a[0],b[0]))
    .map(([building,items])=>[
      building,
      items.sort(naturalRoomSort)
    ]);
}

/* ============================================================
   ROOMS
   ============================================================ */

function Rooms({
  rooms,
  user,
  weekly,
  reservations,
  onBook
}){

  const [q,setQ]=useState('');
  const [building,setBuilding]=useState('ALL');
  const [type,setType]=useState('ALL');
  const [liveTick,setLiveTick]=useState(Date.now());

  // Keep the recommendation display synchronized with the current clock.
  useEffect(()=>{const t=setInterval(()=>setLiveTick(Date.now()),10000);return()=>clearInterval(t);},[]);

  const now=new Date(liveTick);
  const todayISO=localTodayISO();

  const displayRooms=rooms
    .filter(room=>!isBuildingOnlyFacility(room))
    .map(room=>({...roomDisplayData(room),status:availabilityForRoom(room,{weekly,reservations,calendarIndicators:false}).status}));

  const buildings=[
    ...new Set(
      displayRooms.map(r=>r._displayBuilding)
    )
  ].sort(buildingSort);

  const types=[
    ...new Set(
      displayRooms.map(r=>r.type)
    )
  ].sort((a,b)=>String(a||'').localeCompare(String(b||'')));

  const filtered=displayRooms.filter(r=>
    (building==='ALL'||r._displayBuilding===building) &&
    (type==='ALL'||r.type===type) &&
    `${r._displayName} ${r._displayBuilding} ${r.type}`
      .toLowerCase()
      .includes(q.toLowerCase())
  );

  const grouped=groupRoomsByBuilding(filtered);

  const parseLiveMinutes=value=>{
    const m=String(value||'').trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
    if(!m)return NaN;
    let h=Number(m[1]), min=Number(m[2]);
    if(min>59)return NaN;
    if(m[3]){const ap=m[3].toUpperCase();if(h<1||h>12)return NaN;if(ap==='PM'&&h!==12)h+=12;if(ap==='AM'&&h===12)h=0;}
    return h*60+min;
  };
  const currentMinute=now.getHours()*60+now.getMinutes();
  const currentDay=now.toLocaleDateString('en-US',{weekday:'long'});
  const isAvailableNow=room=>{
    const facilityStatus=String(room.status||'AVAILABLE').toUpperCase();
    if(['MAINTENANCE','INACTIVE','CLOSED','DISABLED','UNAVAILABLE'].includes(facilityStatus))return false;
    const scheduled=(weekly||[]).some(x=>Number(x.facilityId)===Number(room.id)&&x.dayOfWeek===currentDay&&(!x.termStart||todayISO>=x.termStart)&&(!x.termEnd||todayISO<=x.termEnd)&&(()=>{const a=parseLiveMinutes(x.startTime),b=parseLiveMinutes(x.endTime);return Number.isFinite(a)&&Number.isFinite(b)&&a<=currentMinute&&currentMinute<b;})());
    if(scheduled)return false;
    const occupied=(reservations||[]).some(x=>x.date===todayISO&&(x.status==='APPROVED'||x.status==='PENDING')&&((x.facilityId&&Number(x.facilityId)===Number(room.id))||(!x.facilityId&&String(x.roomName).toLowerCase()===String(room.name).toLowerCase()&&String(x.building).toLowerCase()===String(room.building).toLowerCase()))&&(()=>{const parts=String(x.timeSlot||'').split(/\s*(?:-|–|—|to)\s*/i),a=parseLiveMinutes(parts[0]),b=parseLiveMinutes(parts[1]);return Number.isFinite(a)&&Number.isFinite(b)&&a<=currentMinute&&currentMinute<b;})());
    return !occupied;
  };
  const liveRooms=displayRooms.filter(isAvailableNow)
    .sort((a,b)=>String(a._displayBuilding).localeCompare(String(b._displayBuilding))||naturalRoomSort(a,b))
    .slice(0,6);

  return (
    <div className="page">

      <div className="page-heading">

        <div>
          <span className="eyebrow">
            FACILITIES
          </span>

          <h2>
            Available Rooms
          </h2>

          <p>
            See which rooms are available right now, then browse by building or facility type.
          </p>
        </div>

        <div className="result-count">
          {filtered.length} rooms
        </div>

      </div>


      <section className="available-now-panel">
        <div className="available-now-head">
          <div>
            <span className="eyebrow">LIVE AVAILABILITY</span>
            <h3>Available right now</h3>
            <p>Recommended rooms are based on the current time, today's schedules, and active pending/approved reservations.</p>
          </div>
          <span className="live-indicator"><i/> Live</span>
        </div>
        {liveRooms.length ? (
          <div className="available-now-grid">
            {liveRooms.map(room=>(
              <button className="available-now-card" key={room.id} onClick={()=>onBook(room)}>
                <span className="available-now-icon"><DoorOpen/></span>
                <span className="available-now-main"><b>{room._displayName}</b><small>{room._displayBuilding}{room.capacity ? ` · ${room.capacity} seats` : ''}</small></span>
                <span className="available-now-status">Available</span>
                <ChevronRight/>
              </button>
            ))}
          </div>
        ) : (
          <div className="available-now-empty"><CircleAlert/><span><b>No room is available right now.</b><small>Check again shortly or use the calendar to find the next available time.</small></span></div>
        )}
      </section>


      <div className="filters">

        <div className="search-box">
          <Search/>

          <input
            value={q}
            onChange={e=>setQ(e.target.value)}
            placeholder="Search rooms, buildings, facilities…"
          />
        </div>


        <select
          value={building}
          onChange={e=>setBuilding(e.target.value)}
        >
          <option value="ALL">
            All buildings
          </option>

          {buildings.map(x=>(
            <option key={x} value={x}>
              {x}
            </option>
          ))}

        </select>


        <select
          value={type}
          onChange={e=>setType(e.target.value)}
        >
          <option value="ALL">
            All types
          </option>

          {types.map(x=>(
            <option key={x} value={x}>
              {x}
            </option>
          ))}

        </select>

      </div>


      <div className="building-groups">

        {grouped.map(([buildingName,buildingRooms])=>(
          <section
            className="building-room-section"
            key={buildingName}
          >

            <div className="building-room-heading">
              <div>
                <span className="eyebrow">
                  BUILDING
                </span>
                <h3>
                  {buildingName}
                </h3>
              </div>

              <span className="building-room-count">
                {buildingRooms.length} {buildingRooms.length===1 ? 'room' : 'rooms'}
              </span>
            </div>

            <div className="room-grid">
              {buildingRooms.map(room=>(
                <RoomCard
                  key={room.id}
                  room={room}
                  onBook={()=>onBook(room)}
                />
              ))}
            </div>

          </section>
        ))}

      </div>


      {!filtered.length && (
        <Empty
          icon={Search}
          text="No rooms match your filters."
        />
      )}

    </div>
  );
}


/* ============================================================
   ROOM CARD
   ============================================================ */

function RoomCard({
  room,
  onBook
}){

  return (
    <article className="room-card">

      <div className="room-top">

        <div className="room-symbol">
          <DoorOpen/>
        </div>

        <Status value={room.status}/>

      </div>


      <div className="room-body">

        <span className="room-building">
          <Building2/>
          {room._displayBuilding || room.building}
        </span>

        <h3>
          {room._displayName || room.name}
        </h3>

        <p>
          {room.description ||
            'Flexible campus space for classes, meetings, and approved activities.'
          }
        </p>


        <div className="room-meta">

          <span>
            <Users/>
            {room.capacity ? `${room.capacity} seats` : 'Capacity not listed'}
          </span>

          <span>
            <Armchair/>
            {room.type}
          </span>

        </div>


        <div className="amenities">

          {(room.amenities||[])
            .slice(0,4)
            .map(a=>(
              <span key={a}>
                {a}
              </span>
            ))}

        </div>

      </div>


      <button
        className="outline-btn full"
        disabled={room.status==='OCCUPIED'||room.status==='UNAVAILABLE'}
        onClick={onBook}
      >
        {
          room.status==='OCCUPIED'
            ? 'Currently occupied'
            : room.status==='UNAVAILABLE'
              ? 'Currently unavailable'
              : 'Reserve this room'
        }

        <ChevronRight/>
      </button>

    </article>
  );
}


/* ============================================================
   CAMPUS MAP / INDOOR NAVIGATION
   Geometry is intentionally a lightweight reconstruction of the
   supplied CMDI floor-plan references. Room identity still comes
   from the live facilities table; unknown rooms are not invented.
   ============================================================ */
/* ============================================================
   RESERVATION MODAL
   ============================================================ */

function ReservationModal({
  room,
  initialDate,
  user,
  onClose,
  onCreated,
  requestConfirmation
}){

  const [form,setForm]=useState({
    ...emptyForm,
    date:initialDate || localTodayISO(),
    orgName:user.org,
    eventType:'Academic Lecture',
    attendees:30
  });
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [schedule,setSchedule]=useState({weekly:[],reservations:[]});
  const [scheduleSegments,setScheduleSegments]=useState([]);
  const [scheduleWindow,setScheduleWindow]=useState({start:7*60,end:21*60});
  const [scheduleLoading,setScheduleLoading]=useState(false);
  const [scheduleError,setScheduleError]=useState('');
  const initialForm=useMemo(()=>({
    ...emptyForm,
    date:initialDate || localTodayISO(),
    orgName:user.org,
    eventType:'Academic Lecture',
    attendees:30
  }),[user.org,user.role,initialDate]);
  const isDirty=JSON.stringify(form)!==JSON.stringify(initialForm);
  const handleClose=()=>{
    if(!isDirty||!requestConfirmation){onClose();return;}
    requestConfirmation({
      title:'Discard your changes?',
      description:'Your unsaved reservation details will be lost if you leave this form.',
      confirmLabel:'DISCARD CHANGES',
      cancelLabel:'KEEP EDITING',
      severity:'danger',
      action:async()=>onClose()
    });
  };

  const set=(k,v)=>setForm(f=>({...f,[k]:v}));

  const parseScheduleTime=value=>{
    const text=String(value||'').trim();
    const m=text.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
    if(!m)return NaN;
    let hour=Number(m[1]);
    const minute=Number(m[2]);
    const ap=m[3]?.toUpperCase();
    if(minute>59)return NaN;
    if(ap){
      if(hour<1||hour>12)return NaN;
      if(ap==='PM'&&hour!==12)hour+=12;
      if(ap==='AM'&&hour===12)hour=0;
    }
    return hour*60+minute;
  };

  const toClock=minutes=>{
    const value=Math.max(0,Math.round(Number(minutes)||0));
    const h=Math.floor(value/60)%24;
    const m=value%60;
    const ap=h>=12?'PM':'AM';
    const hour=h%12||12;
    return `${String(hour).padStart(2,'0')}:${String(m).padStart(2,'0')} ${ap}`;
  };

  const dateLabel=form.date
    ? new Date(`${form.date}T12:00:00`).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})
    : 'Select a date';

  useEffect(()=>{
    let cancelled=false;
    if(!room?.id||!form.date)return;
    let firstLoad=true;
    const refreshSchedule=async()=>{
      if(firstLoad) setScheduleLoading(true);
      try{
        const data=await api(`/api/room-schedule?facilityId=${encodeURIComponent(room.id)}&date=${encodeURIComponent(form.date)}`);
        if(cancelled)return;
        setSchedule({weekly:data.weekly||[],reservations:data.reservations||[]});
        setScheduleSegments(Array.isArray(data.segments)?data.segments:[]);
        setScheduleWindow({start:Number.isFinite(Number(data.operatingStart))?Number(data.operatingStart):7*60,end:Number.isFinite(Number(data.operatingEnd))?Number(data.operatingEnd):21*60});
        setScheduleError('');
      }catch(e){
        if(cancelled)return;
        setScheduleError(e.message||'Unable to refresh the room schedule.');
        if(firstLoad){
          setSchedule({weekly:[],reservations:[]});
          setScheduleSegments([]);
        }
      }finally{
        if(!cancelled&&firstLoad)setScheduleLoading(false);
        firstLoad=false;
      }
    };
    refreshSchedule();
    const timer=setInterval(refreshSchedule,10000);
    return ()=>{cancelled=true;clearInterval(timer);};
  },[room?.id,form.date]);

  const scheduleBlocks=useMemo(()=>{
    const blocks=[];
    schedule.weekly.forEach(item=>{
      const start=parseScheduleTime(item.startTime),end=parseScheduleTime(item.endTime);
      if(Number.isFinite(start)&&Number.isFinite(end)&&end>start){
        blocks.push({start,end,status:'OCCUPIED',label:item.activityName||item.courseTitle||'Scheduled activity',detail:[item.courseCode,item.organizationName,item.instructor].filter(Boolean).join(' · ')});
      }
    });
    schedule.reservations.forEach(item=>{
      const parts=String(item.timeSlot||'').split(/\s*(?:-|–|—|to)\s*/i);
      const start=parseScheduleTime(parts[0]),end=parseScheduleTime(parts[1]);
      if(Number.isFinite(start)&&Number.isFinite(end)&&end>start){
        blocks.push({start,end,status:item.status==='PENDING'?'PENDING':'OCCUPIED',label:item.status==='PENDING'?'Pending reservation request':'Reserved',detail:item.purpose||item.eventType||''});
      }
    });
    blocks.sort((a,b)=>a.start-b.start||a.end-b.end);
    const merged=[];
    blocks.forEach(block=>{
      const last=merged[merged.length-1];
      if(last && block.start<last.end){
        last.end=Math.max(last.end,block.end);
        last.status=last.status==='OCCUPIED'||block.status==='OCCUPIED'?'OCCUPIED':'PENDING';
        last.label=last.status==='OCCUPIED'?'Occupied / scheduled':'Pending reservation request';
        last.detail=[last.detail,block.detail].filter(Boolean).join(' · ');
      }else merged.push({...block});
    });
    return merged;
  },[schedule]);

  const operatingStart=scheduleWindow.start;
  const operatingEnd=scheduleWindow.end;
  const requestedStart=parseScheduleTime(form.startTime);
  const requestedEnd=parseScheduleTime(form.endTime);
  const requestedDuration=Number.isFinite(requestedStart)&&Number.isFinite(requestedEnd)&&requestedEnd>requestedStart ? requestedEnd-requestedStart : 0;

  const availability=useMemo(()=>{
    if(scheduleLoading)return {state:'LOADING',message:'Checking this room against the latest schedule…',conflict:null};
    if(scheduleError)return {state:'UNKNOWN',message:'Schedule could not be refreshed. Final submission will still perform the server availability check.',conflict:null};
    if(!Number.isFinite(requestedStart)||!Number.isFinite(requestedEnd)||requestedEnd<=requestedStart)
      return {state:'INVALID',message:'Enter a valid start and end time to check availability.',conflict:null};
    if(requestedStart<operatingStart||requestedEnd>operatingEnd)
      return {state:'UNAVAILABLE',message:`Reservations for this calendar use the existing ${toClock(operatingStart)}–${toClock(operatingEnd)} operating window.`,conflict:{start:Math.max(operatingStart,requestedStart),end:Math.min(operatingEnd,requestedEnd)}};
    const conflict=scheduleBlocks.find(block=>requestedStart<block.end&&block.start<requestedEnd);
    if(conflict){
      return {state:'UNAVAILABLE',message:`This room is ${conflict.status==='PENDING'?'pending':'occupied'} from ${toClock(conflict.start)}–${toClock(conflict.end)}.`,conflict};
    }
    return {state:'AVAILABLE',message:'This time is available.',conflict:null};
  },[scheduleLoading,scheduleError,requestedStart,requestedEnd,scheduleBlocks]);

  const recommendations=useMemo(()=>{
    if(!requestedDuration||scheduleLoading||scheduleError||!scheduleSegments.length)return [];
    const today=localTodayISO();
    const now=new Date();
    const currentMinute=now.getHours()*60+now.getMinutes();
    return scheduleSegments
      .filter(segment=>segment.status==='AVAILABLE')
      .map(segment=>{
        const start=Math.max(segment.start,form.date===today?currentMinute:operatingStart);
        const end=Math.min(segment.end,operatingEnd);
        return {start,end,duration:end-start};
      })
      .filter(g=>g.end>g.start&&g.duration>=requestedDuration)
      .filter(g=>!(requestedStart<g.end&&g.start<requestedEnd))
      .slice(0,5);
  },[requestedDuration,scheduleSegments,scheduleLoading,scheduleError,requestedStart,requestedEnd,form.date,operatingStart,operatingEnd]);

  const useSuggestedTime=(item)=>{
    set('startTime',toClock(item.start));
    set('endTime',toClock(Math.min(item.start+requestedDuration,item.end)));
    setError('');
  };

  const submit=async e=>{
    e.preventDefault();
    setError('');
    const a=parseTime(form.startTime),b=parseTime(form.endTime);
    if(!Number.isFinite(a)||!Number.isFinite(b)||b-a<15){setError('End time must be later than start time and the reservation must be at least 15 minutes.');return;}
    if(room.capacity!=null&&Number(room.capacity)>0&&+form.attendees>Number(room.capacity)){setError(`This room holds up to ${room.capacity} people.`);return;}
    if(availability.state==='UNAVAILABLE'){setError(availability.message);return;}
    setBusy(true);
    try{
      const created=await api('/api/reservations',{method:'POST',body:JSON.stringify({
        userName:user.name,userEmail:user.email,userRole:user.role,orgName:form.orgName,facilityId:room.id,roomName:room.name,building:room.building,date:form.date,timeSlot:`${form.startTime} - ${form.endTime}`,attendees:+form.attendees,purpose:form.purpose,eventType:form.eventType,priority:user.role==='teacher'
      })});
      onCreated(created);
    }catch(e){
      setError(e.message);
      try{
        const fresh=await api(`/api/room-schedule?facilityId=${encodeURIComponent(room.id)}&date=${encodeURIComponent(form.date)}`);
        setSchedule({weekly:fresh.weekly||[],reservations:fresh.reservations||[]});
      }catch{}
    }finally{setBusy(false);}
  };

  const visualBlocks=scheduleError
    ? [{start:operatingStart,end:operatingEnd,status:'UNKNOWN',label:'Schedule unavailable'}]
    : scheduleSegments.length
      ? scheduleSegments.map(segment=>({...segment}))
      : scheduleLoading
        ? [{start:operatingStart,end:operatingEnd,status:'UNKNOWN',label:'Checking latest schedule…'}]
        : [{start:operatingStart,end:operatingEnd,status:'AVAILABLE',label:'Available'}];

  return (
    <div className="modal-backdrop">
      <div className="modal wide reservation-smart-modal">
        <button className="modal-close" onClick={handleClose} aria-label="Close reservation form"><X/></button>
        <div className="modal-hero">
          <div className="room-symbol big"><DoorOpen/></div>
          <div><span className="eyebrow">NEW RESERVATION</span><h2>{room.name}</h2><p>{room.building} · {room.capacity ? `${room.capacity} seats` : 'Capacity not listed'} · {room.type}</p></div>
        </div>

        {error&&<div className="alert danger"><CircleAlert/>{error}</div>}

        <div className="reservation-smart-layout">
          <form onSubmit={submit} className="form-grid reservation-form-panel">
            <label>Organization / department<input value={form.orgName} onChange={e=>set('orgName',e.target.value)} required/></label>
            <label>Event type<select value={form.eventType} onChange={e=>set('eventType',e.target.value)}><option>Academic Lecture</option><option>Departmental Exam</option><option>Meeting</option><option>Training / Workshop</option><option>School Event</option><option>Other</option></select></label>
            <label>Date<input type="date" value={form.date} onChange={e=>set('date',e.target.value)} required/></label>
            <label>Attendees<input type="number" min="1" max={room.capacity||undefined} value={form.attendees} onChange={e=>set('attendees',e.target.value)} required/></label>
            <label>Start time<input value={form.startTime} onChange={e=>set('startTime',e.target.value)} placeholder="09:00 AM" required/></label>
            <label>End time<input value={form.endTime} onChange={e=>set('endTime',e.target.value)} placeholder="10:00 AM" required/></label>
            <label className="span-2">Purpose<textarea value={form.purpose} onChange={e=>set('purpose',e.target.value)} placeholder="What will the room be used for?" required/></label>

            <div className="reservation-summary-card span-2">
              <div><span className="eyebrow">RESERVATION SUMMARY</span><h3>{room.building} · {room.name}</h3></div>
              <div className="reservation-summary-grid"><span><small>Date</small><b>{dateLabel}</b></span><span><small>Time</small><b>{form.startTime} – {form.endTime}</b></span></div>
              <div className={`reservation-availability-result ${availability.state.toLowerCase()}`} role="status">
                {availability.state==='AVAILABLE'?<CheckCircle2/>:availability.state==='UNAVAILABLE'?<XCircle/>:<Clock3/>}
                <div><b>{availability.state==='AVAILABLE'?'Available':availability.state==='UNAVAILABLE'?'Unavailable':availability.state==='LOADING'?'Checking availability…':'Availability check'}</b><span>{availability.message}</span></div>
              </div>
            </div>

            <div className="modal-actions span-2">
              <button type="button" className="outline-btn" onClick={handleClose}>Cancel</button>
              <button className="primary-btn" disabled={busy||availability.state==='UNAVAILABLE'||availability.state==='LOADING'}>{busy?'Checking availability…':'Submit request'}<Send/></button>
            </div>
          </form>

          <section className="room-schedule-panel" aria-label="Room schedule and availability">
            <div className="room-schedule-heading"><div><span className="eyebrow">SMART SCHEDULE</span><h3>Room availability</h3><p>{room.name} · {dateLabel}</p></div><RefreshCw className={scheduleLoading?'spin':''}/></div>
            <div className="schedule-legend"><span><i className="schedule-state-dot available"/>✓ Available</span><span><i className="schedule-state-dot occupied"/>× Occupied</span><span><i className="schedule-state-dot pending"/>! Pending</span></div>
            <div className="schedule-timeline-wrap">
              <div className="schedule-timeline-labels">{Array.from({length:8},(_,i)=>operatingStart+Math.round((operatingEnd-operatingStart)*i/7)).map((minute,i)=><span key={i}>{toClock(minute)}</span>)}</div>
              <div className="schedule-timeline" aria-label="Room availability timeline">
                {visualBlocks.map((block,i)=><div key={`${block.start}-${block.end}-${i}`} className={`schedule-segment ${block.status.toLowerCase()}`} style={{width:`${((block.end-block.start)/(operatingEnd-operatingStart))*100}%`}} title={`${block.label}: ${toClock(block.start)}–${toClock(block.end)}`}><span>{block.status==='AVAILABLE'?'✓':block.status==='PENDING'?'!':block.status==='UNKNOWN'?'•':'×'}</span></div>)}
              </div>
              <div className="schedule-block-list">
                {scheduleLoading?<div className="schedule-empty"><Clock3/><span>Loading the latest room schedule…</span></div>:scheduleError?<div className="schedule-empty schedule-empty-error"><AlertTriangle/><span>We could not refresh this room's schedule. No availability is being assumed.</span></div>:!scheduleBlocks.length?<div className="schedule-empty"><CheckCircle2/><span>No scheduled or reserved periods for this date. The operating window is currently open.</span></div>:scheduleBlocks.map((block,i)=><div className={`schedule-block ${block.status.toLowerCase()}`} key={`${block.start}-${block.end}-${i}`}><div className="schedule-block-icon">{block.status==='PENDING'?<Clock3/>:<XCircle/>}</div><div><b>{block.label}</b><span>{toClock(block.start)} – {toClock(block.end)}</span>{block.detail&&<small>{block.detail}</small>}</div></div>)}
              </div>
            </div>

            <div className="suggestion-panel">
              <div className="suggestion-heading"><div><span className="eyebrow">SMART RECOMMENDATIONS</span><h3>Suggested available times</h3></div><Sparkles/></div>
              {recommendations.length?<div className="suggestion-list">{recommendations.map((item,i)=><div className="suggestion-card" key={`${item.start}-${item.end}`}><div className="suggestion-time"><CheckCircle2/><div><b>{toClock(item.start)} – {toClock(Math.min(item.start+requestedDuration,item.end))}</b><span>Available for {Math.floor(item.duration/60)}h{item.duration%60?` ${item.duration%60}m`:''}</span></div></div><button type="button" className="text-btn" onClick={()=>useSuggestedTime(item)}>Use this time <ChevronRight/></button></div>)}</div>:<div className="suggestion-empty"><Sparkles/><span>{availability.state==='UNAVAILABLE'?'No available gap currently matches the requested duration. Try a shorter duration or another date.':'Enter a valid duration to see real available gaps.'}</span></div>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CALENDAR
   ============================================================ */

function Calendar({
  rooms,
  reservations,
  weekly,
  onBook
}){

  const today=new Date();

  const toLocalISO=(value)=>{
    const d=value instanceof Date ? value : new Date(value);
    const y=d.getFullYear();
    const m=String(d.getMonth()+1).padStart(2,'0');
    const day=String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  };

  const [selectedDate,setSelectedDate]=useState(today);
  const [viewMonth,setViewMonth]=useState(
    new Date(today.getFullYear(),today.getMonth(),1)
  );
  const [expandedBuilding,setExpandedBuilding]=useState(null);

  const selectedISO=toLocalISO(selectedDate);
  const validRooms=rooms
    .filter(room=>!isBuildingOnlyFacility(room))
    .map(room=>roomDisplayData(room));

  const grouped=groupRoomsByBuilding(validRooms);

  const schedulesForDate=(dateISO)=>{
    const date=new Date(`${dateISO}T12:00:00`);
    const dayName=date.toLocaleDateString('en-US',{weekday:'long'});

    return weekly.filter(
      schedule=>{
        if(schedule.dayOfWeek!==dayName) return false;
        if(schedule.termStart && dateISO < schedule.termStart) return false;
        if(schedule.termEnd && dateISO > schedule.termEnd) return false;
        return true;
      }
    );
  };

  const reservationsForDate=(dateISO)=>reservations.filter(
    reservation=>
      reservation.date===dateISO &&
      (
        reservation.status==='APPROVED' ||
        reservation.status==='PENDING'
      )
  );

  const parseTimeValue=(value)=>{
    const text=String(value||'').trim();
    const m=text.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);

    if(!m) return NaN;

    let hour=Number(m[1]);
    const minute=Number(m[2]);
    const meridiem=m[3]?.toUpperCase();

    if(minute>59) return NaN;

    if(meridiem){
      if(hour<1 || hour>12) return NaN;
      if(meridiem==='PM' && hour!==12) hour+=12;
      if(meridiem==='AM' && hour===12) hour=0;
    }

    return hour*60+minute;
  };

  const reservationIntervals=(reservation)=>{
    const parts=String(reservation.timeSlot||'').split(/\s*(?:-|–|—|to)\s*/i);
    if(parts.length<2) return [];

    const start=parseTimeValue(parts[0]);
    const end=parseTimeValue(parts[1]);

    if(Number.isNaN(start) || Number.isNaN(end) || end<=start)
      return [];

    return [[start,end]];
  };

  const mergeIntervals=(intervals)=>{
    const sorted=intervals
      .filter(([start,end])=>Number.isFinite(start)&&Number.isFinite(end)&&end>start)
      .sort((a,b)=>a[0]-b[0]);

    const merged=[];

    sorted.forEach(([start,end])=>{
      const last=merged[merged.length-1];

      if(!last || start>last[1])
        merged.push([start,end]);
      else
        last[1]=Math.max(last[1],end);
    });

    return merged;
  };

  const roomAvailability=(room,dateISO=selectedISO)=>{
    const result=availabilityForRoom(room,{weekly,reservations,dateISO,calendarIndicators:true});
    const merged=mergeIntervals(result.intervals.map(([start,end])=>[start,end]));
    if(result.status==='UNAVAILABLE') return {key:'unavailable',label:'Not Available',className:'calendar-availability-unavailable',intervals:merged};
    const operatingStart=7*60;
    const operatingEnd=21*60;
    const covered=merged.reduce((sum,[start,end])=>sum+Math.max(0,Math.min(end,operatingEnd)-Math.max(start,operatingStart)),0);
    if(covered>=operatingEnd-operatingStart) return {key:'unavailable',label:'Not Available',className:'calendar-availability-unavailable',intervals:merged};
    if(merged.length) return {key:'limited',label:'Limited Availability',className:'calendar-availability-limited',intervals:merged};
    return {key:'available',label:'Available',className:'calendar-availability-available',intervals:[]};
  };

  const groupedFacilityRooms=grouped
    .map(([buildingName,buildingRooms])=>[
      buildingName,
      buildingRooms.map(room=>({
        room,
        availability:roomAvailability(room)
      }))
    ]);

  const availabilityCounts=groupedFacilityRooms.reduce(
    (totals,[,buildingRooms])=>{
      buildingRooms.forEach(({availability})=>{
        totals[availability.key]+=1;
      });
      return totals;
    },
    {available:0,limited:0,unavailable:0}
  );

  const dayAvailability=(dateISO)=>{
    const statuses=validRooms.map(room=>roomAvailability(room,dateISO).key);

    if(!statuses.length) return null;
    if(statuses.every(status=>status==='unavailable')) return 'unavailable';
    if(statuses.some(status=>status!=='available')) return 'limited';
    return 'available';
  };

  const monthLabel=viewMonth.toLocaleDateString(
    'en-US',
    {month:'long',year:'numeric'}
  );

  const firstDay=viewMonth.getDay();
  const daysInMonth=new Date(
    viewMonth.getFullYear(),
    viewMonth.getMonth()+1,
    0
  ).getDate();

  const calendarCells=[];
  const totalCalendarCells=Math.ceil((firstDay+daysInMonth)/7)*7;

  for(let index=0;index<totalCalendarCells;index++){
    const dayNumber=index-firstDay+1;

    if(dayNumber<1 || dayNumber>daysInMonth){
      calendarCells.push(null);
      continue;
    }

    const cellDate=new Date(
      viewMonth.getFullYear(),
      viewMonth.getMonth(),
      dayNumber
    );

    const cellISO=toLocalISO(cellDate);
    const isToday=cellISO===toLocalISO(today);
    const isSelected=cellISO===selectedISO;

    calendarCells.push({
      date:cellDate,
      iso:cellISO,
      day:dayNumber,
      isToday,
      isSelected,
      availability:dayAvailability(cellISO)
    });
  }

  const selectDate=(cellDate)=>{
    setSelectedDate(cellDate);
  };

  const changeMonth=(offset)=>{
    const nextMonth=new Date(
      viewMonth.getFullYear(),
      viewMonth.getMonth()+offset,
      1
    );

    setViewMonth(nextMonth);
    setSelectedDate(nextMonth);
  };

  return (
    <div className="page">

      <div className="page-heading">

        <div>
          <span className="eyebrow">
            AVAILABILITY
          </span>

          <h2>
            Room calendar
          </h2>

          <p>
            Select a date to see facilities and rooms with availability.
          </p>
        </div>

        <div className="calendar-availability-legend">
          <span>Availability</span>
          <span><i className="availability-dot available"/>Available</span>
          <span><i className="availability-dot limited"/>Limited</span>
          <span><i className="availability-dot unavailable"/>Not available</span>
        </div>

      </div>

      <section className="monthly-calendar-card">

        <div className="monthly-calendar-header">
          <button
            className="calendar-month-button"
            onClick={()=>changeMonth(-1)}
            aria-label="Previous month"
            title="Previous month"
          >
            <ChevronLeft/>
          </button>

          <div className="monthly-calendar-title">
            <span className="eyebrow">MONTH</span>
            <h3>{monthLabel}</h3>
          </div>

          <div className="monthly-calendar-actions">
            <button
              className="today-btn"
              onClick={()=>{
                setViewMonth(new Date(today.getFullYear(),today.getMonth(),1));
                setSelectedDate(today);
              }}
            >
              Today
            </button>

            <button
              className="calendar-month-button"
              onClick={()=>changeMonth(1)}
              aria-label="Next month"
              title="Next month"
            >
              <ChevronRight/>
            </button>
          </div>
        </div>

        <div className="monthly-calendar-weekdays">
          {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(dayName=>(
            <div key={dayName}>{dayName}</div>
          ))}
        </div>

        <div className="monthly-calendar-grid">
          {calendarCells.map((cell,index)=>
            cell ? (
              <button
                key={cell.iso}
                className={`monthly-calendar-day ${cell.isToday?'is-today':''} ${cell.isSelected?'is-selected':''}`}
                onClick={()=>selectDate(cell.date)}
              >
                <span className="monthly-calendar-day-number">
                  {cell.day}
                </span>
                {cell.isToday && <span className="monthly-calendar-today-label">Today</span>}
                {cell.availability && (
                  <span
                    className={`monthly-calendar-availability ${cell.availability}`}
                    title={
                      cell.availability==='available'
                        ? 'Rooms available'
                        : cell.availability==='limited'
                          ? 'Some rooms have schedules or reservations'
                          : 'Rooms unavailable'
                    }
                  >
                    <i className={`availability-dot ${cell.availability}`} />
                    <span>{cell.availability==='available'?'Available':cell.availability==='limited'?'Limited':'Unavailable'}</span>
                  </span>
                )}
              </button>
            ) : (
              <div
                className="monthly-calendar-day empty"
                key={`empty-${index}`}
              />
            )
          )}
        </div>

      </section>

      <div className="selected-date-banner">
        <div>
          <span className="eyebrow">SELECTED DATE</span>
          <strong>{selectedDate.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</strong>
        </div>
        <div className="selected-date-stats">
          <span><b>{availabilityCounts.available}</b> available</span>
          <span><b>{availabilityCounts.limited}</b> limited</span>
          <span><b>{groupedFacilityRooms.length}</b> facilities</span>
        </div>
      </div>

      <div className="calendar-summary">
        <div>
          <CalendarDays/>
          <b>{monthLabel}</b>
          <span>{daysInMonth} days · click any date to check availability</span>
        </div>

        <div>
          <DoorOpen/>
          <b>{availabilityCounts.available}</b>
          <span>rooms fully available</span>
        </div>

        <div>
          <ClipboardList/>
          <b>{availabilityCounts.limited}</b>
          <span>rooms with schedules or reservations</span>
        </div>
      </div>

      <div className="calendar-facilities-heading">
        <div>
          <span className="eyebrow">AVAILABLE FACILITIES</span>
          <h3>Buildings and room availability on {selectedDate.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</h3>
        </div>
      </div>

      <div className="calendar-facility-groups">
        {groupedFacilityRooms.map(([buildingName,buildingRooms])=>{
          const isExpanded=expandedBuilding===buildingName;
          const buildingCounts=buildingRooms.reduce(
            (totals,{availability})=>{
              totals[availability.key]+=1;
              return totals;
            },
            {available:0,limited:0,unavailable:0}
          );

          return (
            <section
              className={`calendar-facility-section ${isExpanded?'is-expanded':''}`}
              key={buildingName}
            >
              <button
                type="button"
                className="calendar-facility-header"
                onClick={()=>setExpandedBuilding(current=>current===buildingName?null:buildingName)}
                aria-expanded={isExpanded}
              >
                <div className="calendar-facility-header-main">
                  <span className="calendar-facility-chevron">
                    <ChevronDown/>
                  </span>
                  <div>
                    <span className="eyebrow">BUILDING</span>
                    <h3>{buildingName}</h3>
                  </div>
                </div>

                <div className="calendar-facility-header-meta">
                  <span className="calendar-building-count">
                    {buildingRooms.length} {buildingRooms.length===1?'room':'rooms'}
                  </span>
                  <span className="calendar-building-statuses">
                    {buildingCounts.available>0 && <span><i className="availability-dot available"/>{buildingCounts.available}</span>}
                    {buildingCounts.limited>0 && <span><i className="availability-dot limited"/>{buildingCounts.limited}</span>}
                    {buildingCounts.unavailable>0 && <span><i className="availability-dot unavailable"/>{buildingCounts.unavailable}</span>}
                  </span>
                </div>
              </button>

              <div className="calendar-facility-expand">
                <div className="calendar-room-availability-list">
                  {buildingRooms.map(({room,availability})=>(
                    <article
                      className={`calendar-room-availability ${availability.className}`}
                      key={room.id}
                    >
                      <div className="calendar-room-availability-icon">
                        <DoorOpen/>
                      </div>

                      <div className="calendar-room-availability-info">
                        <b>{room._displayName}</b>
                        <span>{room.capacity ? `${room.capacity} seats` : 'Capacity not listed'} · {room.type}</span>
                      </div>

                      <div className="calendar-room-availability-status">
                        <i className={`availability-dot ${availability.key}`}/>
                        <span>{availability.label}</span>
                      </div>

                      <button
                        className="text-btn"
                        onClick={()=>onBook(room,selectedISO)}
                      >
                        Request room
                        <ChevronRight/>
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {!groupedFacilityRooms.length && (
        <Empty
          icon={CalendarDays}
          text="No facilities have an available room for the selected date."
        />
      )}

    </div>
  );
}

/* ============================================================
   RESERVATION REMINDER / TIMER
   ============================================================ */
function formatRemaining(ms){const total=Math.max(0,Math.floor(ms/1000));const h=Math.floor(total/3600),m=Math.floor((total%3600)/60),sec=total%60;return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;}
function reservationPhase(reservation,nowMs){
  if(!reservation||reservation.status!=='APPROVED'||!Number.isFinite(Number(reservation.startMs))||!Number.isFinite(Number(reservation.endMs)))return'UNAVAILABLE';
  const start=Number(reservation.startMs),end=Number(reservation.endMs);
  if(nowMs<start)return'UPCOMING';
  if(nowMs<end)return end-nowMs<=5*60*1000?'ENDING_SOON':'IN_PROGRESS';
  return'ENDED';
}
function ReservationTimerCard({reservation,compact=false}){
  const [serverNowMs,setServerNowMs]=useState(null),[syncedAt,setSyncedAt]=useState(null),[tick,setTick]=useState(Date.now());
  useEffect(()=>{let cancelled=false;const sync=async()=>{try{const data=await api('/api/server-time');if(!cancelled){setServerNowMs(Number(data.serverNowMs));setSyncedAt(Date.now());}}catch{}};sync();const a=setInterval(sync,10000),b=setInterval(()=>setTick(Date.now()),1000);return()=>{cancelled=true;clearInterval(a);clearInterval(b);};},[]);
  const now=serverNowMs==null?Date.now():serverNowMs+(tick-(syncedAt||tick)),phase=reservationPhase(reservation,now);if(phase==='UNAVAILABLE')return null;const start=Number(reservation.startMs),end=Number(reservation.endMs),remaining=phase==='UPCOMING'?start-now:phase==='IN_PROGRESS'||phase==='ENDING_SOON'?end-now:0;
  return <div className={`reservation-timer ${phase.toLowerCase()} ${compact?'compact':''}`}><div className="reservation-timer-icon">{phase==='ENDED'?<CheckCircle2/>:phase==='ENDING_SOON'?<AlertTriangle/>:<Clock3/>}</div><div className="reservation-timer-copy"><span className="reservation-timer-label">{phase==='UPCOMING'?'Starts in':phase==='IN_PROGRESS'?'Ends in':phase==='ENDING_SOON'?'Ending in':'Reservation ended'}</span>{phase==='ENDED'?<b className="reservation-timer-ended">Reservation time has ended.</b>:<b className="reservation-timer-value">{formatRemaining(remaining)}</b>}{phase==='ENDING_SOON'&&<span className="reservation-live"><i/> 5 MINUTES OR LESS REMAINING</span>}{phase==='IN_PROGRESS'&&<span className="reservation-live"><i/> IN PROGRESS</span>}</div></div>;
}
function ReservationReminderCenter({reservations,user}){
  const [serverNowMs,setServerNowMs]=useState(null),[syncedAt,setSyncedAt]=useState(null),[tick,setTick]=useState(Date.now()),[notice,setNotice]=useState(null);
  useEffect(()=>{let cancelled=false;const sync=async()=>{try{const data=await api('/api/server-time');if(!cancelled){setServerNowMs(Number(data.serverNowMs));setSyncedAt(Date.now());}}catch{}};sync();const a=setInterval(sync,10000),b=setInterval(()=>setTick(Date.now()),1000);return()=>{cancelled=true;clearInterval(a);clearInterval(b);};},[]);
  useEffect(()=>{
    if(!user||String(user.role||'').toLowerCase()==='admin'||serverNowMs==null)return;
    const now=serverNowMs+(tick-(syncedAt||tick));
    const approved=(reservations||[]).filter(r=>r.status==='APPROVED'&&Number(r.userId)===Number(user.id));
    for(const r of approved){
      const end=Number(r.endMs); if(!Number.isFinite(end))continue;
      let item=null;
      if(now>=end-5*60*1000&&now<end) item={type:'ENDING_5',title:'Reservation Ending Soon',message:`You have only 5 minutes left for ${r.roomName} at ${r.building}. Your reservation ends at ${String(r.timeSlot||'').split(' - ').pop()||'the scheduled end time'}. Please begin wrapping up and leave the room on time.`,urgent:false};
      else if(now>=end) item={type:'END_ALARM',title:'Reservation Time Ended',message:`Your reservation for ${r.roomName} at ${r.building} has ended. Please leave the room and allow the next scheduled user to use the facility.`,urgent:true};
      if(!item)continue;
      const key=`orgroom-alarm-${r.dbId}-${item.type}-${end}`;
      let already=false;
      try{already=sessionStorage.getItem(key)==='1';if(!already)sessionStorage.setItem(key,'1');}catch{}
      if(already)continue;
      setNotice(item);
      if(item.urgent){
        try{if(typeof Notification!=='undefined'&&Notification.permission==='granted')new Notification(item.title,{body:item.message,tag:key});}catch{}
        try{const Ctx=window.AudioContext||window.webkitAudioContext;if(Ctx){const ctx=new Ctx();const osc=ctx.createOscillator(),gain=ctx.createGain();osc.frequency.value=880;gain.gain.value=.055;osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.22);}}catch{}
      }
      break;
    }
  },[reservations,user,serverNowMs,syncedAt,tick]);
  if(!notice)return null;
  return <div className={`reservation-toast ${notice.urgent?'reservation-toast-ended':'reservation-toast-warning'}`} role="alert" aria-live="assertive"><div className="reservation-toast-icon">{notice.urgent?<BellRing/>:<AlertTriangle/>}</div><div className="reservation-toast-copy"><b>{notice.title}</b><span>{notice.message}</span></div><button className="reservation-toast-close" aria-label="Dismiss notification" title="Dismiss" onClick={()=>setNotice(null)}><X/></button></div>;
}

/* ============================================================
   MY RESERVATIONS / RESERVATIONS
   ============================================================ */

function Reservations({
  reservations,
  user,
  onEdit,
  onDelete,
  onRefresh,
  focusId=null
}){

  const [q,setQ]=useState('');
  const [status,setStatus]=useState('ALL');
  const [selected,setSelected]=useState(null);

  const isAdmin=user.role==='admin';

  useEffect(()=>{
    if(!focusId) return;
    const target=reservations.find(r=>String(r.id)===String(focusId)||String(r.dbId)===String(focusId));
    if(target) setSelected(target.id);
  },[focusId,reservations]);

  const list=reservations.filter(
    r=>
      (isAdmin || r.userEmail===user.email) &&
      (
        status==='ALL' ||
        r.status===status
      ) &&
      `${r.id} ${r.roomName} ${r.building} ${r.orgName} ${r.purpose}`
        .toLowerCase()
        .includes(q.toLowerCase())
  );

  const userReservations=reservations.filter(r=>r.userEmail===user.email);
  const pending=userReservations.filter(r=>r.status==='PENDING');
  const approved=userReservations.filter(r=>r.status==='APPROVED');
  const rejected=userReservations.filter(r=>r.status==='REJECTED');
  const cancelled=userReservations.filter(r=>r.status==='CANCELLED');

  const today=new Date();
  today.setHours(0,0,0,0);
  const upcoming=approved
    .filter(r=>{
      const d=new Date(`${r.date}T23:59:59`);
      return !Number.isNaN(d.getTime()) && d>=today;
    })
    .sort((a,b)=>`${a.date} ${a.timeSlot}`.localeCompare(`${b.date} ${b.timeSlot}`));

  const history=userReservations
    .filter(r=>{
      const d=new Date(`${r.date}T23:59:59`);
      return !Number.isNaN(d.getTime()) && d<today;
    })
    .sort((a,b)=>`${b.date} ${b.timeSlot}`.localeCompare(`${a.date} ${a.timeSlot}`));

  if(selected){
    const r=list.find(x=>x.id===selected) || reservations.find(x=>x.id===selected);
    if(r){
      return (
        <div className="page">
          <button className="back-btn" onClick={()=>setSelected(null)}>
            <ChevronLeft/>
            Back to reservations
          </button>
          <ReservationDetail
            r={r}
            user={user}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      );
    }
  }

  if(!isAdmin){
    return (
      <div className="page my-reservations-page">
        <div className="page-heading">
          <div>
            <span className="eyebrow">RESERVATION STATUS</span>
            <h2>My reservations</h2>
            <p>Track your submitted requests, approvals, and reservation history.</p>
          </div>
          <button className="outline-btn" onClick={onRefresh}>
            <RefreshCw/>
            Refresh
          </button>
        </div>

        <section className="reservation-status-grid">
          <button className={`reservation-status-card pending ${status==='PENDING'?'active':''}`} onClick={()=>setStatus(status==='PENDING'?'ALL':'PENDING')}>
            <span className="reservation-status-icon"><Clock3/></span>
            <span><b>{pending.length}</b><small>Pending</small></span>
          </button>
          <button className={`reservation-status-card approved ${status==='APPROVED'?'active':''}`} onClick={()=>setStatus(status==='APPROVED'?'ALL':'APPROVED')}>
            <span className="reservation-status-icon"><CheckCircle2/></span>
            <span><b>{approved.length}</b><small>Approved</small></span>
          </button>
          <button className={`reservation-status-card rejected ${status==='REJECTED'?'active':''}`} onClick={()=>setStatus(status==='REJECTED'?'ALL':'REJECTED')}>
            <span className="reservation-status-icon"><XCircle/></span>
            <span><b>{rejected.length}</b><small>Rejected</small></span>
          </button>
          <button className={`reservation-status-card cancelled ${status==='CANCELLED'?'active':''}`} onClick={()=>setStatus(status==='CANCELLED'?'ALL':'CANCELLED')}>
            <span className="reservation-status-icon"><X/></span>
            <span><b>{cancelled.length}</b><small>Cancelled</small></span>
          </button>
        </section>

        <section className="panel upcoming-reservations-panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">NEXT UP</span>
              <h3>Upcoming reservations</h3>
              <p>Your approved reservations that are scheduled from today onward.</p>
            </div>
            <CalendarCheck2/>
          </div>

          {upcoming.length ? (
            <div className="upcoming-reservation-list">
              {upcoming.slice(0,4).map(r=>(
                <button className="upcoming-reservation-card" key={r.id} onClick={()=>setSelected(r.id)}>
                  <div className="upcoming-room-icon"><DoorOpen/></div>
                  <div className="upcoming-main">
                    <b>{r.roomName}</b>
                    <span>{r.building}</span>
                    <small><CalendarDays/> {prettyDate(r.date)} · <Clock3/> {r.timeSlot}</small>
                  </div>
                  <div className="upcoming-card-right">
                    <Status value={r.status}/>
                    <ReservationTimerCard reservation={r} compact/>
                  </div>
                  <ChevronRight className="chev"/>
                </button>
              ))}
            </div>
          ) : (
            <div className="reservation-empty-inline">
              <CalendarCheck2/>
              <div>
                <b>No upcoming reservations</b>
                <span>Approved reservations scheduled for a future date will appear here.</span>
              </div>
            </div>
          )}
        </section>

        <div className="filters reservation-filters">
          <div className="search-box">
            <Search/>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search room, building, purpose…" />
          </div>
          <select value={status} onChange={e=>setStatus(e.target.value)}>
            <option value="ALL">All reservations</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <section className="panel reservation-history-panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">HISTORY</span>
              <h3>Reservation history</h3>
              <p>Every request stays available here so you can review what you requested and its result.</p>
            </div>
            <ClipboardList/>
          </div>

          <div className="reservation-history-list">
            {list.map(r=>(
              <button className="reservation-history-card" key={r.id} onClick={()=>setSelected(r.id)}>
                <div className="reservation-history-icon"><DoorOpen/></div>
                <div className="reservation-history-main">
                  <div className="reservation-history-title">
                    <b>{r.roomName}</b>
                    <Status value={r.status}/>
                  </div>
                  <span>{r.building}</span>
                  <small><CalendarDays/> {prettyDate(r.date)} · <Clock3/> {r.timeSlot}</small>
                  <p>{r.purpose || 'No purpose provided.'}</p>
                </div>
                <ChevronRight className="chev"/>
              </button>
            ))}
          </div>

          {!list.length && (
            <Empty icon={ClipboardList} text="No matching reservations." />
          )}
        </section>

        {history.length>0 && status==='ALL' && !q && (
          <div className="reservation-history-note">
            <Clock3/>
            <span>{history.length} previous reservation{history.length===1?'':'s'} in your account history.</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">TRACKER</span>
          <h2>All reservations</h2>
          <p>Track status, details, and request history.</p>
        </div>
        <button className="outline-btn" onClick={onRefresh}>
          <RefreshCw/>
          Refresh
        </button>
      </div>

      <div className="filters">
        <div className="search-box">
          <Search/>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search reference, room, organization…" />
        </div>
        <select value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="ALL">ALL</option>
          <option value="PENDING">PENDING</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      <div className="table-panel">
        <table>
          <thead><tr><th>Reference</th><th>Room</th><th>Date & time</th><th>Purpose</th><th>Status</th><th/></tr></thead>
          <tbody>
            {list.map(r=>(
              <tr key={r.id} onClick={()=>setSelected(r.id)}>
                <td><b>{r.id}</b><span>{r.userName}</span></td>
                <td><b>{r.roomName}</b><span>{r.building}</span></td>
                <td><b>{prettyDate(r.date)}</b><span>{r.timeSlot}</span></td>
                <td><b>{r.purpose}</b><span>{r.orgName}</span></td>
                <td><Status value={r.status}/></td>
                <td><ChevronRight className="chev"/></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!list.length && <Empty icon={ClipboardList} text="No matching reservations." />}
      </div>
    </div>
  );
}


/* ============================================================
   RESERVATION DETAIL
   ============================================================ */

function ReservationDetail({
  r,
  user,
  onEdit,
  onDelete
}){

  return (
    <section className="panel detail-panel">

      <div className="detail-head">

        <div>

          <span className="eyebrow">
            {r.id}
          </span>

          <h2>
            {r.roomName}
          </h2>

          <p>
            {r.building} · {r.eventType}
          </p>

        </div>

        <div className="detail-head-status">
          <Status value={r.status}/>
          {r.status==='APPROVED' && <ReservationTimerCard reservation={r} compact/>}
        </div>

      </div>


      <div className="detail-grid">

        <div>
          <span>Requestor</span>
          <b>{r.userName}</b>
        </div>

        <div>
          <span>Organization</span>
          <b>{r.orgName}</b>
        </div>

        <div>
          <span>Date</span>
          <b>{prettyDate(r.date)}</b>
        </div>

        <div>
          <span>Time</span>
          <b>{r.timeSlot}</b>
        </div>

        <div>
          <span>Attendees</span>
          <b>{r.attendees}</b>
        </div>

        <div>
          <span>Submitted</span>
          <b>{String(r.submittedAt).slice(0,16)}</b>
        </div>

        {r.decisionByName && r.status!=='PENDING' && (
          <div>
            <span>{r.status==='APPROVED' ? 'Approved by' : 'Reviewed by'}</span>
            <b>{r.decisionByName}</b>
            {r.decisionAt && <small>{String(r.decisionAt).slice(0,16)}</small>}
          </div>
        )}

        <div className="span-2">

          <span>
            Purpose
          </span>

          <p className="detail-note">
            {r.purpose}
          </p>

        </div>


        {r.adminNotes && (
          <div className="span-2">

            <span>
              Admin note
            </span>

            <p className="detail-note">
              {r.adminNotes}
            </p>

          </div>
        )}

        {user.role==='admin' && r.status==='APPROVED' && (
          <div className="span-2 reminder-admin-status">
            <span>Reminder delivery</span>
            <div><b>Start reminder:</b> {r.startReminderStatus==='SENT' ? 'Sent ✓' : r.startReminderStatus==='FAILED' ? 'Failed' : 'Pending'} &nbsp; <b>End reminder:</b> {r.endReminderStatus==='SENT' ? 'Sent ✓' : r.endReminderStatus==='FAILED' ? 'Failed' : 'Pending'}</div>
          </div>
        )}

      </div>


      {(r.status!=='CANCELLED' && r.status!=='REJECTED') && (user.role==='admin'||r.status==='PENDING'||(Number(r.userId)===Number(user.id)&&r.status==='APPROVED')) && (
        <div className="modal-actions">

          <button
            className="outline-btn"
            onClick={()=>onEdit(r)}
          >
            <Pencil/>
            Edit
          </button>

          <button
            className="danger-btn"
            onClick={()=>onDelete(r.id)}
          >
            <Trash2/>
            Delete
          </button>

        </div>
      )}

    </section>
  );
}


/* ============================================================
   REQUESTS
   ============================================================ */

function Requests({
  reservations,
  user,
  onDecision,
  onEdit,
  focusId=null
}){

  const [filter,setFilter]=useState('PENDING');

  useEffect(()=>{
    if(!focusId) return;
    const target=reservations.find(r=>String(r.id)===String(focusId)||String(r.dbId)===String(focusId));
    if(!target) return;
    setFilter(target.status==='PENDING'?'PENDING':target.status);
    requestAnimationFrame(()=>document.getElementById(`orgroom-request-${target.dbId}`)?.scrollIntoView({behavior:'smooth',block:'center'}));
  },[focusId,reservations]);

  const list=reservations.filter(
    r=>filter==='ALL'||r.status===filter
  );


  return (
    <div className="page">

      <div className="page-heading">

        <div>

          <span className="eyebrow">
            ADMIN CONTROL
          </span>

          <h2>
            Reservation requests
          </h2>

          <p>
            Review, approve, or reject campus room requests.
          </p>

        </div>

      </div>


      <div className="request-tabs">

        {['PENDING','APPROVED','REJECTED','CANCELLED','ALL'].map(x=>(
          <button
            className={filter===x?'active':''}
            onClick={()=>setFilter(x)}
            key={x}
          >
            {x}

            <span>
              {
                reservations.filter(
                  r=>x==='ALL'||r.status===x
                ).length
              }
            </span>

          </button>
        ))}

      </div>


      <div className="request-list">

        {list.map(r=>{
          const isOwnRequest=Number(r.userId)===Number(user?.id) || (!r.userId && String(r.userEmail||'').toLowerCase()===String(user?.email||'').toLowerCase());
          return (
          <div
            className={`request-card ${isOwnRequest?'request-card-self':''} ${focusId && (String(focusId)===String(r.id)||String(focusId)===String(r.dbId))?'request-card-focused':''}`}
            id={`orgroom-request-${r.dbId}`}
            key={r.id}
          >

            <div className="request-main">

              <div className="row-icon">
                <DoorOpen/>
              </div>

              <div>

                <div className="request-title">

                  <b>{r.roomName}</b>

                  <Status value={r.status}/>

                </div>

                <div className="requester-line">
                  <span className="requester-label">REQUESTER</span>
                  <b>{r.userName}</b>
                  <span>{r.userEmail}</span>
                </div>

                <span>
                  {r.building} · {prettyDate(r.date)} · {r.timeSlot} · {r.attendees} attendees
                </span>

                <small>
                  <b>Purpose:</b> {r.purpose}
                </small>

                {r.decisionByName && r.status!=='PENDING' && (
                  <small className="request-decision-line">
                    <b>{r.status==='APPROVED'?'Approved by':'Reviewed by'}:</b> {r.decisionByName}{r.decisionAt ? ` · ${String(r.decisionAt).slice(0,16)}` : ''}
                  </small>
                )}

              </div>

            </div>


            <div className="request-actions">

              {r.status==='PENDING' && (
                isOwnRequest ? (
                  <span className="request-self-note">You submitted this request</span>
                ) : (
                  <>
                    <button
                      className="approve-btn"
                      onClick={()=>onDecision(r,'APPROVED')}
                    >
                      <Check/>
                      Approve
                    </button>

                    <button
                      className="reject-btn"
                      onClick={()=>onDecision(r,'REJECTED')}
                    >
                      <X/>
                      Reject
                    </button>
                  </>
                )
              )}


              <button
                className="icon-btn"
                onClick={()=>onEdit(r)}
                title="Review or edit request details"
              >
                <Pencil/>
              </button>

            </div>

          </div>
          );
        })}

      </div>


      {!list.length && (
        <Empty
          icon={ShieldCheck}
          text="No requests in this status."
        />
      )}

    </div>
  );
}


/* ============================================================
   PROFILE
   ============================================================ */

function Profile({
  user,
  onLogout
}){

  return (
    <div className="page">

      <div className="page-heading">

        <div>

          <span className="eyebrow">
            ACCOUNT
          </span>

          <h2>
            Profile & settings
          </h2>

          <p>
            Your ORGROOM account details.
          </p>

        </div>


        <button
          className="danger-btn"
          onClick={onLogout}
        >
          <LogOut/>
          Sign out
        </button>

      </div>


      <section className="profile-hero">

        <div className="profile-avatar">
          {initials(user.name)}
        </div>

        <div>

          <h2>
            {user.name}
          </h2>

          <p>
            {user.email}
          </p>

          <Status value={user.role.toUpperCase()}/>

        </div>

      </section>


      <div className="two-col">

        <section className="panel">

          <div className="panel-head">

            <div>

              <h3>
                Account information
              </h3>

              <p>
                Details used for reservations and access.
              </p>

            </div>

            <UserRound/>

          </div>


        <div className="detail-grid">

            <div>
              <span>Name</span>
              <b>{user.name}</b>
            </div>

            <div>
              <span>Email</span>
              <b>{user.email}</b>
            </div>

            <div>
              <span>Role</span>
              <b>{user.role}</b>
            </div>

            <div>
              <span>Position</span>
              <b>{user.position||'—'}</b>
            </div>

            <div>
              <span>Organization</span>
              <b>{user.org}</b>
            </div>

            <div>
              <span>Department</span>
              <b>{user.department||'—'}</b>
            </div>

          </div>

        </section>


        <section className="panel">

          <div className="panel-head">

            <div>

              <h3>
                Access
              </h3>

              <p>
                Permissions are based on your role.
              </p>

            </div>

            <ShieldCheck/>

          </div>


          <div className="access-list">

            <div>
              <CheckCircle2/>
              <span>Room browsing</span>
              <b>Enabled</b>
            </div>

            <div>
              <CheckCircle2/>
              <span>Reservation requests</span>
              <b>Enabled</b>
            </div>

            <div>
              <CheckCircle2/>
              <span>Approval controls</span>
              <b>
                {user.role==='admin'
                  ? 'Enabled'
                  : 'Restricted'
                }
              </b>
            </div>

          </div>

        </section>

      </div>

    </div>
  );
}


/* ============================================================
   EDIT MODAL
   ============================================================ */

function EditModal({
  reservation,
  onClose,
  onSave,
  requestConfirmation
}){

  const [form,setForm]=useState({
    ...reservation
  });

  const set=(k,v)=>
    setForm(f=>({...f,[k]:v}));

  const isDirty=JSON.stringify(form)!==JSON.stringify(reservation);
  const handleClose=()=>{
    if(!isDirty||!requestConfirmation){onClose();return;}
    requestConfirmation({
      title:'Discard your changes?',
      description:'Your unsaved changes will be lost if you leave this page.',
      confirmLabel:'DISCARD CHANGES',
      cancelLabel:'KEEP EDITING',
      severity:'danger',
      action:async()=>onClose()
    });
  };


  return (
    <div className="modal-backdrop">

      <div className="modal wide">

        <button
          className="modal-close"
          onClick={handleClose}
        >
          <X/>
        </button>


        <span className="eyebrow">
          {reservation.id}
        </span>

        <h2>
          Edit reservation
        </h2>


        <div className="form-grid">

          <label>
            Date

            <input
              type="date"
              value={form.date}
              onChange={e=>set('date',e.target.value)}
            />
          </label>


          <label>
            Time slot

            <input
              value={form.timeSlot}
              onChange={e=>set('timeSlot',e.target.value)}
            />
          </label>


          <label>
            Attendees

            <input
              type="number"
              value={form.attendees}
              onChange={e=>set('attendees',e.target.value)}
            />
          </label>


          <label>
            Event type

            <input
              value={form.eventType}
              onChange={e=>set('eventType',e.target.value)}
            />
          </label>


          <label className="span-2">
            Purpose

            <textarea
              value={form.purpose}
              onChange={e=>set('purpose',e.target.value)}
            />
          </label>


          <label className="span-2">
            Admin notes

            <textarea
              value={form.adminNotes||''}
              onChange={e=>set('adminNotes',e.target.value)}
            />
          </label>


          <div className="modal-actions span-2">

            <button
              className="outline-btn"
              onClick={handleClose}
            >
              Cancel
            </button>

            <button
              className="primary-btn"
              onClick={()=>onSave(form)}
            >
              Save changes
              <Check/>
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}


/* ============================================================
   EMPTY
   ============================================================ */

function Empty({
  icon:Icon,
  text,
  action,
  onClick
}){

  return (
    <div className="empty">

      <Icon/>

      <b>
        {text}
      </b>

      {action && (
        <button
          className="text-btn"
          onClick={onClick}
        >
          {action}
          <ChevronRight/>
        </button>
      )}

    </div>
  );
}


/* ============================================================
   ADMIN ROOM USAGE CHECK
   ============================================================ */

function RoomUsageCheck({user,requestConfirmation}){
  const [date,setDate]=useState(()=>{
    const d=new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  });
  const [records,setRecords]=useState([]);
  const [building,setBuilding]=useState('ALL');
  const [filter,setFilter]=useState('ALL');
  const [query,setQuery]=useState('');
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [refreshTick,setRefreshTick]=useState(0);

  const loadUsage=async()=>{
    if(user?.role!=='admin') return;
    setLoading(true);
    try{
      const data=await api(`/api/room-usage?date=${encodeURIComponent(date)}`,{
        
      });
      setRecords(data);
      setError('');
    }catch(e){
      setError(e.message);
    }finally{
      setLoading(false);
    }
  };

  useEffect(()=>{ loadUsage(); },[date,refreshTick]);
  useEffect(()=>{
    const timer=setInterval(()=>setRefreshTick(x=>x+1),30000);
    return ()=>clearInterval(timer);
  },[]);

  const dateLabel=new Date(`${date}T12:00:00`).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});

  const timeParts=(slot)=>{
    const parts=String(slot||'').split(/\s*(?:-|–|—|to)\s*/i);
    return [parseTime(parts[0]),parseTime(parts[1])];
  };

  const stateFor=(r)=>{
    const [start,end]=timeParts(r.reservation.timeSlot);
    const now=new Date();
    const selected=new Date(`${r.reservation.date}T00:00:00`);
    const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
    const diff=Math.round((selected-today)/86400000);
    if(diff>0) return 'UPCOMING';
    if(diff<0) return 'COMPLETED';
    const mins=now.getHours()*60+now.getMinutes();
    if(Number.isFinite(start)&&Number.isFinite(end)){
      if(mins<start) return 'UPCOMING';
      if(mins>=start&&mins<end) return 'NOW';
      return 'COMPLETED';
    }
    return 'UPCOMING';
  };

  const buildings=[...new Set(records.map(x=>x.reservation.building).filter(Boolean))].sort();
  const visible=records.filter(r=>{
    const timeline=stateFor(r);
    const usage=r.usage.status;
    const matchesBuilding=building==='ALL'||r.reservation.building===building;
    const matchesFilter=filter==='ALL'||filter===timeline||filter===usage;
    const hay=`${r.reservation.roomName} ${r.reservation.building} ${r.reservation.userName} ${r.reservation.purpose}`.toLowerCase();
    return matchesBuilding&&matchesFilter&&hay.includes(query.toLowerCase());
  });

  const summary={
    scheduled:records.filter(r=>stateFor(r)==='NOW').length,
    checked:records.filter(r=>r.usage.status==='CHECKED_IN').length,
    unchecked:records.filter(r=>r.usage.status==='NOT_CHECKED').length,
    notUsed:records.filter(r=>r.usage.status==='NOT_USED').length
  };

  const grouped=visible.reduce((acc,item)=>{
    const key=item.reservation.building||'Other';
    (acc[key] ||= []).push(item);
    return acc;
  },{});

  const moveDay=(delta)=>{
    const d=new Date(`${date}T12:00:00`);
    d.setDate(d.getDate()+delta);
    setDate(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);
  };

  const saveStatus=async(record,status)=>{
    const label=status==='CHECKED_IN'?'Checked In':'Not Used';
    const execute=async()=>{
      let note=record.usage.note||'';
      if(status!=='NOT_CHECKED'){
        const entered=window.prompt('Optional note:',note);
        if(entered!==null) note=entered;
      }
      const usage=await api(`/api/room-usage/${record.reservation.dbId}`,{method:'PUT',body:JSON.stringify({status,note})});
      setRecords(current=>current.map(x=>x.reservation.dbId===record.reservation.dbId?{...x,usage}:x));
    };
    if(status==='NOT_CHECKED'){
      await execute();
      return;
    }
    requestConfirmation({
      title:`Mark ${record.reservation.roomName} as “${label}”?`,
      description:status==='NOT_USED'
        ?'This will record that the approved room reservation was not used.'
        :'This will record that the room was checked in and is being used.',
      confirmLabel:status==='NOT_USED'?'MARK NOT USED':'CHECK IN',
      severity:status==='NOT_USED'?'danger':'normal',
      action:execute
    });
  };

  const addNote=async(record)=>{
    const note=window.prompt('Usage note:',record.usage.note||'');
    if(note===null) return;
    try{
      const usage=await api(`/api/room-usage/${record.reservation.dbId}`,{
        method:'PUT',
        body:JSON.stringify({status:record.usage.status||'NOT_CHECKED',note})
      });
      setRecords(current=>current.map(x=>x.reservation.dbId===record.reservation.dbId?{...x,usage}:x));
    }catch(e){ window.alert(e.message); }
  };

  const usageLabel=(status)=>status==='CHECKED_IN'?'Checked In':status==='NOT_USED'?'Not Used':'Not Checked';
  const timelineLabel=(state)=>state==='NOW'?'NOW':state==='UPCOMING'?'UPCOMING':'COMPLETED';

  return (
    <div className="page room-usage-page">
      <div className="page-heading room-usage-heading">
        <div>
          <span className="eyebrow">ADMIN MONITORING</span>
          <h2>Room Usage Check</h2>
          <p>Verify whether approved room reservations are actually being used.</p>
        </div>
        <button className="outline-btn" onClick={()=>setRefreshTick(x=>x+1)} disabled={loading}>
          <RefreshCw className={loading?'spin':''}/>{loading?'Refreshing…':'Refresh'}
        </button>
      </div>

      <section className="room-usage-datebar panel">
        <button className="icon-btn" onClick={()=>moveDay(-1)} aria-label="Previous day"><ChevronLeft/></button>
        <button className="usage-today-btn" onClick={()=>{
          const d=new Date(); setDate(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);
        }}>Today</button>
        <label className="usage-date-input"><CalendarDays/><input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label>
        <div className="usage-date-label"><b>{dateLabel}</b><span>Approved reservations scheduled for this date</span></div>
        <button className="icon-btn" onClick={()=>moveDay(1)} aria-label="Next day"><ChevronRight/></button>
      </section>

      {error && <div className="global-error"><CircleAlert/>{error}<button onClick={loadUsage}>Retry</button></div>}

      <section className="room-usage-summary">
        <div className="usage-summary-card now"><span><CalendarCheck2/></span><b>{summary.scheduled}</b><small>Currently Scheduled</small></div>
        <div className="usage-summary-card checked"><span><CheckCircle2/></span><b>{summary.checked}</b><small>Checked In / In Use</small></div>
        <div className="usage-summary-card unchecked"><span><Clock3/></span><b>{summary.unchecked}</b><small>Not Yet Checked</small></div>
        <div className="usage-summary-card not-used"><span><XCircle/></span><b>{summary.notUsed}</b><small>Marked Not Used</small></div>
      </section>

      <section className="room-usage-toolbar panel">
        <div className="usage-search"><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search room, requester, or purpose…"/></div>
        <label><span>Building</span><select value={building} onChange={e=>setBuilding(e.target.value)}><option value="ALL">All Buildings</option>{buildings.map(b=><option key={b} value={b}>{b}</option>)}</select></label>
        <label><span>Status</span><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="ALL">All</option><option value="NOW">Now</option><option value="UPCOMING">Upcoming</option><option value="CHECKED_IN">Checked In</option><option value="NOT_USED">Not Used</option><option value="NOT_CHECKED">Not Checked</option><option value="COMPLETED">Completed</option></select></label>
      </section>

      {!records.length ? (
        <Empty icon={CalendarDays} text="No approved room reservations for this date." />
      ) : !visible.length ? (
        <Empty icon={Search} text="No room usage records match these filters." />
      ) : (
        <div className="room-usage-groups">
          {Object.entries(grouped).map(([name,items])=>(
            <section className="room-usage-group" key={name}>
              <div className="room-usage-group-head"><div><Building2/><div><h3>{name}</h3><span>{items.length} scheduled room{items.length===1?'':'s'}</span></div></div></div>
              <div className="room-usage-list">
                {items.map(record=>{
                  const timeline=stateFor(record);
                  return (
                    <article className={`room-usage-card ${timeline.toLowerCase()}`} key={record.reservation.id}>
                      <div className="usage-card-main">
                        <div className="usage-room-line"><div className="usage-room-icon"><DoorOpen/></div><div><h4>{record.reservation.roomName}</h4><span>{record.reservation.timeSlot}</span></div></div>
                        <div className="usage-person"><UserRound/><div><b>{record.reservation.userName}</b><span>{record.reservation.purpose || 'No purpose provided'}</span></div></div>
                        <div className="usage-timeline"><span className={`timeline-badge ${timeline.toLowerCase()}`}>{timeline==='NOW'&&<span className="live-dot"/>}{timelineLabel(timeline)}</span><small>{record.reservation.eventType || 'Reservation'}</small></div>
                      </div>
                      <div className="usage-card-check">
                        <span className={`usage-status-badge ${statusClass(record.usage.status)}`}>{record.usage.status==='CHECKED_IN'?<CheckCircle2/>:record.usage.status==='NOT_USED'?<XCircle/>:<Clock3/>}{usageLabel(record.usage.status)}</span>
                        {record.usage.checkedAt && <small>Checked at {new Date(record.usage.checkedAt.replace(' ','T')).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}</small>}
                        {record.usage.checkedBy && <small>by {record.usage.checkedBy}</small>}
                        {record.usage.note && <p>{record.usage.note}</p>}
                        <div className="usage-actions">
                          <button className="usage-check-btn" onClick={()=>saveStatus(record,'CHECKED_IN')}><Check/> Check In</button>
                          <button className="usage-not-used-btn" onClick={()=>saveStatus(record,'NOT_USED')}><X/> Not Used</button>
                          <button className="usage-note-btn" onClick={()=>addNote(record)}>Add note</button>
                          {record.usage.status!=='NOT_CHECKED' && <button className="usage-change-btn" onClick={()=>saveStatus(record,'NOT_CHECKED')}>Change Status</button>}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}


/* ============================================================
   ADMIN USER MANAGEMENT
   ============================================================ */
function UserManagement(){
  const [users,setUsers]=useState([]);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState('');
  const [info,setInfo]=useState('');
  const [search,setSearch]=useState('');
  const [role,setRole]=useState('TEACHER');
  const [form,setForm]=useState({name:'',email:'',password:''});

  const loadUsers=async()=>{
    setLoading(true);
    setError('');
    try{
      const rows=await api('/api/users');
      setUsers(Array.isArray(rows)?rows:[]);
    }catch(e){setError(e.message||'Unable to load user accounts.');}
    finally{setLoading(false);}
  };

  useEffect(()=>{loadUsers();},[]);

  const submit=async()=>{
    if(saving)return;
    setError('');
    setInfo('');
    const name=form.name.trim();
    const email=form.email.trim();
    if(!name||!email||!form.password){
      setError('Name, email, password, and role are required.');
      return;
    }
    setSaving(true);
    try{
      const result=await api('/api/users',{
        method:'POST',
        body:JSON.stringify({name,email,password:form.password,role})
      });
      setUsers(current=>[result.user,...current]);
      setForm({name:'',email:'',password:''});
      setInfo(result.message||'Account created successfully.');
    }catch(e){setError(e.message||'Unable to create the account.');}
    finally{setSaving(false);}
  };

  const filtered=users.filter(u=>{
    const q=search.trim().toLowerCase();
    if(!q)return true;
    return [u.name,u.email,u.role,u.organization,u.department].some(v=>String(v||'').toLowerCase().includes(q));
  });

  return (
    <div className="page user-management-page">
      <div className="page-head">
        <div>
          <span className="eyebrow">ADMIN ONLY</span>
          <h2>User Management</h2>
          <p>Create and manage the real Teacher and Admin accounts used by ORGROOM authentication.</p>
        </div>
      </div>

      {error && <div className="alert danger"><CircleAlert/>{error}</div>}
      {info && <div className="alert success"><CheckCircle2/>{info}</div>}

      <div className="user-management-grid">
        <section className="panel user-create-panel">
          <div className="panel-head">
            <div>
              <h3>Create account</h3>
              <p>The account will be saved to the ORGROOM database and use the normal email verification flow.</p>
            </div>
            <div className="user-management-icon"><UserRound/></div>
          </div>

          <div className="form-stack">
            <label>
              Full name
              <input value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))} placeholder="Juan Dela Cruz" autoComplete="name"/>
            </label>
            <label>
              Email
              <input value={form.email} onChange={e=>setForm(v=>({...v,email:e.target.value}))} placeholder="name@gmail.com" type="email" autoComplete="email"/>
            </label>
            <label>
              Role
              <select value={role} onChange={e=>setRole(e.target.value)}>
                <option value="TEACHER">Teacher</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>
            <label>
              Initial password
              <input value={form.password} onChange={e=>setForm(v=>({...v,password:e.target.value}))} placeholder="At least 8 characters" type="password" autoComplete="new-password"/>
              <small className="field-help">At least 8 characters with a letter and a number.</small>
            </label>
            <button className="primary-btn" disabled={saving} onClick={submit}>
              <Plus/>
              {saving ? 'Creating account…' : `Create ${role==='ADMIN'?'Admin':'Teacher'} Account`}
            </button>
          </div>
        </section>

        <section className="panel user-list-panel">
          <div className="panel-head">
            <div>
              <h3>Existing accounts</h3>
              <p>{users.length} account{users.length===1?'':'s'} in the database.</p>
            </div>
            <button className="icon-btn" onClick={loadUsers} disabled={loading} title="Refresh users" aria-label="Refresh users"><RefreshCw className={loading?'spin':''}/></button>
          </div>

          <div className="user-search">
            <Search/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, email, or role"/>
          </div>

          {loading ? (
            <div className="user-empty"><RefreshCw className="spin"/><span>Loading accounts…</span></div>
          ) : !filtered.length ? (
            <div className="user-empty"><Users/><b>No matching accounts</b><span>Try another search.</span></div>
          ) : (
            <div className="user-table-wrap">
              <table className="user-table">
                <thead><tr><th>User</th><th>Role</th><th>Verification</th><th>Created</th></tr></thead>
                <tbody>
                  {filtered.map(u=>(
                    <tr key={u.id}>
                      <td>
                        <div className="user-cell">
                          <div className="avatar">{initials(u.name)}</div>
                          <div><b>{u.name}</b><span>{u.email}</span></div>
                        </div>
                      </td>
                      <td><span className={`role-pill ${String(u.role).toLowerCase()}`}>{u.role}</span></td>
                      <td><span className={`status ${u.isVerified?'approved':'pending'}`}><i/>{u.isVerified?'Verified':'Pending verification'}</span></td>
                      <td>{u.createdAt ? new Date(String(u.createdAt).replace(' ','T')).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN APP
   ============================================================ */

export default function App(){
  const [confirmation,setConfirmation]=useState(null);
  const requestConfirmation=({title,description,confirmLabel,cancelLabel='CANCEL',severity='normal',action})=>setConfirmation({title,description,confirmLabel,cancelLabel,severity,action,loading:false,error:''});
  const closeConfirmation=()=>{if(!confirmation?.loading)setConfirmation(null);};
  const runConfirmation=async()=>{
    if(!confirmation?.action||confirmation.loading)return;
    setConfirmation(c=>c?{...c,loading:true,error:''}:c);
    try{await confirmation.action();setConfirmation(null);}
    catch(e){setConfirmation(c=>c?{...c,loading:false,error:e.message||'Unable to complete the action.'}:c);}
  };

  const [user,setUser]=useState(null);
  const [authChecked,setAuthChecked]=useState(false);
  const [tab,setTab]=useState('home');
  const [rooms,setRooms]=useState([]);
  const [reservations,setReservations]=useState([]);
  const [weekly,setWeekly]=useState([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [mobile,setMobile]=useState(false);
  const [sidebarCollapsed,setSidebarCollapsed]=useState(()=>{
    try{
      return localStorage.getItem('orgroom-sidebar-collapsed') === 'true';
    }catch{
      return false;
    }
  });

  useEffect(()=>{
    try{
      localStorage.setItem('orgroom-sidebar-collapsed', String(sidebarCollapsed));
    }catch{}
  },[sidebarCollapsed]);
  const [booking,setBooking]=useState(null);
  const openBooking=(room,date=null)=>setBooking({room,initialDate:date||localTodayISO()});
  const [editing,setEditing]=useState(null);
  const [notifications,setNotifications]=useState([]);
  const [unreadNotifications,setUnreadNotifications]=useState(0);
  const [notificationsOpen,setNotificationsOpen]=useState(false);
  const [focusReservationId,setFocusReservationId]=useState(null);
  const navigationHistory=React.useRef({initialized:false,lastTab:'home',handlingPop:false});

  useEffect(()=>{
    if(!user) return;

    const allowedTabs=user.role==='admin'
      ? new Set(['home','calendar','rooms','reservations','requests','room-usage','user-management','profile'])
      : new Set(['home','calendar','rooms','reservations','profile']);

    const normalizeTab=value=>allowedTabs.has(value) ? value : 'home';

    const handlePopState=event=>{
      const stateTab=event.state?.orgroomTab;
      const hashTab=window.location.hash.replace(/^#/,'');
      const nextTab=normalizeTab(stateTab || hashTab);
      navigationHistory.current.handlingPop=true;
      navigationHistory.current.lastTab=nextTab;
      setTab(nextTab);
    };

    if(!navigationHistory.current.initialized){
      const hashTab=window.location.hash.replace(/^#/,'');
      const initialTab=normalizeTab(hashTab);
      if(tab!==initialTab) setTab(initialTab);
      window.history.replaceState(
        {orgroomTab:initialTab},
        document.title,
        `${window.location.pathname}${window.location.search}#${initialTab}`
      );
      navigationHistory.current.initialized=true;
      navigationHistory.current.lastTab=initialTab;
    }

    window.addEventListener('popstate',handlePopState);
    return()=>window.removeEventListener('popstate',handlePopState);
  },[user]);

  useEffect(()=>{
    if(!user || !navigationHistory.current.initialized) return;
    if(navigationHistory.current.handlingPop){
      navigationHistory.current.handlingPop=false;
      navigationHistory.current.lastTab=tab;
      return;
    }
    if(navigationHistory.current.lastTab===tab) return;
    window.history.pushState(
      {orgroomTab:tab},
      document.title,
      `${window.location.pathname}${window.location.search}#${tab}`
    );
    navigationHistory.current.lastTab=tab;
  },[tab,user]);

  useEffect(()=>{
    let cancelled=false;
    const restore=async()=>{
      let token='';
      try{token=localStorage.getItem('orgroom-session')||'';}catch{}
      if(!token){if(!cancelled)setAuthChecked(true);return;}
      try{const data=await api('/api/auth/me');if(!cancelled)setUser(data.user||null);}
      catch{try{localStorage.removeItem('orgroom-session');}catch{}if(!cancelled)setUser(null);}
      finally{if(!cancelled)setAuthChecked(true);}
    };
    restore();
    return()=>{cancelled=true;};
  },[]);

  useEffect(()=>{
    if(!user) return;
    try{
      const params=new URLSearchParams(window.location.search);
      const reservation=params.get('notificationReservation');
      const targetTab=params.get('notificationTab');
      if(reservation){
        const raw=reservation.replace(/^OR-/i,'');
        if(raw){
          setFocusReservationId(raw);
          if(user.role==='admin' && targetTab==='requests') setTab('requests');
          else setTab('reservations');
          window.history.replaceState({},document.title,window.location.pathname);
        }
      }
    }catch{}
  },[user]);

  // Light / dark mode preference
  const [theme,setTheme]=useState(
    ()=>{
      try{
        return localStorage.getItem('orgroom-theme') || 'light';
      }catch{
        return 'light';
      }
    }
  );

  useEffect(
    ()=>{
      try{
        localStorage.setItem('orgroom-theme',theme);
      }catch{}

      document.documentElement.classList.toggle(
        'dark-mode',
        theme==='dark'
      );
    },
    [theme]
  );


  const loadNotifications=async()=>{
    if(!user) return;
    try{
      const data=await api('/api/notifications?limit=40');
      setNotifications(data.notifications||[]);
      setUnreadNotifications(Number(data.unreadCount||0));
    }catch{}
  };

  const load=async()=>{

    setLoading(true);

    try{

      const [
        r,
        rs,
        w
      ]=await Promise.all([
        api('/api/facilities'),
        api('/api/reservations'),
        api('/api/weekly-room-schedules')
      ]);

      setRooms(r);

      setReservations(rs);
      setWeekly(w);
      setError('');

    }catch(e){

      setError(e.message);

    }finally{

      setLoading(false);

    }
  };


  useEffect(
    ()=>{
      if(!user) return;

      load();
      loadNotifications();

      const t=setInterval(load,10000);
      const n=setInterval(loadNotifications,15000);

      return ()=>{clearInterval(t);clearInterval(n);};
    },
    [user]
  );


  const saveEdit=async(form)=>{

    try{

      const updated=await api(
        `/api/reservations/${form.id}`,
        {
          method:'PUT',
          body:JSON.stringify(form)
        }
      );

      setReservations(
        x=>
          x.map(
            r=>
              r.id===updated.id
                ? updated
                : r
          )
      );

      setEditing(null);

    }catch(e){

      alert(e.message);

    }
  };


  const remove=async(id)=>{
    const isAdmin=String(user?.role||'').toLowerCase()==='admin';
    await requestConfirmation({
      title:isAdmin?'Cancel this reservation?':'Cancel this reservation?',
      description:isAdmin
        ?'This reservation will be marked CANCELLED and kept in the reservation history.'
        :'This reservation will be marked CANCELLED and kept in your reservation history.',
      confirmLabel:'CANCEL RESERVATION',
      severity:'danger',
      action:async()=>{
        await api(`/api/reservations/${id}`,{method:'DELETE'});
        setReservations(x=>x.filter(r=>r.id!==id));
      }
    });
  };

  const decision=async(
    r,
    status
  )=>{
    const isApprove=status==='APPROVED';
    await requestConfirmation({
      title:isApprove?'Approve this reservation?':'Reject this reservation?',
      description:isApprove
        ?'Confirm that you want to approve this reservation.'
        :'The requester will be notified that this reservation was rejected.',
      confirmLabel:isApprove?'APPROVE RESERVATION':'REJECT RESERVATION',
      severity:isApprove?'normal':'danger',
      action:async()=>{
        let note='';
        if(status==='REJECTED')note=prompt('Reason for rejection (optional):')||'';
        const u=await api(`/api/reservations/${r.id}/decision`,{method:'POST',body:JSON.stringify({status,adminNotes:note||(isApprove?'Reservation approved.':'Reservation request rejected.')})});
        setReservations(x=>x.map(a=>a.id===u.id?u:a));
      }
    });
  };

  const handleNotificationClose=(notification)=>{
    setNotificationsOpen(false);
    if(notification){
      setNotifications(current=>current.map(item=>item.id===notification.id?{...item,isRead:true}:item));
      setUnreadNotifications(count=>Math.max(0,count-1));
      if(notification.reservationId){
        if(user.role==='admin'){
          setFocusReservationId(notification.reservationId);
          setTab('requests');
        }else{
          setFocusReservationId(notification.reservationId);
          setTab('reservations');
        }
      }
      loadNotifications();
    }
  };

  if(!authChecked){
    return <div className="auth-page"><div className="auth-card"><div className="auth-head"><span className="eyebrow">ORGROOM</span><h2>Restoring your session…</h2><p>Please wait while we securely reconnect your account.</p></div></div></div>;
  }

  if(!user){

    return (
      <Auth
        onLogin={setUser}
      />
    );
  }


  const titles={
    home:[
      user.role==='admin' ? 'Admin dashboard' : 'Overview',
      user.role==='admin' ? 'Campus operations and reservation control.' : 'A clear view of your campus activity.'
    ],

    calendar:[
      'Room calendar',
      'See recurring schedules and reservation activity.'
    ],

    rooms:[
      'Available Rooms',
      'See which rooms are available right now and request a reservation.'
    ],


    reservations:[
      user.role==='admin' ? 'Reservations' : 'My reservations',
      user.role==='admin' ? 'Track and manage campus reservation records.' : 'Track your submitted requests, approvals, and reservation history.'
    ],

    requests:[
      'Requests',
      'Review and manage campus reservations.'
    ],

    'room-usage':[
      'Room Usage Check',
      'Verify scheduled rooms and record actual usage.'
    ],

    'user-management':[
      'User Management',
      'Create and review Teacher and Admin accounts.'
    ],

    profile:[
      'Profile',
      'Account details and access settings.'
    ]
  };


  let content;


  if(tab==='home')
    content=user.role==='admin'
      ? (
        <AdminDashboard
          rooms={rooms}
          reservations={reservations}
          weekly={weekly}
          setTab={setTab}
          onRefresh={load}
          loading={loading}
        />
      )
      : (
        <Overview
          user={user}
          rooms={rooms}
          reservations={reservations}
          setTab={setTab}
        />
      );


  if(tab==='rooms')
    content=(
      <Rooms
        rooms={rooms}
        user={user}
        weekly={weekly}
        reservations={reservations}
        onBook={openBooking}
      />
    );


  if(tab==='calendar')
    content=(
      <Calendar
        rooms={rooms}
        reservations={reservations}
        weekly={weekly}
        onBook={openBooking}
      />
    );


  if(tab==='reservations')
    content=(
      <Reservations
        reservations={reservations}
        user={user}
        onEdit={setEditing}
        onDelete={remove}
        onRefresh={load}
        focusId={focusReservationId}
      />
    );


  if(
    tab==='requests' &&
    user.role==='admin'
  )
    content=(
      <Requests
        reservations={reservations}
        user={user}
        onDecision={decision}
        onEdit={setEditing}
        focusId={focusReservationId}
      />
    );


  if(tab==='room-usage' && user.role==='admin')
    content=(<RoomUsageCheck user={user} requestConfirmation={requestConfirmation}/>);


  if(tab==='user-management' && user.role==='admin')
    content=(<UserManagement/>);


  if(tab==='profile')
    content=(
      <Profile
        user={user}
        onLogout={()=>requestConfirmation({title:'Log out of ORGROOM?',description:'Are you sure you want to log out of your account?',confirmLabel:'LOG OUT',severity:'normal',action:async()=>{await api('/api/auth/logout',{method:'POST'});try{localStorage.removeItem('orgroom-session');}catch{}setUser(null);setTab('home');}})}
      />
    );


  return (
    <>
      <div className={`app-shell ${theme==='dark' ? 'dark-mode' : ''} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>

      {user.role==='admin' ? (
        <AdminSidebar
          tab={tab}
          setTab={setTab}
          user={user}
          onLogout={()=>requestConfirmation({title:'Log out of ORGROOM?',description:'Are you sure you want to log out of your account?',confirmLabel:'LOG OUT',severity:'normal',action:async()=>{await api('/api/auth/logout',{method:'POST'});try{localStorage.removeItem('orgroom-session');}catch{}setUser(null);setTab('home');}})}
          mobileOpen={mobile}
          setMobileOpen={setMobile}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />
      ) : (
        <Sidebar
          tab={tab}
          setTab={setTab}
          user={user}
          onLogout={()=>requestConfirmation({title:'Log out of ORGROOM?',description:'Are you sure you want to log out of your account?',confirmLabel:'LOG OUT',severity:'normal',action:async()=>{await api('/api/auth/logout',{method:'POST'});try{localStorage.removeItem('orgroom-session');}catch{}setUser(null);setTab('home');}})}
          mobileOpen={mobile}
          setMobileOpen={setMobile}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />
      )}


      <main className="main">

        <Topbar
          title={titles[tab]?.[0]||'ORGROOM'}
          subtitle={titles[tab]?.[1]||''}
          user={user}
          onMenu={()=>setMobile(true)}
          onRefresh={load}
          loading={loading}
          theme={theme}
          onToggleTheme={()=>{
            setTheme(
              current=>current==='dark'
                ? 'light'
                : 'dark'
            );
          }}
          notifications={notifications}
          unreadCount={unreadNotifications}
          notificationsOpen={notificationsOpen}
          onNotificationOpen={()=>{setNotificationsOpen(v=>!v);if(!notificationsOpen)loadNotifications();}}
          onNotificationClose={handleNotificationClose}
        />


        {error && (
          <div className="global-error">

            <CircleAlert/>

            {error}

            <button
              onClick={load}
            >
              Retry
            </button>

          </div>
        )}


        {content}

      </main>


      {booking && (
        <ReservationModal
          room={booking.room}
          initialDate={booking.initialDate}
          user={user}
          onClose={()=>setBooking(null)}
          requestConfirmation={requestConfirmation}
          onCreated={r=>{
            setReservations(
              x=>[r,...x]
            );

            setBooking(null);
            setTab('reservations');
          }}
        />
      )}


      {editing && (
        <EditModal
          reservation={editing}
          onClose={()=>setEditing(null)}
          requestConfirmation={requestConfirmation}
          onSave={saveEdit}
        />
      )}

      <ReservationReminderCenter reservations={reservations} user={user}/>

      <MobileBottomNav
        tab={tab}
        setTab={setTab}
        user={user}
      />

    </div>
      <ConfirmationDialog
        open={Boolean(confirmation)}
        title={confirmation?.title||''}
        description={confirmation?.description||''}
        confirmLabel={confirmation?.confirmLabel||'CONFIRM'}
        cancelLabel={confirmation?.cancelLabel||'CANCEL'}
        severity={confirmation?.severity||'normal'}
        loading={Boolean(confirmation?.loading)}
        error={confirmation?.error||''}
        onCancel={closeConfirmation}
        onConfirm={runConfirmation}
      />
    </>
  );
}