import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin' && user.role !== 'staff') {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          You don't have permission to access this page.
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute; 