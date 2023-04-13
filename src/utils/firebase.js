import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE,
  authDomain: "webook-book-group.firebaseapp.com",
  projectId: "webook-book-group",
  storageBucket: "webook-book-group.appspot.com",
  messagingSenderId: "677704191801",
  appId: "1:677704191801:web:7a80ad109451995760e2e8"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { storage, db, auth };
