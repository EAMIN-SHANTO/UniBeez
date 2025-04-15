import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

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

interface Shop {
  _id: string;
  name: string;
  description: string;
  logo: string;
  category: string;
  rating: number;
  reviewCount: number;
  owner: string;
}

const CurrentEvent: React.FC = () => {
  const { API_URL, user } = useAuth();
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [eventShops, setEventShops] = useState<Shop[]>([]);
  const [showMyShops, setShowMyShops] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<string>('');
  const [showShopSelection, setShowShopSelection] = useState(false);
  const [userShops, setUserShops] = useState<Shop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string>('');

  // Update the placeholder URL constant
  const PLACEHOLDER_IMAGE = 'https://cdn-icons-png.flaticon.com/512/166/166169.png';

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
          if (current) {
            fetchEventShops(current._id);
          }
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

  const fetchUserShops = async () => {
    try {
      const response = await fetch(`${API_URL}/api/event-shops/user-shops`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setUserShops(data.shops);
        if (data.shops.length === 0) {
          setRegistrationStatus('You need to create a shop first');
        } else {
          setShowShopSelection(true);
        }
      } else {
        setRegistrationStatus(data.message);
      }
    } catch (err) {
      console.error('Error fetching user shops:', err);
      setRegistrationStatus('Failed to fetch your shops');
    }
  };

  const fetchEventShops = async (eventId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/event-shops/${eventId}/shops`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setEventShops(data.eventShops);
      }
    } catch (err) {
      console.error('Error fetching event shops:', err);
    }
  };

  const handleRegisterShop = async () => {
    if (!currentEvent) return;

    try {
      const response = await fetch(`${API_URL}/api/event-shops/${currentEvent._id}/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ shopId: selectedShopId })
      });

      const data = await response.json();
      
      if (data.success) {
        setRegistrationStatus('success');
        setShowShopSelection(false);
        // Refresh the list of event shops
        fetchEventShops(currentEvent._id);
      } else {
        setRegistrationStatus(data.message);
      }
    } catch (err) {
      console.error('Error registering shop:', err);
      setRegistrationStatus('Failed to register shop');
    }
  };

  const handleRemoveShop = async (shopId: string) => {
    if (!currentEvent || !window.confirm('Are you sure you want to remove this shop from the event?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/event-shops/${currentEvent._id}/shops/${shopId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data.success) {
        setRegistrationStatus('Shop removed successfully');
        // Refresh the list of event shops
        fetchEventShops(currentEvent._id);
      } else {
        setRegistrationStatus(data.message);
      }
    } catch (err) {
      console.error('Error removing shop:', err);
      setRegistrationStatus('Failed to remove shop');
    }
  };

  // Add a function to check if user can remove shop
  const canRemoveShop = (shopOwnerId: string) => {
    if (!user) return false;
    return ['admin', 'staff'].includes(user.role) || user._id === shopOwnerId;
  };

  // Filter shops based on showMyShops state
  const filteredShops = showMyShops && user 
    ? eventShops.filter(shop => shop.owner === user._id)
    : eventShops;

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

        {registrationStatus && (
          <div className={`mb-8 px-4 py-3 rounded-lg ${
            registrationStatus === 'success'
              ? 'bg-green-50 border border-green-200 text-green-600'
              : 'bg-red-50 border border-red-200 text-red-600'
          }`}>
            {registrationStatus === 'success' 
              ? 'Shop registered successfully!'
              : registrationStatus}
          </div>
        )}

        {showShopSelection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Select Shop to Register</h2>
              <div className="space-y-4 mb-6">
                {userShops.map(shop => (
                  <label
                    key={shop._id}
                    className={`block p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedShopId === shop._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="shop"
                      value={shop._id}
                      checked={selectedShopId === shop._id}
                      onChange={(e) => setSelectedShopId(e.target.value)}
                      className="hidden"
                    />
                    <div className="flex items-center space-x-4">
                      <img
                        src={shop.logo}
                        alt={shop.name}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = PLACEHOLDER_IMAGE;
                        }}
                      />
                      <div>
                        <h3 className="font-semibold">{shop.name}</h3>
                        <p className="text-sm text-gray-500">{shop.category}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowShopSelection(false);
                    setSelectedShopId('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegisterShop}
                  disabled={!selectedShopId}
                  className={`px-6 py-2 rounded-lg ${
                    selectedShopId
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Register Shop
                </button>
              </div>
            </div>
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
                  onClick={fetchUserShops}
                >
                  Register Shop in Event
                </button>
                {user && (
                  <button 
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() => setShowMyShops(!showMyShops)}
                  >
                    {showMyShops ? 'Show All Shops' : 'Show My Shops'}
                  </button>
                )}
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

            <div className="mt-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {showMyShops ? 'My Event Shops' : 'Event Shops'}
                </h2>
                {showMyShops && filteredShops.length === 0 && (
                  <p className="text-gray-600">You don't have any shops registered for this event</p>
                )}
              </div>
              {filteredShops.length === 0 && !showMyShops ? (
                <div className="bg-gray-50 p-4 rounded-lg text-gray-600">
                  No shops have registered for this event yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredShops.map(shop => (
                    <div key={shop._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <Link
                        to={`/shops/${shop._id}`}
                        className="block p-4"
                      >
                        <div className="flex items-center space-x-4">
                          <img
                            src={shop.logo}
                            alt={shop.name}
                            className="w-16 h-16 rounded-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = PLACEHOLDER_IMAGE;
                            }}
                          />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{shop.name}</h3>
                            <p className="text-sm text-gray-500">{shop.category}</p>
                          </div>
                        </div>
                        <p className="mt-2 text-gray-600 line-clamp-2">{shop.description}</p>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <span className="flex items-center">
                            {shop.rating.toFixed(1)} ★
                          </span>
                          <span className="mx-2">•</span>
                          <span>{shop.reviewCount} reviews</span>
                        </div>
                      </Link>
                      {canRemoveShop(shop.owner) && (
                        <div className="px-4 pb-4">
                          <button
                            onClick={() => handleRemoveShop(shop._id)}
                            className="w-full px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            Remove from Event
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentEvent; 