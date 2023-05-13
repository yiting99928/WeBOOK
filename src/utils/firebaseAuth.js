import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

const auth = getAuth();

const firebaseAuth = {
  async register(email, password) {
    await createUserWithEmailAndPassword(auth, email, password);
  },
  async signIn(email, password) {
    await signInWithEmailAndPassword(auth, email, password);
  },
  async reset(email) {
    await sendPasswordResetEmail(auth, email);
  },
  async signOut() {
    await signOut(auth);
  },
  async onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  },
};
export default firebaseAuth;
