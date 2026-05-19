import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SOCKET_URL = 'http://localhost:4000';

// Singleton socket instance
let socketInstance = null;

export default function useSocket() {
  const { user } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) {
      // Disconnect if user logs out
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
      }
      return;
    }

    // Create socket connection
    if (!socketInstance) {
      socketInstance = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    }

    socketRef.current = socketInstance;
    const socket = socketRef.current;

    // ── Connection events ──────────────────────────────────
    socket.on('connect', () => {
      console.log('🔌 Socket connected:', socket.id);

      // Register based on user role
      if (user.role === 'expert') {
        socket.emit('join_expert', user.expertId || user._id);
      } else {
        socket.emit('join_user', user._id);
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('Socket error:', err.message);
    });

    // ── Expert: receive new session request ────────────────
    socket.on('new_request', (request) => {
      toast.custom((t) => (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--brand)',
          borderRadius: 12, padding: '14px 16px', maxWidth: 320,
          boxShadow: '0 8px 32px rgba(26,86,219,0.15)',
          display: 'flex', gap: 12, alignItems: 'flex-start',
          opacity: t.visible ? 1 : 0, transition: 'opacity 0.3s',
        }}>
          <div style={{ fontSize: 24 }}>🔔</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
              New Session Request!
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>
              <strong>{request.userName}</strong> wants to connect
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>
              📋 {request.topic}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--success)' }}>
              ₹{request.amount}
            </div>
          </div>
        </div>
      ), { duration: 8000 });
    });

    // ── User: receive expert response ──────────────────────
    socket.on('request_response', (data) => {
      if (data.action === 'accepted') {
        toast.custom((t) => (
          <div style={{
            background: 'var(--success-light)', border: '1px solid var(--success)',
            borderRadius: 12, padding: '14px 16px', maxWidth: 320,
            boxShadow: '0 8px 32px rgba(16,185,129,0.15)',
            opacity: t.visible ? 1 : 0, transition: 'opacity 0.3s',
          }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--success)', marginBottom: 4 }}>
              ✅ Expert Accepted!
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>
              {data.message || 'Your expert accepted the request. Connecting now...'}
            </div>
          </div>
        ), { duration: 6000 });
      } else {
        toast.custom((t) => (
          <div style={{
            background: 'var(--danger-light)', border: '1px solid var(--danger)',
            borderRadius: 12, padding: '14px 16px', maxWidth: 320,
            opacity: t.visible ? 1 : 0, transition: 'opacity 0.3s',
          }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--danger)', marginBottom: 4 }}>
              ❌ Expert Unavailable
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>
              {data.message || 'The expert is unavailable right now. Try another expert.'}
            </div>
          </div>
        ), { duration: 6000 });
      }
    });

    // ── Session completed notification ─────────────────────
    socket.on('session_completed', (data) => {
      toast.custom((t) => (
        <div style={{
          background: 'var(--accent-light)', border: '1px solid var(--accent)',
          borderRadius: 12, padding: '14px 16px', maxWidth: 320,
          opacity: t.visible ? 1 : 0, transition: 'opacity 0.3s',
        }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--accent-dark)', marginBottom: 4 }}>
            ⭐ Session Completed!
          </div>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>
            {data.message || 'Please rate your experience with the expert.'}
          </div>
        </div>
      ), { duration: 8000 });
    });

    // ── Expert online/offline status ───────────────────────
    socket.on('expert_online', ({ expertId, online }) => {
      console.log(`Expert ${expertId} is now ${online ? 'online' : 'offline'}`);
    });

    // ── Queued notifications (missed while offline) ────────
    socket.on('queued_notifications', (notifications) => {
      if (notifications.length > 0) {
        toast(`You have ${notifications.length} new notification(s)`, {
          icon: '🔔',
          duration: 4000,
        });
      }
    });

    // ── Cleanup on unmount ─────────────────────────────────
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('new_request');
      socket.off('request_response');
      socket.off('session_completed');
      socket.off('expert_online');
      socket.off('queued_notifications');
    };
  }, [user]);

  // ── Helper: emit events ────────────────────────────────
  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  return { socket: socketRef.current, emit };
}