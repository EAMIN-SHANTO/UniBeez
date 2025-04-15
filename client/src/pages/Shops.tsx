import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Update the Shop interface to include owner information
interface Shop {
  _id: string;
  name: string;
  description: string;
  category: string;
  logo: string;
  rating: number;
  reviewCount: number;
  university?: string;
  owner: {
    _id: string;
    username: string;
    email: string;
  };
}

const Shops: React.FC = () => {
  const { API_URL, user } = useAuth(); // Get user from context
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [showOnlyMyShops, setShowOnlyMyShops] = useState<boolean>(false); // Add this state
  
  const categories = ['Food', 'Clothing', 'Electronics', 'Books', 'Services', 'Other'];

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/shops`);
        setShops(response.data.shops);
        setError(null);
      } catch (err) {
        setError('Failed to fetch shops. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, [API_URL]);

  // Update the filtering logic to include ownership filtering
  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(filter.toLowerCase()) ||
                         shop.description.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = categoryFilter === '' || shop.category === categoryFilter;
    const matchesOwnership = !showOnlyMyShops || (user && shop.owner && shop.owner._id === user._id);
    return matchesSearch && matchesCategory && matchesOwnership;
  });

  // Add toggle handler
  const toggleMyShops = () => {
    setShowOnlyMyShops(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Title section remains unchanged */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            University Shops
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Discover shops and services run by students and campus partners
          </p>
        </div>

        {/* Update the filter section to include the ownership toggle */}
        <div className="mb-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search shops..."
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-64">
            <select
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          {user && (
            <div className="flex items-center mr-4">
              <button
                onClick={toggleMyShops}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  showOnlyMyShops 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                {showOnlyMyShops ? 'My Shops' : 'All Shops'}
              </button>
            </div>
          )}
          <div>
            <Link
              to="/shops/create"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Shop
            </Link>
          </div>
        </div>

        {/* Rest of your component remains the same */}
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">
              {showOnlyMyShops 
                ? "You don't have any shops yet. Create one to get started!"
                : "No shops found. Try adjusting your filters."}
            </p>
            {showOnlyMyShops && (
              <div className="mt-4">
                <Link
                  to="/shops/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create Your First Shop
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredShops.map((shop) => (
              <Link 
                key={shop._id} 
                to={`/shops/${shop._id}`}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300"
              >
                <div className="p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-16 w-16 rounded-full overflow-hidden">
                      <img 
                        className="h-full w-full object-cover" 
                        src={shop.logo} 
                        alt={shop.name} 
                      />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{shop.name}</h3>
                      <p className="text-sm text-gray-500">{shop.category}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-gray-600 line-clamp-2">{shop.description}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="ml-1 text-sm text-gray-600">
                        {shop.rating} ({shop.reviewCount} reviews)
                      </span>
                    </div>
                    <div className="flex items-center">
                      {user && shop.owner && user._id === shop.owner._id && (
                        <span className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-1 mr-2">
                          Your Shop
                        </span>
                      )}
                      {shop.university && (
                        <span className="text-xs text-gray-500">{shop.university}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shops;