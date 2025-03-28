import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { profile, loading, error, fetchProfile } = useProfile();

  useEffect(() => {
    console.log('Profile component mounted, fetching profile...');
    let isMounted = true;
    
    const getProfile = async () => {
      try {
        await fetchProfile();
        if (isMounted) {
          console.log('Profile fetched successfully');
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error in profile fetch effect:', err);
        }
      }
    };
    
    getProfile();
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  console.log('Profile component rendering, profile state:', profile, 'loading:', loading);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Profile not found</p>
          <Link 
            to="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                <img 
                  src={profile.img} 
                  alt={profile.username}
                  className="h-24 w-24 rounded-full object-cover border-4 border-white shadow"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile.username}</h1>
                <p className="text-sm text-gray-500">{profile.email}</p>
                <p className="mt-1 text-xs text-gray-500 bg-gray-100 inline-block px-2 py-1 rounded-full capitalize">
                  {profile.role}
                </p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6 mt-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profile.fullName || 'Not provided'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Student ID</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profile.studentId || 'Not provided'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Department</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profile.department || 'Not provided'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Batch</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profile.batch || 'Not provided'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profile.phone || 'Not provided'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Account Type</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">{profile.type}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">University</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profile.university || 'Not provided'}</dd>
                </div>
              </dl>
            </div>
            
            <div className="mt-8 flex justify-center">
              <Link
                to="/profile/edit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 