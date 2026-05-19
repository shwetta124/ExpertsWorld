import { useEffect } from 'react';
import { requestNotificationPermission, onForegroundMessage } from '../utils/firebase';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';

export default function useFirebaseNotifications() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const setupNotifications = async () => {
      try {
        const token = await requestNotificationPermission();

        if (token) {
          console.log('✅ FCM Token:', token.slice(0, 20) + '...');

          // Save token to backend — don't crash if it fails
          try {
            await API.post('/auth/save-fcm-token', { token });
            console.log('✅ FCM token saved to backend');
          } catch (err) {
            // Silently ignore — non-critical
            console.warn('Could not save FCM token:', err.message);
          }
        }

        // Listen for foreground messages
        const unsubscribe = onForegroundMessage((payload) => {
          const { title, body } = payload.notification || {};
          toast.custom((t) => (
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--brand)',
              borderRadius: 12, padding: '14px 16px', maxWidth: 320,
              boxShadow: '0 8px 32px rgba(26,86,219,0.15)',
              display: 'flex', gap: 12, alignItems: 'flex-start',
              opacity: t.visible ? 1 : 0, transition: 'opacity .3s',
            }}>
              <span style={{ fontSize: 24 }}>🔔</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                  {title || 'ExpertsWorld'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>
                  {body || 'You have a new notification'}
                </div>
              </div>
            </div>
          ), { duration: 6000 });
        });

        return unsubscribe;
      } catch (err) {
        // Firebase not set up yet — silently ignore
        console.warn('Firebase notifications not available:', err.message);
      }
    };

    let unsubscribe;
    setupNotifications().then(fn => { unsubscribe = fn; });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [user]);
}