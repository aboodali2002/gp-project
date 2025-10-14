"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  fullName: string;
  companyName?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: {
    fullName: string;
    email: string;
    password: string;
    companyName?: string;
  }) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      try {
        // TODO: Implement actual session check
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // TODO: Implement actual authentication API call
      // For now, simulate successful login
      const mockUser: User = {
        id: "cmg2ddubs0000wmrxtxtnj3q1",
        email,
        firstName: "John",
        lastName: "Doe",
        companyName: "Demo Company"
      };

      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    fullName: string;
    email: string;
    password: string;
    companyName?: string;
  }): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // TODO: Implement actual registration API call
      // For now, simulate successful registration
      const newUser: User = {
        id: "cmg2ddubs0000wmrxtxtnj3q1",
        email: userData.email,
        fullName: userData.fullName,
        companyName: userData.companyName
      };

      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

