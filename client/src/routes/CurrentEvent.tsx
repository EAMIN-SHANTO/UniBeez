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
        const response = await fetch(`${API_URL}/api/events`, {
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
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Current Event</h1>
        
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <img
            src={currentEvent.bannerImage.startsWith('http') 
              ? currentEvent.bannerImage 
              : `${API_URL}${currentEvent.bannerImage}`}
            alt={currentEvent.title}
            className="w-full h-96 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://placehold.co/600x400?text=No+Image';
            }}
          />
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentEvent.title}</h2>
            <p className="text-gray-600 mb-6">{currentEvent.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <span className="font-medium text-gray-700">Start Date:</span>
                <br />
                {new Date(currentEvent.startDate).toLocaleString()}
              </div>
              <div>
                <span className="font-medium text-gray-700">End Date:</span>
                <br />
                {new Date(currentEvent.endDate).toLocaleString()}
              </div>
              <div>
                <span className="font-medium text-gray-700">Location:</span>
                <br />
                {currentEvent.location}
              </div>
              <div>
                <span className="font-medium text-gray-700">Organizer:</span>
                <br />
                {currentEvent.organizer.username}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentEvent; 