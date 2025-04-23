import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  description?: string;
}

const Wishlist: React.FC = () => {
  const { API_URL, user } = useAuth();
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/wishlist`, {
          withCredentials: true,
        });

        if (response.data.success) {
          setWishlistItems(response.data.wishlist.products || []);
        } else {
          setError('Failed to fetch wishlist');
        }
      } catch (err) {
        setError('Error fetching wishlist. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [API_URL, user, navigate]);

  const removeFromWishlist = async (productId: string) => {
    try {
      const response = await axios.post(`${API_URL}/api/wishlist/${productId}`, {}, {
        withCredentials: true,
      });

      if (response.data.success) {
        // Update local state by removing the product
        setWishlistItems(prev => prev.filter(item => item._id !== productId));
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      setError('Failed to remove item from wishlist');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-b-2 border-indigo-500 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="mt-2 text-gray-600">Products you've saved for later</p>
        </div>

        {error ? (
          <div className="bg-red-100 p-4 rounded-md text-red-700">{error}</div>
        ) : wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No items in wishlist</h3>
            <p className="mt-1 text-sm text-gray-500">Start adding some products to your wishlist!</p>
            <div className="mt-6">
              <Link to="/productpage" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Browse Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {wishlistItems.map((product) => (
              <div key={product._id} className="relative bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
                <Link to={`/products/${product._id}`} className="block">
                  <div className="relative h-48">
                    <img 
                      className="w-full h-full object-cover" 
                      src={product.images?.[0] || 'https://via.placeholder.com/800x400'} 
                      alt={product.name} 
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600 mt-2">${product.price?.toFixed(2)}</p>
                  </div>
                </Link>
                <button 
                  onClick={() => removeFromWishlist(product._id)}
                  className="absolute top-2 right-2 p-2 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 transition"
                  title="Remove from wishlist"
                >
                  <svg 
                    className="w-6 h-6 text-red-500" 
                    fill="currentColor" 
                    viewBox="0 0 20 20" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist; 