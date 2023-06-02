import {
  Auth,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { UserType } from '../types/types';

const auth: Auth = getAuth();

const firebaseAuth = {
  async register(email: string, password: string) {
    await createUserWithEmailAndPassword(auth, email, password);
  },
  async signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  },
  async reset(email: string) {
    await sendPasswordResetEmail(auth, email);
  },
  async signOut() {
    await signOut(auth);
  },
  async onAuthStateChange(callback: (user: UserType | null) => void) {
    return onAuthStateChanged(auth, (user) => {
      callback(user as UserType | null);
    });
  },
};
export default firebaseAuth;
