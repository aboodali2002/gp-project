"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: { fullName: string; email: string; password: string }) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Load user data from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');
      if (savedUser && savedToken) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Mock login - check localStorage for existing user
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        if (userData.email === email) {
          setUser(userData);
          setIsAuthenticated(true);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: { fullName: string; email: string; password: string }): Promise<boolean> => {
    try {
      // Mock registration - create user object with company name
      const newUser = {
        id: Date.now().toString(),
        fullName: userData.fullName,
        email: userData.email,
        companyName: `${userData.fullName}'s Company`, // Generate company name from user name
        token: 'mock-token-' + Date.now()
      };
      
      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('token', newUser.token);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
