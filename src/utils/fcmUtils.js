import { messaging, getToken } from '../firebase/firebase';

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      return true;
    } else {
      console.log('Notification permission denied.');
      return false;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

export const getFCMToken = async () => {
  try {
    const token = await getToken(messaging, {
      vapidKey: 'BF0Yxli0-77TdQtN--qAQk0VBDI--aTamVX7uSC7NIMD314g0BAYPnOhkHWnMWB-QR2C8TB7Pnh2UVHOM' // Replace with your VAPID key from Firebase Console
    });
    if (token) {
      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('No FCM token available. Permission may not be granted.');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};