import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';
import UniversityUpdateTest from '../components/UniversityUpdateTest';

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
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-16 relative">
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
                <img 
                  src={profile.img || "https://cdn-icons-png.flaticon.com/512/4908/4908415.png"} 
                  alt={profile.username} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          
          {/* Profile Content */}
          <div className="pt-20 pb-8 px-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {profile.fullName || profile.username}
              </h1>
              <p className="text-gray-500">@{profile.username}</p>
              <p className="text-gray-500">{profile.email}</p>
              
              <div className="mt-4 flex justify-center space-x-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {profile.role}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  {profile.type}
                </span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
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

            <div className="mt-4">
              <UniversityUpdateTest />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 