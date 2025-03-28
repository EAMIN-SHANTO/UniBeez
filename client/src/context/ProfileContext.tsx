import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { User } from '../types/user';

type UserProfile = User;

interface ProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, API_URL } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setProfile(data.user);
      } else {
        setError(data.message || 'Failed to fetch profile');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('An error occurred while fetching your profile');
    } finally {
      setLoading(false);
    }
  }, [user, API_URL]);

  const updateProfile = useCallback(async (updateData: Partial<UserProfile>): Promise<boolean> => {
    if (!user) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(updateData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setProfile(prev => prev ? { ...prev, ...data.user } : data.user);
        return true;
      } else {
        setError(data.message || 'Failed to update profile');
        return false;
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('An error occurred while updating your profile');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, API_URL]);

  return (
    <ProfileContext.Provider value={{ profile, loading, error, fetchProfile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}; 