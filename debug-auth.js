// Debug script to test Firebase connection
const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

console.log('Firebase Config:');
Object.entries(firebaseConfig).forEach(([key, value]) => {
  console.log(`${key}: ${value ? 'SET' : 'MISSING'}`);
});

try {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  console.log('\n✅ Firebase initialized successfully');
  console.log('Auth domain:', firebaseConfig.authDomain);
} catch (error) {
  console.log('\n❌ Firebase initialization failed:', error.message);
}
