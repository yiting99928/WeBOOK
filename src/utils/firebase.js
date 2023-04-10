import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_KEY,
  authDomain: 'webook-study-group.firebaseapp.com',
  projectId: 'webook-study-group',
  storageBucket: 'webook-study-group.appspot.com',
  messagingSenderId: '767078815989',
  appId: '1:767078815989:web:814148f57b8c9813a50dbc',
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);

export { storage, db };
