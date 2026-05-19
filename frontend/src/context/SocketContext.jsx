import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const SOCKET_URL = 'http://localhost:4000';

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [connected,     setConnected]     = useState(false);
  const [onlineExperts, setOnlineExperts] = useState(new Set());
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    // Connect
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      // Register user/expert room
      if (user.role === 'expert') {
        socket.emit('join_expert', user.expertId || user._id);
      } else {
        socket.emit('join_user', user._id);
      }
    });

    socket.on('disconnect', () => setConnected(false));

    // Track expert online status
    socket.on('expert_online', ({ expertId, online }) => {
      setOnlineExperts(prev => {
        const next = new Set(prev);
        if (online) next.add(expertId);
        else next.delete(expertId);
        return next;
      });
    });

    // Store notifications
    socket.on('new_request', (request) => {
      setNotifications(prev => [{
        id:      Date.now(),
        type:    'new_request',
        message: `New request from ${request.userName}`,
        data:    request,
        read:    false,
        time:    new Date(),
      }, ...prev]);
    });

    socket.on('request_response', (data) => {
      setNotifications(prev => [{
        id:      Date.now(),
        type:    'request_response',
        message: data.action === 'accepted' ? '✅ Expert accepted your request!' : '❌ Expert is unavailable',
        data,
        read:    false,
        time:    new Date(),
      }, ...prev]);
    });

    socket.on('session_completed', (data) => {
      setNotifications(prev => [{
        id:      Date.now(),
        type:    'session_completed',
        message: '⭐ Session completed! Please rate your experience.',
        data,
        read:    false,
        time:    new Date(),
      }, ...prev]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [user]);

  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      connected,
      onlineExperts,
      notifications,
      unreadCount,
      emit,
      markAllRead,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);