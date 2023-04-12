import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE,
  authDomain: 'webook-studygroup.firebaseapp.com',
  projectId: 'webook-studygroup',
  storageBucket: 'webook-studygroup.appspot.com',
  messagingSenderId: '650255613331',
  appId: '1:650255613331:web:ea97eca77416047583bc66',
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { storage, db, auth };
