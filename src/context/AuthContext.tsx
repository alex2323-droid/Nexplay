import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (email: string) => Promise<User>;
  register: (name: string, email: string, phone?: string) => Promise<User>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  login: async () => ({} as User),
  register: async () => ({} as User),
  logout: () => {},
  loading: true
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('nexplay_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('nexplay_user');
      }
    } else {
      // Default initial gamer user for easy testing
      const defaultUser: User = {
        id: 'user-gamer-1',
        name: 'Carlos Gamer',
        email: 'carlos@gmail.com',
        role: 'USER',
        phone: '+52 55 9876 5432',
        createdAt: new Date().toISOString(),
        savedPlayerIds: {
          'blood-strike': '987654321',
          'free-fire': '876543210'
        }
      };
      setUser(defaultUser);
      localStorage.setItem('nexplay_user', JSON.stringify(defaultUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string) => {
    const loggedUser = await api.login(email);
    setUser(loggedUser);
    localStorage.setItem('nexplay_user', JSON.stringify(loggedUser));
    return loggedUser;
  };

  const register = async (name: string, email: string, phone?: string) => {
    const regUser = await api.register(name, email, phone);
    setUser(regUser);
    localStorage.setItem('nexplay_user', JSON.stringify(regUser));
    return regUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nexplay_user');
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
