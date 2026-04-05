// Firebase v9 Compat CDN for vanilla JS
firebase.initializeApp({
  apiKey: "AIzaSyBs3MqgJOqX22Tdwr7sfaCwlMKzXIWgIfc",
  authDomain: "farma-2ea59.firebaseapp.com",
  projectId: "farma-2ea59",
  storageBucket: "farma-2ea59.firebasestorage.app",
  messagingSenderId: "866473353666",
  appId: "1:866473353666:web:c18f453eababf6de76765b"
});

const db = firebase.firestore();
const auth = firebase.auth();

// Firebase ready
console.log('Firebase ready');

// Export for script.js
window.db = db;
window.auth = auth;
window.firebase = firebase;

