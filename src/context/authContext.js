import { createContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../utils/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const AuthContext = createContext({});

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
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
  console.log('usecontext_user', user);
  console.log('isLogin', isLogin);
  console.log(user);

  return (
    <AuthContext.Provider value={{ user, isLogin, setUser, setIsLogin }}>
      {children}
    </AuthContext.Provider>
  );
};
