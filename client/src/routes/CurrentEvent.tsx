import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface Event {
  _id: string;
  title: string;
  description: string;
  bannerImage: string;
  startDate: string;
  endDate: string;
  location: string;
  status: 'upcoming' | 'current' | 'archived';
  organizer: {
    username: string;
  };
}

const CurrentEvent: React.FC = () => {
  const { API_URL } = useAuth();
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCurrentEvent = async () => {
      try {
        const response = await fetch(`${API_URL}/api/events-21301429`, {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
          const current = data.events.find((event: Event) => event.status === 'current');
          setCurrentEvent(current || null);
        } else {
          setError(data.message);
        }
      } catch (err) {
        console.error('Error fetching current event:', err);
        setError('Failed to fetch current event');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentEvent();
  }, [API_URL]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!currentEvent) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Current Event</h1>
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
            No current event is set.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white shadow-lg overflow-hidden">
          <div className="relative w-full" style={{ height: '500px' }}>
            <img
              src={currentEvent.bannerImage.startsWith('http') 
                ? currentEvent.bannerImage 
                : `${API_URL}${currentEvent.bannerImage}`}
              alt={currentEvent.title}
              className="w-full h-full object-contain bg-gray-50"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://placehold.co/600x400?text=No+Image';
              }}
            />
          </div>

          <div className="p-8 bg-white">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-4xl font-bold text-gray-900">{currentEvent.title}</h1>
              <div className="flex space-x-4">
                <button 
                  className="px-6 py-2 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  onClick={() => {}}
                >
                  Register Event Shop
                </button>
                <button 
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => {}}
                >
                  See Event Shops
                </button>
              </div>
            </div>
            <p className="text-xl text-gray-600 mb-8">{currentEvent.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Start Date</h3>
                <p className="text-gray-700">
                  {new Date(currentEvent.startDate).toLocaleString()}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">End Date</h3>
                <p className="text-gray-700">
                  {new Date(currentEvent.endDate).toLocaleString()}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
                <p className="text-gray-700">{currentEvent.location}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Organizer</h3>
                <p className="text-gray-700">{currentEvent.organizer.username}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentEvent; 