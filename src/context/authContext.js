import { createContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export const AuthContext = createContext({});

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('usecontext_user', user);
      if (user) {
        setUser(user.email);
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
