import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Define interfaces
interface Shop {
  _id: string;
  name: string;
  description: string;
  category: string;
  university: string;
  logo: string;
  rating: number;
  reviewCount: number;
  owner: {
    _id: string;
    username: string;
    email: string;
  };
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
}

const ShopDetail: React.FC = () => {
  const { API_URL, user } = useAuth(); // Add user from AuthContext
  const { id } = useParams<{ id: string }>();
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState<boolean>(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/shops/${id}`); // Fixed API path
        setShop(response.data.shop);
        setError(null);
      } catch (err) {
        setError('Failed to fetch shop details. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchShopDetails();
    }
  }, [id, API_URL]);

  useEffect(() => {
    const fetchShopProducts = async () => {
      if (!shop) return;
      
      try {
        setProductsLoading(true);
        const response = await axios.get(`${API_URL}/api/products?shop=${id}`); // Fixed API path
        setProducts(response.data.products);
        setProductsError(null);
      } catch (err) {
        setProductsError('Failed to fetch shop products.');
        console.error(err);
      } finally {
        setProductsLoading(false);
      }
    };
  
    if (id && !loading && !error) {
      fetchShopProducts();
    }
  }, [id, API_URL, shop, loading, error]);

  const isOwner = user && shop && user._id === shop.owner._id;

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <div className="bg-red-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error || "Shop not found"}</h3>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <Link to="/shops" className="text-indigo-600 hover:text-indigo-800">
              Back to Shops
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Shop Details
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Information about the shop and its services.
              </p>
            </div>
            <Link
              to="/shops"
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Shops
            </Link>
          </div>
          
          <div className="border-t border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex flex-col sm:flex-row">
                <div className="sm:w-1/3 mb-6 sm:mb-0 sm:pr-6">
                  <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
                    <img 
                      src={shop.logo} 
                      alt={shop.name} 
                      className="object-center object-cover w-full h-full"
                    />
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="ml-1 text-sm text-gray-600">
                        {shop.rating.toFixed(1)} ({shop.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="sm:w-2/3">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{shop.name}</h2>
                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {shop.category}
                    </span>
                    {shop.university && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {shop.university}
                      </span>
                    )}
                  </div>
                  
                  <div className="prose prose-sm sm:prose max-w-none text-gray-500 mb-6">
                    <p>{shop.description}</p>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Owner</dt>
                        <dd className="mt-1 text-sm text-gray-900">{shop.owner.username}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Contact</dt>
                        <dd className="mt-1 text-sm text-gray-900">{shop.owner.email}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Established</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {new Date(shop.createdAt).toLocaleDateString()}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Products section - moved inside the main return statement */}
          <div className="mt-8 border-t border-gray-200 pt-8 px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Shop Products</h2>
              {isOwner && (
                <Link
                  to={`/products/create/${shop._id}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Product
                </Link>
              )}
            </div>
            
            {productsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
              </div>
            ) : productsError ? (
              <div className="bg-red-50 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{productsError}</h3>
                  </div>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  This shop doesn't have any products listed yet.
                </p>
                {isOwner && (
                  <div className="mt-6">
                    <Link
                      to={`/products/create/${shop._id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Add Your First Product
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3">
                {products.map((product) => (
                  <Link key={product._id} to={`/products/${product._id}`} className="group">
                    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
                      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
                        <img
                          src={product.images[0] || 'https://placehold.co/300?text=No+Image'}
                          alt={product.name}
                          className="w-full h-48 object-center object-cover group-hover:opacity-75"
                        />
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex-1">
                          <h3 className="text-sm text-gray-700 font-medium">{product.name}</h3>
                          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
                        </div>
                        <div className="mt-3">
                          <div className="flex items-center justify-between">
                            <p className="text-lg font-medium text-gray-900">${product.price.toFixed(2)}</p>
                            <div className="flex items-center">
                              <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="ml-1 text-sm text-gray-500">{product.rating.toFixed(1)}</span>
                            </div>
                          </div>
                          {!product.inStock && (
                            <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Out of stock
                            </span>
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
      </div>
    </div>
  );
};

export default ShopDetail;