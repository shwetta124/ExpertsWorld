// 📁 REPLACE: frontend/src/pages/VideoCallPage.jsx

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff,
  Monitor, MessageSquare, Users, Send,
} from 'lucide-react';
import { useAuth }    from '../context/AuthContext';
import { useSocket }  from '../context/SocketContext';
import { sessionAPI } from '../services/api';
import API            from '../services/api';
import toast          from 'react-hot-toast';

const APP_ID = import.meta.env.VITE_AGORA_APP_ID;

export default function VideoCallPage() {
  const { sessionId, channelName } = useParams();
  const navigate                   = useNavigate();
  const { user }                   = useAuth();
  const { socket, emit }           = useSocket() || {};

  const clientRef      = useRef(null);
  const localAudioRef  = useRef(null);
  const localVideoRef  = useRef(null);
  const screenTrackRef = useRef(null);
  const timerRef       = useRef(null);
  const hideTimer      = useRef(null);
  const chatEndRef     = useRef(null);

  const [joined,         setJoined]         = useState(false);
  const [joining,        setJoining]        = useState(true);
  const [error,          setError]          = useState('');
  const [remoteUsers,    setRemoteUsers]    = useState([]);
  const [micOn,          setMicOn]          = useState(true);
  const [camOn,          setCamOn]          = useState(true);
  const [hasCamera,      setHasCamera]      = useState(true);  // track if camera exists
  const [hasMic,         setHasMic]         = useState(true);  // track if mic exists
  const [screenShare,    setScreenShare]    = useState(false);
  const [showChat,       setShowChat]       = useState(false);
  const [duration,       setDuration]       = useState(0);
  const [showControls,   setShowControls]   = useState(true);
  const [messages,       setMessages]       = useState([]);
  const [chatInput,      setChatInput]      = useState('');

  const channel = channelName || sessionId || 'test';

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Socket chat ────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;
    socket.emit('join_session', sessionId);
    const fn = (msg) => {
      if (msg.senderId === user?._id) return;
      setMessages(p => [...p, {
        id: `r${Date.now()}`,
        text: msg.text,
        isMe: false,
        senderName: msg.senderName,
        time: new Date(),
      }]);
    };
    socket.on('receive_message', fn);
    return () => socket.off('receive_message', fn);
  }, [socket, sessionId]);

  // ── Start Agora ────────────────────────────────────────────
  useEffect(() => {
    if (!APP_ID) {
      setError('NO_APP_ID');
      setJoining(false);
      return;
    }

    let mounted = true;

    const startCall = async () => {
      try {
        const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
        AgoraRTC.setLogLevel(4);

        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        clientRef.current = client;

        // ── Remote user events ─────────────────────────────
        client.on('user-published', async (remoteUser, mediaType) => {
          await client.subscribe(remoteUser, mediaType);
          if (!mounted) return;

          if (mediaType === 'video') {
            setRemoteUsers(prev => {
              const exists = prev.find(u => u.uid === remoteUser.uid);
              return exists
                ? prev.map(u => u.uid === remoteUser.uid ? remoteUser : u)
                : [...prev, remoteUser];
            });
            setTimeout(() => {
              const el = document.getElementById(`remote-${remoteUser.uid}`);
              if (el && remoteUser.videoTrack) remoteUser.videoTrack.play(el);
            }, 300);
          }
          if (mediaType === 'audio') remoteUser.audioTrack?.play();
        });

        client.on('user-unpublished', (u, t) => {
          if (t === 'video') setRemoteUsers(p => p.filter(x => x.uid !== u.uid));
        });

        client.on('user-left', (u) => {
          setRemoteUsers(p => p.filter(x => x.uid !== u.uid));
          toast('Other person left the call', { icon: '👋' });
        });

        // ── Get token from backend ─────────────────────────
        let token = null;
        try {
          const res = await API.get(`/agora/token?channel=${channel}`);
          token = res.data.token;
        } catch { token = null; }

        // ── Join channel ───────────────────────────────────
        await client.join(APP_ID, channel, token, null);

        // ── Check what devices are available ───────────────
        const devices    = await AgoraRTC.getDevices();
        const cameras    = devices.filter(d => d.kind === 'videoinput');
        const microphones = devices.filter(d => d.kind === 'audioinput');

        const cameraAvailable = cameras.length > 0;
        const micAvailable    = microphones.length > 0;

        setHasCamera(cameraAvailable);
        setHasMic(micAvailable);

        const tracksToPublish = [];

        // ── Create mic track if available ──────────────────
        if (micAvailable) {
          try {
            const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
              AEC: true, ANS: true, AGC: true,
            });
            localAudioRef.current = audioTrack;
            tracksToPublish.push(audioTrack);
          } catch (e) {
            console.warn('Mic track failed:', e.message);
            setHasMic(false);
          }
        }

        // ── Create camera track if available ───────────────
        if (cameraAvailable) {
          try {
            const videoTrack = await AgoraRTC.createCameraVideoTrack({
              encoderConfig: '720p_1',
              facingMode: 'user',
            });
            localVideoRef.current = videoTrack;
            tracksToPublish.push(videoTrack);

            // Play local video
            const el = document.getElementById('local-video');
            if (el) videoTrack.play(el);
          } catch (e) {
            console.warn('Camera track failed:', e.message);
            setHasCamera(false);
            setCamOn(false);
          }
        } else {
          setCamOn(false);
          toast('No camera detected — joining with audio only', { icon: '🎤', duration: 3000 });
        }

        // ── Publish available tracks ───────────────────────
        if (tracksToPublish.length > 0) {
          await client.publish(tracksToPublish);
        }

        if (mounted) {
          setJoined(true);
          setJoining(false);
          if (cameraAvailable) {
            toast.success('📹 Video call connected!');
          } else {
            toast.success('🎤 Audio call connected!');
          }
          timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
        }

      } catch (err) {
        console.error('Video call error:', err);
        if (!mounted) return;
        setJoining(false);

        if (err.code === 'CAN_NOT_GET_GATEWAY_SERVER' || err.message?.includes('dynamic use static key')) {
          setError('TOKEN_MODE');
        } else if (err.name === 'NotAllowedError' || err.message?.includes('Permission')) {
          setError('PERMISSION_DENIED');
        } else if (err.message?.includes('DEVICE_NOT_FOUND') || err.message?.includes('device not found')) {
          // Try audio only as fallback
          tryAudioOnly();
        } else {
          setError(`ERROR:${err.message}`);
        }
      }
    };

    // ── Audio only fallback ────────────────────────────────
    const tryAudioOnly = async () => {
      try {
        const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
        const client   = clientRef.current;

        if (!client) return;

        setHasCamera(false);
        setCamOn(false);

        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        localAudioRef.current = audioTrack;
        await client.publish([audioTrack]);

        if (mounted) {
          setJoined(true);
          setJoining(false);
          toast.success('🎤 Connected with audio only (no camera found)');
          timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
        }
      } catch (audioErr) {
        setError('NO_DEVICE');
      }
    };

    startCall();

    return () => {
      mounted = false;
      clearInterval(timerRef.current);
      localAudioRef.current?.stop(); localAudioRef.current?.close();
      localVideoRef.current?.stop(); localVideoRef.current?.close();
      screenTrackRef.current?.stop(); screenTrackRef.current?.close();
      clientRef.current?.leave().catch(() => {});
    };
  }, []);

  const fmt = s => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const toggleMic = async () => {
    if (!localAudioRef.current) {
      toast.error('No microphone available');
      return;
    }
    await localAudioRef.current.setEnabled(!micOn);
    setMicOn(v => !v);
    toast(micOn ? '🔇 Muted' : '🎤 Unmuted', { duration: 1200 });
  };

  const toggleCam = async () => {
    if (!hasCamera) {
      toast.error('No camera connected to this device');
      return;
    }
    if (!localVideoRef.current) return;
    await localVideoRef.current.setEnabled(!camOn);
    setCamOn(v => !v);
    if (!camOn) {
      setTimeout(() => {
        const el = document.getElementById('local-video');
        if (el && localVideoRef.current) localVideoRef.current.play(el);
      }, 200);
    }
  };

  const toggleScreen = async () => {
    try {
      const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
      if (!screenShare) {
        const track = await AgoraRTC.createScreenVideoTrack({}, 'disable');
        screenTrackRef.current = track;
        if (localVideoRef.current) await clientRef.current.unpublish(localVideoRef.current);
        await clientRef.current.publish(track);
        const el = document.getElementById('local-video');
        if (el) track.play(el);
        track.on('track-ended', toggleScreen);
        setScreenShare(true);
        toast.success('Screen sharing started');
      } else {
        await clientRef.current.unpublish(screenTrackRef.current);
        screenTrackRef.current.stop(); screenTrackRef.current.close();
        screenTrackRef.current = null;
        if (localVideoRef.current) {
          await localVideoRef.current.setEnabled(true);
          await clientRef.current.publish(localVideoRef.current);
          const el = document.getElementById('local-video');
          if (el) localVideoRef.current.play(el);
        }
        setScreenShare(false);
        toast.success('Screen sharing stopped');
      }
    } catch (e) { toast.error('Screen share: ' + e.message); }
  };

  const endCall = async () => {
    clearInterval(timerRef.current);
    localAudioRef.current?.stop(); localAudioRef.current?.close();
    localVideoRef.current?.stop(); localVideoRef.current?.close();
    try { await clientRef.current?.leave(); } catch {}
    try { await sessionAPI.complete(sessionId, { duration: Math.floor(duration / 60) }); } catch {}
    toast.success('Call ended');
    navigate(`/chat/${sessionId}`);
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setMessages(p => [...p, { id: `l${Date.now()}`, text: chatInput, isMe: true, time: new Date() }]);
    emit?.('send_message', {
      sessionId,
      senderId:   user?._id,
      senderName: user?.name,
      text:       chatInput,
      timestamp:  new Date().toISOString(),
    });
    setChatInput('');
  };

  const onMouseMove = () => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 4000);
  };

  // ── Error screens ──────────────────────────────────────────
  if (error === 'NO_APP_ID') {
    return <ErrScreen title="Agora App ID Missing" msg="Add VITE_AGORA_APP_ID to frontend/.env and restart npm run dev" sessionId={sessionId} navigate={navigate} />;
  }
  if (error === 'TOKEN_MODE') {
    return (
      <div style={{ height: '100vh', background: '#0A0E1A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 520 }}>
          <div style={{ fontSize: 52, marginBottom: '1rem' }}>⚠️</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'white', marginBottom: '1rem' }}>Agora Token Mode Error</div>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '1.5rem', textAlign: 'left', marginBottom: '1.5rem' }}>
            <div style={{ color: 'white', fontWeight: 600, marginBottom: 12 }}>🔧 Fix — Create New Project in Testing Mode:</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 2.2 }}>
              1. Go to <a href="https://console.agora.io" target="_blank" rel="noreferrer" style={{ color: '#60A5FA' }}>console.agora.io</a> → Back to all Projects<br/>
              2. Click <strong style={{ color: 'white' }}>Create New Project</strong><br/>
              3. Name: <code style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: 4 }}>ExpertsWorldFree</code><br/>
              4. Authentication: Select <strong style={{ color: '#34D399' }}>Testing Mode</strong><br/>
              5. Submit → Copy App ID<br/>
              6. Update <code style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: 4 }}>frontend/.env</code>: VITE_AGORA_APP_ID=new_id<br/>
              7. Restart: <code style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: 4 }}>npm run dev</code>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button onClick={() => navigate(`/chat/${sessionId}`)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 99, padding: '10px 24px', fontSize: 13, cursor: 'pointer' }}>
              💬 Use Chat Instead
            </button>
            <button onClick={() => window.location.reload()} style={{ background: '#1A56DB', color: 'white', border: 'none', borderRadius: 99, padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              🔄 Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (error === 'PERMISSION_DENIED') {
    return <ErrScreen title="Camera/Mic Permission Denied" msg="Click the 🔒 lock icon in address bar → Allow camera and microphone → Refresh page" sessionId={sessionId} navigate={navigate} />;
  }
  if (error === 'NO_DEVICE') {
    return (
      <div style={{ height: '100vh', background: '#0A0E1A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ fontSize: 52, marginBottom: '1rem' }}>🎤</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'white', marginBottom: '1rem' }}>
            No Camera or Microphone Found
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, marginBottom: '2rem' }}>
            Your device does not have a camera or microphone connected.<br/>
            Please connect a webcam/headset and try again, or use the chat feature instead.
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
            💡 Tip: For video calls you need a webcam. Many laptops have a built-in camera — make sure it's not covered or disabled in device manager.
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button onClick={() => navigate(`/chat/${sessionId}`)} style={{ background: '#1A56DB', color: 'white', border: 'none', borderRadius: 99, padding: '12px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              💬 Use Chat Instead
            </button>
            <button onClick={() => window.location.reload()} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 99, padding: '12px 24px', fontSize: 13, cursor: 'pointer' }}>
              🔄 Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (error.startsWith('ERROR:')) {
    return <ErrScreen title="Video Call Error" msg={error.replace('ERROR:', '')} sessionId={sessionId} navigate={navigate} />;
  }

  // ── Main call UI ───────────────────────────────────────────
  return (
    <div style={{ height: '100vh', background: '#0A0E1A', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }} onMouseMove={onMouseMove}>

      {/* Top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, padding: '1rem 1.5rem', background: 'linear-gradient(to bottom, rgba(0,0,0,0.75), transparent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: showControls ? 1 : 0, transition: 'opacity .3s', pointerEvents: showControls ? 'auto' : 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'white' }}>ExpertsWorld</div>
          {joined && (
            <div style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid #10B981', borderRadius: 99, padding: '3px 12px', fontSize: 12, color: '#10B981', display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 6, height: 6, background: '#10B981', borderRadius: '50%' }} />
              {hasCamera ? 'VIDEO' : 'AUDIO ONLY'} · {fmt(duration)}
            </div>
          )}
          {joining && (
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              Connecting...
            </div>
          )}
          {!hasCamera && joined && (
            <div style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid #F59E0B', borderRadius: 99, padding: '3px 12px', fontSize: 11, color: '#F59E0B' }}>
              📷 No camera — audio only
            </div>
          )}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Users size={14} />{remoteUsers.length + 1} in call
        </div>
      </div>

      {/* Video area */}
      <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
        <div style={{ flex: 1, position: 'relative', background: '#0D1117' }}>

          {/* Remote video */}
          {remoteUsers.length > 0 ? (
            remoteUsers.map(u => (
              <div key={u.uid} id={`remote-${u.uid}`} style={{ position: 'absolute', inset: 0 }} />
            ))
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              {joining ? (
                <>
                  <div style={{ width: 56, height: 56, border: '3px solid rgba(26,86,219,0.3)', borderTopColor: '#1A56DB', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16 }}>
                    {hasCamera ? 'Setting up camera & microphone...' : 'Setting up audio...'}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                    Allow browser permissions when asked
                  </div>
                </>
              ) : (
                <>
                  <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>👤</div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16 }}>Waiting for the other person...</div>
                  {!hasCamera && (
                    <div style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '8px 16px', fontSize: 12, color: '#F59E0B', maxWidth: 360, textAlign: 'center' }}>
                      📷 You are in audio-only mode — no camera detected on this device
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Local video PiP */}
          <div style={{ position: 'absolute', bottom: 90, right: 20, width: 200, height: 130, borderRadius: 14, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)', background: '#1F2937', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', zIndex: 5 }}>
            {camOn && hasCamera
              ? <div id="local-video" style={{ width: '100%', height: '100%' }} />
              : (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {hasCamera
                    ? <><VideoOff size={22} color="rgba(255,255,255,0.4)" /><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Camera off</div></>
                    : <><div style={{ fontSize: 28 }}>🎤</div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Audio only</div></>
                  }
                </div>
              )
            }
            <div style={{ position: 'absolute', bottom: 6, left: 8, background: 'rgba(0,0,0,0.6)', borderRadius: 4, padding: '2px 7px', fontSize: 11, color: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', gap: 4 }}>
              You {!micOn && <MicOff size={10} />}
            </div>
          </div>
        </div>

        {/* Chat sidebar */}
        {showChat && (
          <div style={{ width: 320, background: '#111827', borderLeft: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>Session Chat</div>
              <button onClick={() => setShowChat(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {messages.length === 0
                ? <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: '2rem' }}>No messages yet 👋</div>
                : messages.map(m => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: m.isMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '82%', background: m.isMe ? '#1A56DB' : 'rgba(255,255,255,0.07)', borderRadius: m.isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px', padding: '8px 12px' }}>
                      {!m.isMe && <div style={{ fontSize: 10, color: '#60A5FA', fontWeight: 600, marginBottom: 3 }}>{m.senderName}</div>}
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)' }}>{m.text}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 3, textAlign: 'right' }}>
                        {new Date(m.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              }
              <div ref={chatEndRef} />
            </div>
            <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 8 }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') sendChat(); }}
                placeholder="Type a message..."
                style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '9px 14px', color: 'white', fontSize: 13, outline: 'none' }}
              />
              <button onClick={sendChat} disabled={!chatInput.trim()} style={{ width: 38, height: 38, borderRadius: '50%', background: chatInput.trim() ? '#1A56DB' : 'rgba(255,255,255,0.1)', border: 'none', cursor: chatInput.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Send size={15} color="white" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: showChat ? 320 : 0, zIndex: 20, padding: '1.5rem 2rem', background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 14, opacity: showControls ? 1 : 0, transition: 'opacity .3s', pointerEvents: showControls ? 'auto' : 'none' }}>

        <Btn active={micOn && hasMic}   onColor="#1A56DB"                offColor="#EF4444"              onClick={toggleMic}              icon={micOn ? <Mic size={18}/>    : <MicOff size={18}/>}   label={micOn ? 'Mute' : 'Unmute'}           />
        <Btn active={camOn && hasCamera} onColor="#1A56DB"               offColor={hasCamera ? '#EF4444' : 'rgba(255,255,255,0.1)'} onClick={toggleCam} icon={camOn ? <Video size={18}/> : <VideoOff size={18}/>} label={!hasCamera ? 'No Camera' : camOn ? 'Stop Video' : 'Start Video'} />
        <Btn active={!screenShare}      onColor="rgba(255,255,255,0.15)" offColor="#8B5CF6"              onClick={toggleScreen}           icon={<Monitor size={18}/>}                               label={screenShare ? 'Stop Share' : 'Share Screen'}  />
        <Btn active={showChat}          onColor="#10B981"                offColor="rgba(255,255,255,0.15)" onClick={() => setShowChat(v => !v)} icon={<MessageSquare size={18}/>}                    label="Chat"                                         />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <button onClick={endCall} style={{ width: 58, height: 58, borderRadius: '50%', background: '#EF4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 24px rgba(239,68,68,0.5)', transition: 'transform .2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            <PhoneOff size={22} color="white" />
          </button>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>End Call</span>
        </div>
      </div>
    </div>
  );
}

// ── Error screen component ─────────────────────────────────────
function ErrScreen({ title, msg, sessionId, navigate }) {
  return (
    <div style={{ height: '100vh', background: '#0A0E1A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: 460 }}>
        <div style={{ fontSize: 52, marginBottom: '1rem' }}>⚠️</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'white', marginBottom: '1rem' }}>{title}</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: '2rem', lineHeight: 1.7, background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: 8, fontFamily: 'monospace' }}>{msg}</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={() => navigate(`/chat/${sessionId}`)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 99, padding: '10px 24px', fontSize: 13, cursor: 'pointer' }}>
            💬 Use Chat Instead
          </button>
          <button onClick={() => window.location.reload()} style={{ background: '#1A56DB', color: 'white', border: 'none', borderRadius: 99, padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            🔄 Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Control button component ───────────────────────────────────
function Btn({ active, onColor, offColor, onClick, icon, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <button onClick={onClick} style={{ width: 50, height: 50, borderRadius: '50%', border: 'none', background: active ? onColor : offColor, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transition: 'all .2s' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
        {icon}
      </button>
      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>{label}</span>
    </div>
  );
}