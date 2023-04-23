import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE,
  authDomain: "webook-studygroups.firebaseapp.com",
  projectId: "webook-studygroups",
  storageBucket: "webook-studygroups.appspot.com",
  messagingSenderId: "616808966332",
  appId: "1:616808966332:web:0397d4b91d81cdfbdd88b9"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { storage, db, auth };
