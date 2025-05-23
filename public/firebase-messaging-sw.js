importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
const firebaseConfig = {
  apiKey: "AIzaSyB6toQ2t2A7jfTmMmmUO0OIRIJ3tysLBCE",
  authDomain: "trustlens-cbf72.firebaseapp.com",
  projectId: "trustlens-cbf72",
  storageBucket: "trustlens-cbf72.firebasestorage.app",
  messagingSenderId: "779362610790",
  appId: "1:779362610790:web:5af6161b6d9b96b69d47a7",
  measurementId: "G-GJL974W6TN",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png', // Optional: Add an icon in your public folder
    data: { url: payload.data.url || '/' }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});