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
  featured?: boolean; // Add featured property
}

const ProductPage: React.FC = () => {
  const { API_URL, user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [shopId, setShopId] = useState<string | null>(null);
  const [shopLoading, setShopLoading] = useState<boolean>(true);

  const categories = ['Featured', 'Trending', 'New Arrivals', 'Deals', 'Collections'];

  useEffect(() => {
    const fetchShopId = async () => {
      try {
        setShopLoading(true);
        if (user) {
          console.log('Fetching shop ID for user:', user.id); // Debugging log
          const response = await axios.get(`${API_URL}/api/shops/user/${user.id}`, {
            withCredentials: true,
          });
          console.log('API Response:', response.data); // Debugging log
          if (!response.data.shopId) {
            console.warn('No shop found for this user.'); // Debugging log
            throw new Error('Shop not found');
          }
          setShopId(response.data.shopId);
          setError(null);
        } else {
          console.warn('User is not logged in.'); // Debugging log
          setShopId(null);
        }
      } catch (err) {
        console.error('Error fetching shop ID:', (err as Error).message || err);
        setError((err as any).response?.data?.message || 'Failed to fetch shop information.');
        setShopId(null);
      } finally {
        setShopLoading(false);
      }
    };

    fetchShopId();
  }, [API_URL, user]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/productpage`);
        setProducts(response.data.products);
        setError(null);
      } catch (err) {
        setError('Failed to fetch products. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [API_URL]);

  // Show only featured products in the featured section
  const featuredProducts = products.filter(
    (product: any) => product.isFeatured || product.featured
  );
  const nonFeaturedProducts = products.filter(
    (product: any) => !(product.isFeatured || product.featured)
  );
  const filteredProducts = nonFeaturedProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = categoryFilter === '' || product.description?.toLowerCase().includes(categoryFilter.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products..."
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
          {shopLoading ? (
            <div className="text-gray-500">Loading shop information...</div>
          ) : shopId ? (
            <div>
              <Link
                to="/products/create"
                state={{ shopId }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Product
              </Link>
            </div>
          ) : !user ? (
            <div>
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Login to Add Products
              </Link>
            </div>
          ) : (
            <div>
              <Link
                to="/shops/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Your Own Shop
              </Link>
            </div>
          )}
        </div>

        {featuredProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">Featured Products</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map((product) => (
                <Link 
                  key={product._id} 
                  to={`/products/${product._id}`}
                  className="bg-yellow-50 border-2 border-yellow-300 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300"
                >
                  <div className="relative h-48">
                    <img 
                      className="w-full h-full object-cover" 
                      src={product.images[0] || 'https://via.placeholder.com/800x400'} 
                      alt={product.name} 
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600 mt-2">${product.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All Products Text */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-gray-700">All Products</h2>
        </div>

        {/* Browse All Products Description */}
        <div className="text-center mb-16">
          <p className="text-2xl text-gray-500 max-w-2xl mx-auto">
            Browse all products available in the marketplace
          </p>
        </div>

       

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin h-10 w-10 border-b-2 border-indigo-500 rounded-full" />
          </div>
        ) : error ? (
          <div className="bg-red-100 p-4 rounded-md text-red-700">{error}</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center text-gray-500">No products found.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product: any) => (
              <div key={product._id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300 flex flex-col">
                <Link 
                  to={`/products/${product._id}`}
                  className="flex-1"
                >
                  <div className="relative h-48">
                    <img 
                      className="w-full h-full object-cover" 
                      src={product.images[0] || 'https://via.placeholder.com/800x400'} 
                      alt={product.name} 
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600 mt-2">${product.price.toFixed(2)}</p>
                  </div>
                </Link>
                {/* Only show Feature Product button if user owns the product's shop */}
                {user && product.shop && (
                  (user._id === (product.shop.owner?._id || product.shop.owner)) && (
                    <div className="p-4 pt-0">
                      <button
                        className="flex items-center gap-2 py-2 px-4 rounded bg-amber-500 text-white font-semibold hover:bg-amber-600 transition"
                        onClick={() => navigate(`/feature-product/${product._id}`)}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                          />
                        </svg>
                        Feature
                      </button>
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;