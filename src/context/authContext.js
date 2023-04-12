import { createContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export const AuthContext = createContext({});

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const data = {
          name: user.name || '',
          email: user.email || '',
        };
        setUser(data);
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

  return (
    <AuthContext.Provider value={{ user, isLogin, setUser, setIsLogin }}>
      {children}
    </AuthContext.Provider>
  );
};
