
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDpnj9TLLvZ3Sl1dKjTZJ0O48wGqVh2lqQ",
  authDomain: "nafsmarket-264a6.firebaseapp.com",
  projectId: "nafsmarket-264a6",
  storageBucket: "nafsmarket-264a6.firebasestorage.app",
  messagingSenderId: "934765304749",
  appId: "1:934765304749:web:22ef8a66f8cce91beb9f24",
  measurementId: "G-H4MHDJM4WC"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

export { auth, db, firebase };
