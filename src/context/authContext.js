import { createContext, useEffect, useState } from 'react';
import Loading from '../components/Loading';
import data from '../utils/firebase';
import firebaseAuth from '../utils/firebaseAuth';

export const AuthContext = createContext({});

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChange(async (user) => {
      if (user) {
        const userData = await data.getUser(user.email);
        setUser(userData);
      } else {
        setUser(null);
      }
    });
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  if (isLoading) {
    return <Loading />;
  }
  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, setIsLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
export default AuthContextProvider;
