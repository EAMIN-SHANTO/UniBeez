import React from 'react';
import { useAuth } from '../../context/AuthContext';

const EventManagement: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Add New Event
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <p className="text-gray-500">Event management interface coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventManagement; 