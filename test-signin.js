// Test script that runs your exact login code outside the browser
const admin = require('firebase-admin');

// Check if admin environment variables are available
console.log('=== CHECKING ADMIN ENVIRONMENT ===');
const adminVars = {
  'FIREBASE_ADMIN_PROJECT_ID': process.env.FIREBASE_ADMIN_PROJECT_ID,
  'FIREBASE_ADMIN_CLIENT_EMAIL': process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  'FIREBASE_ADMIN_PRIVATE_KEY': process.env.FIREBASE_ADMIN_PRIVATE_KEY ? 'SET (hidden)' : 'MISSING'
};

Object.entries(adminVars).forEach(([key, value]) => {
  console.log(`${key}: ${value || 'MISSING'}`);
});

// Test admin initialization
console.log('\n=== TESTING ADMIN INITIALIZATION ===');
try {
  if (!admin.apps.length) {
    let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    if (privateKey?.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
  }
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.log('❌ Firebase Admin initialization failed:', error.message);
  process.exit(1);
}

// Test admin allowlist
console.log('\n=== TESTING ADMIN ALLOWLIST ===');
const allowlist = (process.env.ADMIN_ALLOWLIST || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

console.log('Admin allowlist:', allowlist);
console.log('Your email (atkunjadia@gmail.com) is allowed:', allowlist.includes('atkunjadia@gmail.com'));

console.log('\n=== READY FOR BROWSER TESTING ===');
console.log('Now go to: http://localhost:3000/debug-auth');
console.log('1. Click "Check Config" - should show all Firebase client vars are SET');
console.log('2. Open browser console (F12 → Console)');
console.log('3. Try signing in and watch for error messages');
console.log('4. If you get "user-not-found" - try signing UP first');
console.log('5. If you get network errors - check Firebase Console → Authentication → Settings → Authorized domains');
