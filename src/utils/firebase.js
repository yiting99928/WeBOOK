import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_KEY,
  authDomain: 'webook-online-study-group.firebaseapp.com',
  projectId: 'webook-online-study-group',
  storageBucket: 'webook-online-study-group.appspot.com',
  messagingSenderId: '671095613820',
  appId: '1:671095613820:web:3f792fdcc8fe26c43c5cf9',
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);

export { storage, db };
