import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'
import { getMessaging, isSupported } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAc4NLbLEz5-PmNygKSJh5oZ31x0otP5LY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mechanicsweb.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mechanicsweb",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mechanicsweb.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "827236770261",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:827236770261:web:1e5e3fd414cfba28289d5c",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-VB39YE9W4H",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Ensure auth is properly configured for phone authentication
if (typeof window !== 'undefined') {
  // Set language code for phone auth (optional)
  auth.languageCode = 'en';
  
  // Configure app verification for phone auth
  auth.settings.appVerificationDisabledForTesting = false;
}

// Initialize messaging only in browser environment
export const getMessagingInstance = async () => {
  if (typeof window !== 'undefined' && await isSupported()) {
    return getMessaging(app)
  }
  return null
}

// Connect to emulators in development (optional - comment out for production Firebase)
// if (process.env.NODE_ENV === 'development') {
//   try {
//     if (!auth.config.emulator) {
//       connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
//     }
//   } catch (error) {
//     console.log('Auth emulator already connected or not available')
//   }
// }

export default app 