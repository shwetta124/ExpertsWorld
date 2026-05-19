// 📁 CREATE THIS FILE AT:
// frontend/src/utils/firebase.js

// ── SETUP INSTRUCTIONS ──────────────────────────────────────
// 1. Go to https://console.firebase.google.com
// 2. Create new project → name it "ExpertsWorld"
// 3. Click "Add app" → choose Web (</>)
// 4. Register app → copy the firebaseConfig values below
// 5. Go to Cloud Messaging → get your VAPID key
// 6. Run: npm install firebase
// ────────────────────────────────────────────────────────────

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Replace with your Firebase config
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app       = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// ── Request notification permission ─────────────────────────
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    console.log('FCM Token:', token);
    return token;
  } catch (err) {
    console.error('Failed to get notification permission:', err);
    return null;
  }
};

// ── Listen for foreground messages ───────────────────────────
export const onForegroundMessage = (callback) => {
  return onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    callback(payload);
  });
};

export { messaging };