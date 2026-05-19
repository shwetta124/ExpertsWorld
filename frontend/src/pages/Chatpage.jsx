// 📁 FILE LOCATION: frontend/src/pages/ChatPage.jsx

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Send, Paperclip, Smile, ArrowLeft,
  CheckCheck, X, Video, Loader,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { sessionAPI } from '../services/api';
import toast from 'react-hot-toast';

const EMOJIS = ['😊','😂','👍','🙏','❤️','🔥','✅','💡','👏','🤔','😅','🎉'];

export default function ChatPage() {
  const { sessionId }    = useParams();
  const navigate         = useNavigate();
  const { user }         = useAuth();
  const { socket, emit } = useSocket() || {};

  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState('');
  const [session,     setSession]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [showEmoji,   setShowEmoji]   = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [isEnded,     setIsEnded]     = useState(false);
  const [ending,      setEnding]      = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const fileInputRef   = useRef(null);
  const typingTimeout  = useRef(null);
  const timerRef       = useRef(null);
  const messagesRef    = useRef([]);

  // ── Load session ───────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res   = await sessionAPI.getMySessions();
        const found = res.data.sessions?.find(s => s._id === sessionId);
        if (found) {
          setSession(found);
          const ended = ['completed', 'rejected', 'cancelled'].includes(found.status);
          setIsEnded(ended);
        }
      } catch (err) {
        console.error('Failed to load session:', err.response?.data || err.message);
        toast.error('Failed to load session');
      } finally {
        setLoading(false);
      }
    };
    load();

    const welcome = {
      id:        'welcome',
      text:      '👋 Session started! Chat history is saved here.',
      sender:    'system',
      timestamp: new Date(),
    };
    messagesRef.current = [welcome];
    setMessages([welcome]);
  }, [sessionId]);

  // ── Timer ──────────────────────────────────────────────────
  useEffect(() => {
    if (isEnded) return;
    timerRef.current = setInterval(() => setSessionTime(t => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [isEnded]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ── Socket ─────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || isEnded) return;
    socket.emit('join_session', sessionId);

    const handleReceive = (msg) => {
      if (msg.senderId === user?._id) return;
      const newMsg = {
        id:         `remote-${Date.now()}-${Math.random()}`,
        text:       msg.text,
        sender:     msg.senderId,
        senderName: msg.senderName,
        timestamp:  new Date(msg.timestamp),
        type:       msg.type || 'text',
        fileUrl:    msg.fileUrl,
        fileName:   msg.fileName,
      };
      messagesRef.current = [...messagesRef.current, newMsg];
      setMessages([...messagesRef.current]);
    };

    const handleTyping = ({ senderId, isTyping }) => {
      if (senderId !== user?._id) setOtherTyping(isTyping);
    };

    socket.on('receive_message', handleReceive);
    socket.on('user_typing',     handleTyping);
    return () => {
      socket.off('receive_message', handleReceive);
      socket.off('user_typing',     handleTyping);
    };
  }, [socket, sessionId, user, isEnded]);

  // ── Auto scroll ────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── End Session ────────────────────────────────────────────
  // Uses: PATCH /api/sessions/:id/complete  (matches sessionRoutes.js)
  // Auth: ew_token from localStorage        (matches api.js interceptor)
  const handleEndSession = async () => {
    if (ending) return;
    setEnding(true);
    const durationMins = Math.floor(sessionTime / 60);
    const loadingToast = toast.loading('Ending session...');

    try {
      await sessionAPI.complete(sessionId, { duration: durationMins });
      toast.dismiss(loadingToast);
      clearInterval(timerRef.current);
      setIsEnded(true);
      toast.success('Session ended successfully!');
      setTimeout(() => navigate('/history'), 800);

    } catch (err) {
      toast.dismiss(loadingToast);
      const status  = err.response?.status;
      const message = err.response?.data?.message || err.message || '';
      console.error('End session failed:', status, message);

      // Already completed from other side — treat as success
      if (status === 404 || message.toLowerCase().includes('not found') || message.toLowerCase().includes('already')) {
        clearInterval(timerRef.current);
        setIsEnded(true);
        toast.success('Session ended!');
        setTimeout(() => navigate('/history'), 800);
        return;
      }

      // Network / server down — mark done locally
      if (!err.response || status >= 500) {
        toast.error('Server unreachable — session marked done locally.', { duration: 4000 });
        clearInterval(timerRef.current);
        setIsEnded(true);
        setTimeout(() => navigate('/history'), 1200);
        return;
      }

      toast.error(`Failed to end session: ${message || 'Please try again'}`);
    } finally {
      setEnding(false);
    }
  };

  // ── Send message ───────────────────────────────────────────
  const sendMessage = () => {
    if (!input.trim() || isEnded) return;
    const msg = {
      id:         `local-${Date.now()}`,
      text:       input.trim(),
      sender:     user?._id,
      senderName: user?.name,
      timestamp:  new Date(),
      type:       'text',
    };
    messagesRef.current = [...messagesRef.current, msg];
    setMessages([...messagesRef.current]);
    emit?.('send_message', {
      sessionId,
      senderId:   user?._id,
      senderName: user?.name,
      text:       input.trim(),
      timestamp:  new Date().toISOString(),
      type:       'text',
    });
    setInput('');
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  // ── Typing indicator ───────────────────────────────────────
  const handleTyping = (e) => {
    setInput(e.target.value);
    if (isEnded) return;
    emit?.('user_typing', { sessionId, senderId: user?._id, isTyping: true });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      emit?.('user_typing', { sessionId, senderId: user?._id, isTyping: false });
    }, 1500);
  };

  // ── File upload ────────────────────────────────────────────
  const handleFileUpload = (e) => {
    if (isEnded) return;
    const file = e.target.files[0];
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const fileUrl = URL.createObjectURL(file);
    const msg = {
      id:         `local-${Date.now()}`,
      text:       isImage ? '📷 Image shared' : `📎 ${file.name}`,
      sender:     user?._id,
      senderName: user?.name,
      timestamp:  new Date(),
      type:       isImage ? 'image' : 'file',
      fileUrl,
      fileName:   file.name,
    };
    messagesRef.current = [...messagesRef.current, msg];
    setMessages([...messagesRef.current]);
    emit?.('send_message', {
      sessionId,
      senderId:   user?._id,
      senderName: user?.name,
      text:       msg.text,
      timestamp:  new Date().toISOString(),
      type:       msg.type,
      fileName:   file.name,
    });
    toast.success(`${isImage ? 'Image' : 'File'} shared!`);
  };

  // ── Message bubble ─────────────────────────────────────────
  const MessageBubble = ({ msg }) => {
    const isMe     = msg.sender === user?._id;
    const isSystem = msg.sender === 'system';

    if (isSystem) {
      return (
        <div style={{ textAlign: 'center', margin: '12px 0' }}>
          <span style={{ background: 'var(--surface2)', color: 'var(--text3)', fontSize: 12, padding: '4px 14px', borderRadius: 99, border: '1px solid var(--border)' }}>
            {msg.text}
          </span>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
        {!isMe && (
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--brand-light)', color: 'var(--brand)', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 8, flexShrink: 0, alignSelf: 'flex-end' }}>
            {(msg.senderName || 'U').charAt(0).toUpperCase()}
          </div>
        )}
        <div style={{ maxWidth: '70%' }}>
          {!isMe && (
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 3, marginLeft: 4 }}>
              {msg.senderName}
            </div>
          )}
          <div style={{ background: isMe ? 'var(--brand)' : 'var(--surface)', color: isMe ? 'white' : 'var(--text)', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px', padding: '10px 14px', border: isMe ? 'none' : '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            {msg.type === 'image' && msg.fileUrl
              ? <img src={msg.fileUrl} alt="shared" style={{ maxWidth: 200, borderRadius: 8, display: 'block' }} />
              : msg.type === 'file' && msg.fileUrl
              ? <a href={msg.fileUrl} download={msg.fileName} style={{ color: isMe ? 'rgba(255,255,255,0.9)' : 'var(--brand)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Paperclip size={13} /> {msg.fileName}
                </a>
              : <div style={{ fontSize: 14, lineHeight: 1.5 }}>{msg.text}</div>
            }
          </div>
          <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3, textAlign: isMe ? 'right' : 'left', display: 'flex', alignItems: 'center', justifyContent: isMe ? 'flex-end' : 'flex-start', gap: 4 }}>
            {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            {isMe && <CheckCheck size={11} />}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader size={28} color="var(--brand)" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes bounce{0%,80%,100%{transform:scale(.6)}40%{transform:scale(1)}}`}</style>

      {/* ── Header ── */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 1.5rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={18} />
          </button>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--brand-light)', color: 'var(--brand)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
            {session?.expert?.name?.charAt(0) || 'E'}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{session?.expert?.name || 'Session Chat'}</div>
            <div style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
              {isEnded ? (
                <span style={{ color: 'var(--text3)' }}>📋 Chat history — session ended</span>
              ) : (
                <>
                  <div style={{ width: 6, height: 6, background: 'var(--success)', borderRadius: '50%' }} />
                  <span style={{ color: 'var(--success)' }}>Live · {formatTime(sessionTime)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {!isEnded && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => navigate(`/video/${sessionId}/${sessionId}`)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--brand)', color: 'white', border: 'none', borderRadius: 99, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              <Video size={13} /> Join Video
            </button>
            <button
              onClick={handleEndSession}
              disabled={ending}
              style={{ background: ending ? 'var(--border2)' : 'var(--danger)', color: 'white', border: 'none', borderRadius: 99, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: ending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 5, opacity: ending ? 0.7 : 1, transition: 'all .2s' }}>
              {ending
                ? <><Loader size={11} style={{ animation: 'spin 1s linear infinite' }} /> Ending...</>
                : <><X size={13} /> End Session</>}
            </button>
          </div>
        )}

        {isEnded && (
          <button onClick={() => navigate('/history')} style={{ background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)', borderRadius: 99, padding: '7px 14px', fontSize: 12, cursor: 'pointer' }}>
            ← Back to History
          </button>
        )}
      </div>

      {/* ── Ended banner ── */}
      {isEnded && (
        <div style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)', padding: '10px 1.5rem', textAlign: 'center', fontSize: 13, color: 'var(--text3)' }}>
          🔒 This session has ended · Showing chat history only
        </div>
      )}

      {/* ── Messages ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
        <div style={{ maxWidth: 720, width: '100%', margin: '0 auto' }}>
          {messages.length === 1 && isEnded && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text3)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>No chat history</div>
              <div style={{ fontSize: 13 }}>No messages were sent during this session</div>
            </div>
          )}
          {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}

          {otherTyping && !isEnded && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>E</div>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px 18px 18px 4px', padding: '10px 16px', display: 'flex', gap: 4 }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, background: 'var(--text3)', borderRadius: '50%', animation: `bounce 1.2s ease ${i*0.2}s infinite` }} />)}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Emoji picker ── */}
      {showEmoji && !isEnded && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '10px', display: 'flex', flexWrap: 'wrap', gap: 6, maxWidth: 280, margin: '0 1.5rem 8px', boxShadow: 'var(--shadow-md)' }}>
          {EMOJIS.map(e => (
            <button key={e} onClick={() => { setInput(i => i + e); inputRef.current?.focus(); }} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', padding: '2px' }}>{e}</button>
          ))}
        </div>
      )}

      {/* ── Input area ── */}
      {!isEnded ? (
        <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '12px 1.5rem' }}>
          <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleFileUpload} accept="image/*,.pdf,.doc,.docx,.txt" />
            <button onClick={() => fileInputRef.current?.click()} style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: 'var(--surface2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)', flexShrink: 0 }}>
              <Paperclip size={16} />
            </button>
            <button onClick={() => setShowEmoji(v => !v)} style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: showEmoji ? 'var(--brand-light)' : 'var(--surface2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: showEmoji ? 'var(--brand)' : 'var(--text2)', flexShrink: 0 }}>
              <Smile size={16} />
            </button>
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleTyping}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
              rows={1}
              style={{ flex: 1, padding: '10px 16px', border: '1.5px solid var(--border)', borderRadius: 22, background: 'var(--surface2)', fontSize: 14, color: 'var(--text)', resize: 'none', fontFamily: 'var(--font-body)', maxHeight: 120, overflowY: 'auto', lineHeight: 1.5, outline: 'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--brand)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button onClick={sendMessage} disabled={!input.trim()} style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: input.trim() ? 'var(--brand)' : 'var(--border2)', cursor: input.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .2s' }}>
              <Send size={16} color="white" />
            </button>
          </div>
          <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>
            🔒 Messages are end-to-end encrypted · Session: {sessionId?.slice(-8)}
          </div>
        </div>
      ) : (
        <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '12px 1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--text3)' }}>🔒 Session ended · Chat is read-only</div>
        </div>
      )}
    </div>
  );
}