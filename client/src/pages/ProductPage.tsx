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
          console.log('Fetching shop ID for user:', user._id); // Debugging log
          const response = await axios.get(`${API_URL}/api/shops/user/${user._id}`, {
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
        const response = await axios.get(`${API_URL}/api/products/1584`);
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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = categoryFilter === '' || product.description?.toLowerCase().includes(categoryFilter.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            All Products
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Browse all products available in the marketplace
          </p>
        </div>

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
            {filteredProducts.map((product) => (
              <Link 
                key={product._id} 
                to={`/products/${product._id}`}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300"
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
        )}
      </div>
    </div>
  );
};

export default ProductPage;