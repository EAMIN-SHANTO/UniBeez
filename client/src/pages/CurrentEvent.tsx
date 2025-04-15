import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaUserAlt, FaStar, FaComments, FaStore, FaEye, FaTrashAlt, FaPlus, FaExclamationCircle } from 'react-icons/fa';
import { MdStorefront } from 'react-icons/md';
import { BiTime } from 'react-icons/bi';

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
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
        // Filter out shops that are already registered in the event
        const availableShops = data.shops.filter(
          (shop: Shop) => !eventShops.some(eventShop => eventShop._id === shop._id)
        );

        if (availableShops.length === 0) {
          setErrorMessage('All your shops are already registered in this event!');
          setShowErrorPopup(true);
          return;
        }

        setUserShops(availableShops);
        setShowShopSelection(true);
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

    // Check if shop is already registered
    if (eventShops.some(shop => shop._id === selectedShopId)) {
      setErrorMessage('This shop is already registered in the event!');
      setShowErrorPopup(true);
      return;
    }

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
      <div className="min-h-screen pt-20 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600" />
      </div>
    );
  }

  if (!currentEvent) {
    return (
      <div className="min-h-screen pt-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <MdStorefront className="text-blue-600" />
            Current Event
          </h1>
          <div className="bg-white/80 backdrop-blur-sm border border-yellow-200 text-yellow-800 px-6 py-4 rounded-xl shadow-sm">
            No current event is set.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 pb-12 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4">
        {error && (
          <div className="mb-8 bg-white/80 backdrop-blur-sm border border-red-200 text-red-600 px-6 py-4 rounded-xl shadow-sm">
            {error}
          </div>
        )}

        {registrationStatus && (
          <div className={`mb-8 px-6 py-4 rounded-xl shadow-sm backdrop-blur-sm ${
            registrationStatus === 'success'
              ? 'bg-white/80 border border-green-200 text-green-600'
              : 'bg-white/80 border border-red-200 text-red-600'
          }`}>
            {registrationStatus === 'success' 
              ? 'Shop registered successfully!'
              : registrationStatus}
          </div>
        )}

        {showErrorPopup && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <FaExclamationCircle className="text-3xl text-red-500" />
                <h2 className="text-2xl font-bold text-gray-900">Registration Error</h2>
              </div>
              <p className="text-gray-600 mb-8">{errorMessage}</p>
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowErrorPopup(false);
                    setErrorMessage('');
                    setShowShopSelection(false);
                  }}
                  className="px-6 py-2.5 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {showShopSelection && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                <FaStore className="text-blue-600" />
                Select Shop to Register
              </h2>
              <div className="space-y-4 mb-8">
                {userShops.map(shop => (
                  <label
                    key={shop._id}
                    className={`block p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                      selectedShopId === shop._id
                        ? 'border-blue-500 bg-blue-50/50'
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
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-offset-2 ring-gray-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = PLACEHOLDER_IMAGE;
                        }}
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{shop.name}</h3>
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
                  className="px-6 py-2.5 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegisterShop}
                  disabled={!selectedShopId}
                  className={`px-6 py-2.5 rounded-xl transition-all duration-200 ${
                    selectedShopId
                      ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Register Shop
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden">
          <div className="relative w-full bg-gradient-to-b from-black/50 to-transparent" style={{ height: '500px' }}>
            <img
              src={currentEvent.bannerImage.startsWith('http') 
                ? currentEvent.bannerImage 
                : `${API_URL}${currentEvent.bannerImage}`}
              alt={currentEvent.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://placehold.co/600x400?text=No+Image';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h1 className="text-5xl font-bold mb-4">{currentEvent.title}</h1>
              <p className="text-xl text-gray-200">{currentEvent.description}</p>
            </div>
          </div>

          <div className="p-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
              <div className="flex space-x-4">
                <button 
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 hover:scale-[1.02] shadow-sm flex items-center gap-2"
                  onClick={fetchUserShops}
                >
                  <FaPlus />
                  Register Shop in Event
                </button>
                {user && (
                  <button 
                    className="px-6 py-2.5 bg-white text-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200 hover:scale-[1.02] shadow-sm flex items-center gap-2"
                    onClick={() => setShowMyShops(!showMyShops)}
                  >
                    <FaEye />
                    {showMyShops ? 'Show All Shops' : 'Show My Shops'}
                  </button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FaCalendarAlt className="text-blue-600" />
                  Start Date
                </h3>
                <p className="text-gray-700 flex items-center gap-2">
                  <BiTime className="text-gray-400" />
                  {new Date(currentEvent.startDate).toLocaleString()}
                </p>
              </div>
              
              <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FaCalendarAlt className="text-blue-600" />
                  End Date
                </h3>
                <p className="text-gray-700 flex items-center gap-2">
                  <BiTime className="text-gray-400" />
                  {new Date(currentEvent.endDate).toLocaleString()}
                </p>
              </div>
              
              <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-blue-600" />
                  Location
                </h3>
                <p className="text-gray-700">{currentEvent.location}</p>
              </div>
              
              <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FaUserAlt className="text-blue-600" />
                  Organizer
                </h3>
                <p className="text-gray-700">{currentEvent.organizer.username}</p>
              </div>
            </div>

            <div className="mt-12">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <FaStore className="text-blue-600" />
                  {showMyShops ? 'My Event Shops' : 'Event Shops'}
                </h2>
                {showMyShops && filteredShops.length === 0 && (
                  <p className="text-gray-600">You don't have any shops registered for this event</p>
                )}
              </div>
              {filteredShops.length === 0 && !showMyShops ? (
                <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl text-gray-600 shadow-sm">
                  No shops have registered for this event yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredShops.map(shop => (
                    <div key={shop._id} className="group bg-white/50 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.02] flex flex-col">
                      <Link
                        to={`/shops/${shop._id}`}
                        className="block p-6 flex-1"
                      >
                        <div className="flex items-center space-x-4">
                          <img
                            src={shop.logo}
                            alt={shop.name}
                            className="w-16 h-16 rounded-full object-cover ring-2 ring-offset-2 ring-gray-200 group-hover:ring-blue-400 transition-all duration-200"
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
                        <p className="mt-4 text-gray-600 line-clamp-2">{shop.description}</p>
                        <div className="mt-4 flex items-center text-sm text-gray-500">
                          <span className="flex items-center gap-1 text-yellow-500">
                            <FaStar />
                            {shop.rating.toFixed(1)}
                          </span>
                          <span className="mx-2">•</span>
                          <span className="flex items-center gap-1">
                            <FaComments className="text-gray-400" />
                            {shop.reviewCount} reviews
                          </span>
                        </div>
                      </Link>
                      {canRemoveShop(shop.owner) && (
                        <div className="p-6 pt-0">
                          <button
                            onClick={() => handleRemoveShop(shop._id)}
                            className="w-full px-4 py-2.5 text-red-600 border-2 border-red-600 rounded-xl hover:bg-red-50 transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2"
                          >
                            <FaTrashAlt />
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