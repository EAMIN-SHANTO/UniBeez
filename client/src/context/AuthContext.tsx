import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/user';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  API_URL: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const API_URL = 'http://localhost:3000';

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking auth at:', `${API_URL}/api/auth/profile`);
        
        // First check if we have a user in localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            console.log('User loaded from localStorage:', parsedUser);
          } catch (e) {
            console.error('Error parsing stored user:', e);
            localStorage.removeItem('user');
          }
        }
        
        // Then try to fetch from the server
        const res = await fetch(`${API_URL}/api/auth/profile`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          mode: 'cors'
        });
        
        if (!res.ok) {
          console.log('Auth check failed with status:', res.status);
          setUser(null);
          localStorage.removeItem('user');
          setLoading(false);
          return;
        }

        const data = await res.json();
        console.log('Auth check response:', data);
        
        if (data.success) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          setUser(null);
          localStorage.removeItem('user');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setUser(null);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [API_URL]);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: username, 
          password 
        }),
        credentials: 'include',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      console.log('Login successful, user data:', data.user);
      
      // Store the user data exactly as received
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'An unknown error occurred' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error('Logout failed with status:', response.status);
      }
      
      setUser(null);
      localStorage.removeItem('user');
    } catch (err) {
      console.error('Logout failed:', err);
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, API_URL }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 