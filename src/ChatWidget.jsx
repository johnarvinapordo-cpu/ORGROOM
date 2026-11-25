import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { formatManilaTime, formatManilaDateTime } from './utils/time.js';
import { MessageCircle, X, Send, ChevronLeft, Volume2, VolumeX, MessageSquare, BellRing } from 'lucide-react';

function shortTime(value){ return formatManilaTime(value); }
function fullTime(value){ return formatManilaDateTime(value); }

export default function ChatWidget({api,user,theme='light',open,onOpenChange,selectedConversationId,onSelectConversation}){
  const isAdmin=['ADMIN','SUPER_ADMIN'].includes(String(user?.role||'').toUpperCase());
  const [inbox,setInbox]=useState([]);
  const [teacherConversation,setTeacherConversation]=useState(null);
  const [messages,setMessages]=useState([]);
  const [selectedId,setSelectedId]=useState(null);
  const [draft,setDraft]=useState('');
  const [loading,setLoading]=useState(false);
  const [sending,setSending]=useState(false);
  const [error,setError]=useState('');
  const [unread,setUnread]=useState(0);
  const [banner,setBanner]=useState(null);
  const [soundEnabled,setSoundEnabled]=useState(()=>{try{return localStorage.getItem('orgroom-chat-sound')==='true';}catch{return false;}});
  const messageEndRef=useRef(null);
  const messagesRef=useRef([]);
  const seenLatestRef=useRef(null);
  const bannerMessageRef=useRef(null);
  const selectedRef=useRef(null);
  const openRef=useRef(open);
  const sendingRef=useRef(false);
  const [autoScroll,setAutoScroll]=useState(true);

  useEffect(()=>{openRef.current=open;},[open]);
  useEffect(()=>{selectedRef.current=selectedId;},[selectedId]);
  useEffect(()=>{
    if(selectedConversationId && Number(selectedConversationId)!==Number(selectedId)){
      setSelectedId(Number(selectedConversationId));
    }
  },[selectedConversationId]);

  const totalUnread=useMemo(()=>isAdmin?inbox.reduce((sum,c)=>sum+Number(c.unreadCount||0),0):unread,[isAdmin,inbox,unread]);
  const activeConversation=useMemo(()=>isAdmin?inbox.find(c=>Number(c.id)===Number(selectedId)):teacherConversation,[isAdmin,inbox,selectedId,teacherConversation]);

  const playPing=useCallback(()=>{
    if(!soundEnabled)return;
    try{
      const AudioContextClass=window.AudioContext||window.webkitAudioContext;
      if(!AudioContextClass)return;
      const context=new AudioContextClass();
      if(context.state==='suspended')context.resume();
      const oscillator=context.createOscillator();
      const gain=context.createGain();
      oscillator.type='sine';oscillator.frequency.value=880;
      gain.gain.setValueAtTime(0.0001,context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12,context.currentTime+0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001,context.currentTime+0.18);
      oscillator.connect(gain);gain.connect(context.destination);
      oscillator.start();oscillator.stop(context.currentTime+0.2);
      oscillator.onended=()=>context.close();
    }catch{}
  },[soundEnabled]);

  const refreshInbox=useCallback(async()=>{
    if(isAdmin){
      const data=await api('/api/chat/inbox');
      const rows=data.conversations||[];
      setInbox(rows);
      setUnread(rows.reduce((sum,c)=>sum+Number(c.unreadCount||0),0));
      const newest=rows.filter(c=>c.lastTeacherMessageId && Number(c.unreadCount)>0).sort((a,b)=>Number(b.lastTeacherMessageId)-Number(a.lastTeacherMessageId))[0];
      if(newest && Number(newest.lastTeacherMessageId)!==Number(seenLatestRef.current)){
        setBanner({conversationId:newest.id,sender:newest.teacherName,preview:newest.lastTeacherMessage,createdAt:newest.lastTeacherMessageAt,messageId:newest.lastTeacherMessageId});
        if(seenLatestRef.current!==null && bannerMessageRef.current!==newest.lastTeacherMessageId){bannerMessageRef.current=newest.lastTeacherMessageId;playPing();}
        seenLatestRef.current=newest.lastTeacherMessageId;
      }
      return;
    }
    const data=await api('/api/chat/conversation');
    setTeacherConversation(data.conversation||null);
    setUnread(Number(data.unreadCount||0));
    if(data.conversation){
      setSelectedId(current=>current||Number(data.conversation.id));
      const conv=data.conversation;
      if(Number(data.unreadCount||0)>0 && conv.lastAdminMessageId && Number(conv.lastAdminMessageId)!==Number(seenLatestRef.current)){
        setBanner({conversationId:Number(conv.id),sender:'ORGROOM Admin Team',preview:conv.lastAdminMessage,createdAt:conv.lastAdminMessageAt,messageId:conv.lastAdminMessageId});
        if(seenLatestRef.current!==null && bannerMessageRef.current!==conv.lastAdminMessageId){bannerMessageRef.current=conv.lastAdminMessageId;playPing();}
        seenLatestRef.current=conv.lastAdminMessageId;
      }
    }
  },[api,isAdmin,user?.id,playPing]);

  const ensureConversation=useCallback(async()=>{
    if(isAdmin)return;
    if(teacherConversation)return teacherConversation;
    const data=await api('/api/chat/conversation',{method:'POST',body:JSON.stringify({})});
    setTeacherConversation(data.conversation);
    setSelectedId(Number(data.conversation.id));
    return data.conversation;
  },[api,isAdmin,teacherConversation]);

  const loadMessages=useCallback(async(id,markRead=true)=>{
    if(!id)return;
    const data=await api(`/api/chat/conversations/${id}/messages`);
    const rows=data.messages||[];
    const oldIds=new Set(messagesRef.current.map(m=>Number(m.id)));
    const newIncoming=rows.filter(m=>!oldIds.has(Number(m.id))&&Number(m.senderId)!==Number(user.id));
    if(newIncoming.length && seenLatestRef.current!==null){
      const latest=newIncoming[newIncoming.length-1];
      setBanner({conversationId:Number(id),sender:latest.senderName,preview:latest.text,createdAt:latest.createdAt,messageId:latest.id});
      if(bannerMessageRef.current!==latest.id){bannerMessageRef.current=latest.id;playPing();}
    }
    messagesRef.current=rows;
    setMessages(rows);
    if(markRead && openRef.current && Number(selectedRef.current)===Number(id)){
      if(rows.length){
        const readState=await api(`/api/chat/conversations/${id}/read`,{method:'POST',body:JSON.stringify({lastReadMessageId:Number(rows[rows.length-1].id)})});
        if(isAdmin){
          setInbox(current=>current.map(c=>Number(c.id)===Number(id)?{...c,unreadCount:Number(readState.unreadCount||0)}:c));
        }else setUnread(Number(readState.unreadCount||0));
      }
    }else setUnread(Number(data.unreadCount||0));
  },[api,user?.id,isAdmin,playPing]);

  useEffect(()=>{
    if(!user)return;
    let cancelled=false;
    const initial=async()=>{
      try{await refreshInbox();}catch{}
    };
    initial();
    const timer=setInterval(()=>{if(!cancelled)refreshInbox().catch(()=>{});},5000);
    return()=>{cancelled=true;clearInterval(timer);};
  },[user?.id,refreshInbox]);

  useEffect(()=>{
    if(!open || !user)return;
    let cancelled=false;
    const start=async()=>{
      setLoading(true);setError('');
      try{
        if(!isAdmin){
          const conv=await ensureConversation();
          if(!cancelled && conv)await loadMessages(Number(conv.id),true);
        }else{
          const data=await api('/api/chat/inbox');
          if(cancelled)return;
          setInbox(data.conversations||[]);
          const chosen=selectedId || selectedConversationId;
          if(chosen){
            setSelectedId(Number(chosen));
            onSelectConversation?.(Number(chosen));
            await loadMessages(Number(chosen),true);
          }else setMessages([]);
        }
      }catch(e){if(!cancelled)setError(e.message||'Unable to open messaging.');}
      finally{if(!cancelled)setLoading(false);}
    };
    start();
    return()=>{cancelled=true;};
  },[open,user?.id,isAdmin]);

  useEffect(()=>{
    if(!open || !selectedId)return;
    let cancelled=false;
    const poll=async()=>{
      try{
        if(isAdmin)await refreshInbox();
        await loadMessages(Number(selectedId),true);
      }catch(e){if(!cancelled)setError(e.message||'Unable to refresh messages.');}
    };
    const timer=setInterval(()=>{if(!cancelled)poll();},3500);
    return()=>{cancelled=true;clearInterval(timer);};
  },[open,selectedId,isAdmin,loadMessages,refreshInbox]);

  useEffect(()=>{
    if(!autoScroll)return;
    messageEndRef.current?.scrollIntoView({behavior:'smooth',block:'end'});
  },[messages,autoScroll]);

  const chooseConversation=async(id)=>{
    setSelectedId(Number(id));onSelectConversation?.(Number(id));messagesRef.current=[];setMessages([]);setAutoScroll(true);setError('');
    try{setLoading(true);await loadMessages(Number(id),true);}catch(e){setError(e.message||'Unable to open conversation.');}finally{setLoading(false);}
  };
  const send=async(e)=>{
    e?.preventDefault();
    const text=draft.trim();
    if(!text||sending||sendingRef.current||!selectedId)return;
    sendingRef.current=true;
    setSending(true);setError('');
    try{
      const data=await api(`/api/chat/conversations/${selectedId}/messages`,{method:'POST',body:JSON.stringify({message:text})});
      messagesRef.current=[...messagesRef.current,data.message];setMessages(messagesRef.current);
      setDraft('');
      setAutoScroll(true);
      if(isAdmin)await refreshInbox();
    }catch(e){setError(e.message||'Message could not be sent. Please try again.');}
    finally{sendingRef.current=false;setSending(false);}
  };
  const toggleSound=()=>{
    setSoundEnabled(value=>{
      const next=!value;
      try{localStorage.setItem('orgroom-chat-sound',String(next));}catch{}
      return next;
    });
  };
  const openBanner=()=>{
    if(banner?.conversationId){
      onOpenChange(true);
      if(isAdmin)chooseConversation(banner.conversationId);
      setBanner(null);
    }
  };

  return (
    <>
      {banner && (
        <div className="orgchat-alert" role="status">
          <span className="orgchat-alert-icon"><BellRing size={19}/></span>
          <button className="orgchat-alert-copy" onClick={openBanner}>
            <b>New message · {banner.sender}</b>
            <span>{String(banner.preview||'').slice(0,130)}</span>
            <small>{shortTime(banner.createdAt)} · Open conversation</small>
          </button>
          <button className="orgchat-alert-close" onClick={()=>setBanner(null)} aria-label="Dismiss message alert"><X size={17}/></button>
        </div>
      )}
      {!open&&<button className="orgchat-fab" onClick={()=>onOpenChange(true)} aria-label="Open messages" title="Messages">
        <MessageCircle size={27} strokeWidth={2.5}/>
        {totalUnread>0&&<span className="orgchat-fab-badge">{totalUnread>99?'99+':totalUnread}</span>}
      </button>}
      {open&&(
        <section className={`orgchat-panel ${theme==='dark'?'is-dark':''}`} role="dialog" aria-label="ORGROOM messages">
          <header className="orgchat-header">
            <div className="orgchat-header-icon"><MessageSquare size={20}/></div>
            <div className="orgchat-header-title"><b>{isAdmin?'Admin inbox':'Contact Admin'}</b><span>{isAdmin?'Teacher support conversations':'Your private conversation with the Admin team'}</span></div>
            <button className="orgchat-sound" onClick={toggleSound} title={soundEnabled?'Mute message sound':'Enable message sound'} aria-label={soundEnabled?'Mute message sound':'Enable message sound'}>{soundEnabled?<Volume2 size={18}/>:<VolumeX size={18}/>}</button>
            <button className="orgchat-close" onClick={()=>onOpenChange(false)} aria-label="Minimize chat"><X size={20}/></button>
          </header>
          <div className={`orgchat-body ${isAdmin?'admin-mode':''}`}>
            {isAdmin&&(
              <aside className="orgchat-inbox">
                <div className="orgchat-inbox-title">Conversations <span>{inbox.length}</span></div>
                {!inbox.length?<div className="orgchat-empty-small">No Teacher conversations yet.</div>:inbox.map(c=>(
                  <button key={c.id} className={`orgchat-conversation ${Number(selectedId)===Number(c.id)?'active':''}`} onClick={()=>chooseConversation(c.id)}>
                    <span className="orgchat-avatar">{String(c.teacherName||'T').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()}</span>
                    <span className="orgchat-conversation-copy"><b>{c.teacherName}</b><small>{c.lastMessage||'No messages yet'}</small></span>
                    <span className="orgchat-conversation-meta">{c.unreadCount>0&&<i>{c.unreadCount>99?'99+':c.unreadCount}</i>}<small>{shortTime(c.lastMessageAt)}</small></span>
                  </button>
                ))}
              </aside>
            )}
            <div className="orgchat-thread">
              {isAdmin&&selectedId&&<div className="orgchat-thread-back"><button onClick={()=>{setSelectedId(null);onSelectConversation?.(null);setMessages([]);}}><ChevronLeft size={16}/> All conversations</button></div>}
              <div className="orgchat-thread-heading">
                <div><b>{isAdmin?(activeConversation?.teacherName||'Select a conversation'):(user?.name||'Your conversation')}</b><span>{isAdmin?(activeConversation?.teacherEmail||'Teacher conversation'):'ORGROOM Admin Team'}</span></div>
                {unread>0&&<span className="orgchat-unread-label">{unread} unread</span>}
              </div>
              <div className="orgchat-messages" onScroll={e=>{const el=e.currentTarget;setAutoScroll(el.scrollHeight-el.scrollTop-el.clientHeight<80);}}>
                {loading&&!messages.length?<div className="orgchat-loading">Loading conversation…</div>:!selectedId?<div className="orgchat-empty"><MessageCircle size={30}/><b>Select a Teacher conversation</b><span>Incoming Teacher messages will appear in this shared inbox.</span></div>:!messages.length?<div className="orgchat-empty"><MessageCircle size={30}/><b>Start the conversation</b><span>Send a message to the ORGROOM Admin team.</span></div>:messages.map(m=>{
                  const mine=Number(m.senderId)===Number(user.id);
                  return <div key={m.id} className={`orgchat-message-row ${mine?'mine':'theirs'}`}>
                    {!mine&&<small className="orgchat-sender">{m.senderName}</small>}
                    <div className="orgchat-bubble">{m.text}</div>
                    <time>{shortTime(m.createdAt)}{mine&&isAdmin?' · Sent':''}</time>
                  </div>;
                })}
                <div ref={messageEndRef}/>
              </div>
              {error&&<div className="orgchat-error">{error}</div>}
              <form className="orgchat-compose" onSubmit={send}>
                <textarea value={draft} onChange={e=>setDraft(e.target.value)} placeholder={selectedId?'Write a message…':'Select a conversation first'} rows={1} maxLength={4000} disabled={!selectedId||sending} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send(e);}}}/>
                <button type="submit" disabled={!selectedId||!draft.trim()||sending} aria-label="Send message"><Send size={18}/></button>
              </form>
              <div className="orgchat-compose-note">Enter to send · Shift + Enter for a new line</div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
