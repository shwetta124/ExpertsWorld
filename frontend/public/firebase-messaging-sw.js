importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');


firebase.initializeApp({
  apiKey:            'AIzaSyDJqH9_t6yyEULWKoqeXhgjAy-KfNEE_0Y',
  authDomain:        'expertsworld-1d7b6.firebaseapp.com',
  projectId:         'expertsworld-1d7b6',
  storageBucket:     'expertsworld-1d7b6.firebasestorage.app',
  messagingSenderId: '312154510067',
  appId:             '1:312154510067:web:621ad0e500b7fc4f431d86',
});

const messaging = firebase.messaging();


messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);

  const { title, body, icon } = payload.notification;

  self.registration.showNotification(title || 'ExpertsWorld', {
    body:  body  || 'You have a new notification',
    icon:  icon  || '/favicon.ico',
    badge: '/favicon.ico',
    data:  payload.data,
    actions: [
      { action: 'open',    title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss'  },
    ],
  });
});


self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'open' || !event.action) {
    clients.openWindow('/dashboard');
  }
});