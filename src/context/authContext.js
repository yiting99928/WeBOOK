import { createContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../utils/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const AuthContext = createContext({});

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState({
    email: '',
    name: '',
  });
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('usecontext_user', user);
      if (user) {
        const userDocRef = doc(db, 'users', user.email);
        const userDoc = await getDoc(userDocRef);
        setUser(userDoc.data());
        setIsLogin(true);
      } else {
        setUser(null);
        setIsLogin(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);
  console.log(isLogin);
  return (
    <AuthContext.Provider value={{ user, isLogin, setUser, setIsLogin }}>
      {children}
    </AuthContext.Provider>
  );
};
