import React, { createContext, useEffect, useState } from 'react';
import Loading from '../components/Loading';
import { UserType } from '../types/types';
import data from '../utils/firebase';
import firebaseAuth from '../utils/firebaseAuth';

type AuthContextType = {
  user: UserType;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  setUser: () => {},
  setIsLoading: () => {},
});

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<UserType>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    firebaseAuth.onAuthStateChange(async (user: UserType) => {
      if (user) {
        const userData = await data.getUser(user.email);
        userData && setUser(userData as UserType);
      } else {
        setUser(null);
      }
    });
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => {
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
