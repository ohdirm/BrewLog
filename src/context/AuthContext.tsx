import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, setCurrentUser } from '../storage';

interface AuthContextType {
  userId: string | null;
  username: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (id: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  userId: null,
  username: null,
  isLoggedIn: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Cek sesi user tersimpan saat aplikasi dibuka
  useEffect(() => {
    const checkSession = async () => {
      const user = await getCurrentUser();
      if (user) {
        setUserId(user.id);
        setUsername(user.username);
      }
      setIsLoading(false);
    };
    checkSession();
  }, []);

  const login = async (id: string, name: string) => {
    setUserId(id);
    setUsername(name);
    await setCurrentUser({ id, username: name });
  };

  const logout = async () => {
    setUserId(null);
    setUsername(null);
    await setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        userId,
        username,
        isLoggedIn: !!userId,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
