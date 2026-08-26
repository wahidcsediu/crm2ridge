import React, { createContext, useContext, useState } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getStoredUser = (): User | null => {
  try {
    const storedUser = localStorage.getItem('ridge_park_user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (e) {
    console.error("Failed to parse user session");
    localStorage.removeItem('ridge_park_user');
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Synchronous initialization prevents layout flash on refresh
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [isLoading] = useState<boolean>(false);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('ridge_park_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ridge_park_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
