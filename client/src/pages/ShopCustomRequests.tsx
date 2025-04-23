import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface CustomRequest {
  _id: string;
  description: string;
  quantity: number;
  specialInstructions: string;
  status: 'pending' | 'accepted' | 'rejected';
  price: number;
  shopOwnerNotes: string;
  createdAt: string;
  user: {
    _id: string;
    username: string;
    email: string;
  };
}

interface Shop {
  _id: string;
  name: string;
  logo: string;
  owner: string | { _id: string };
}

const ShopCustomRequests: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const { API_URL, user } = useAuth();
  
  const [shop, setShop] = useState<Shop | null>(null);
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeRequest, setActiveRequest] = useState<string | null>(null);
  const [price, setPrice] = useState<string>('');
  const [shopOwnerNotes, setShopOwnerNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  
  // Filter states
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  
  // Compute filtered requests based on status
  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/login');
      return;
    }
    
    const fetchShopDetails = async () => {
      try {
        setLoading(true);
        const shopResponse = await axios.get(`${API_URL}/api/shops/${shopId}`, {
          withCredentials: true
        });
        
        // Handle different owner types (string ID or object)
        const ownerId = typeof shopResponse.data.shop.owner === 'object' 
          ? shopResponse.data.shop.owner._id 
          : shopResponse.data.shop.owner;
          
        if (ownerId.toString() !== user?._id.toString()) {
          setError("You don't have permission to view this shop's requests");
          setLoading(false);
          return;
        }
        
        setShop(shopResponse.data.shop);
        
        // Fetch custom product requests for this shop
        const requestsResponse = await axios.get(`${API_URL}/api/custom-product-requests/shop/${shopId}`, {
          withCredentials: true
        });
        
        setRequests(requestsResponse.data.requests);
        setError(null);
      } catch (err) {
        console.error('Error fetching shop details or requests:', err);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    
    if (shopId) {
      fetchShopDetails();
    }
  }, [shopId, API_URL, user, navigate]);

  const handleAccept = async (requestId: string) => {
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      alert('Please enter a valid price');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const response = await axios.patch(
        `${API_URL}/api/custom-product-requests/${requestId}/accept`,
        {
          price: parseFloat(price),
          shopOwnerNotes
        },
        {
          withCredentials: true
        }
      );
      
      // Update request in local state
      setRequests(prev => 
        prev.map(req => 
          req._id === requestId ? response.data.request : req
        )
      );
      
      // Reset action state
      setActiveRequest(null);
      setPrice('');
      setShopOwnerNotes('');
      
    } catch (err) {
      console.error('Error accepting request:', err);
      alert('Failed to accept request');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleReject = async (requestId: string) => {
    try {
      setSubmitting(true);
      
      const response = await axios.patch(
        `${API_URL}/api/custom-product-requests/${requestId}/reject`,
        {
          shopOwnerNotes
        },
        {
          withCredentials: true
        }
      );
      
      // Update request in local state
      setRequests(prev => 
        prev.map(req => 
          req._id === requestId ? response.data.request : req
        )
      );
      
      // Reset action state
      setActiveRequest(null);
      setShopOwnerNotes('');
      
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert('Failed to reject request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto bg-white shadow-sm rounded-lg p-6">
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
          <div className="mt-4 text-center">
            <button 
              onClick={() => navigate(-1)} 
              className="text-indigo-600 hover:text-indigo-800"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Custom Product Requests</h2>
          <p className="mt-2 text-gray-600">
            Manage custom product requests for your shop
          </p>
          
          <div className="mt-4 flex space-x-2 items-center">
            <button 
              onClick={() => setFilter('all')} 
              className={`px-4 py-2 rounded-md ${filter === 'all' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('pending')} 
              className={`px-4 py-2 rounded-md ${filter === 'pending' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300'}`}
            >
              Pending
            </button>
            <button 
              onClick={() => setFilter('accepted')} 
              className={`px-4 py-2 rounded-md ${filter === 'accepted' 
                ? 'bg-green-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300'}`}
            >
              Accepted
            </button>
            <button 
              onClick={() => setFilter('rejected')} 
              className={`px-4 py-2 rounded-md ${filter === 'rejected' 
                ? 'bg-red-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300'}`}
            >
              Rejected
            </button>
          </div>
        </div>
        
        {filteredRequests.length === 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'No custom product requests found' 
                : `No ${filter} requests found`}
            </p>
          </div>
        ) : (
          <ul className="bg-white shadow overflow-hidden sm:rounded-md">
            {filteredRequests.map(request => (
              <li 
                key={request._id} 
                className={`border-b border-gray-200 last:border-b-0 ${activeRequest === request._id ? 'bg-gray-50' : ''}`}
              >
                <div className="px-4 py-5 sm:px-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      Request from {request.user.username}
                    </h3>
                    <div className="flex items-center">
                      {request.status === 'pending' && (
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                      {request.status === 'accepted' && (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          Accepted
                        </span>
                      )}
                      {request.status === 'rejected' && (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                          Rejected
                        </span>
                      )}
                      <span className="ml-3 text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-900">
                    <div className="font-medium mb-2">Product Description:</div>
                    <p className="whitespace-pre-wrap">
                      {request.description}
                    </p>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500">
                        Quantity:
                      </div>
                      <div className="mt-1 text-sm text-gray-900">
                        {request.quantity}
                      </div>
                    </div>
                    
                    {request.specialInstructions && (
                      <div>
                        <div className="text-sm font-medium text-gray-500">
                          Special Instructions:
                        </div>
                        <div className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                          {request.specialInstructions}
                        </div>
                      </div>
                    )}
                    
                    {request.status !== 'pending' && (
                      <>
                        {request.status === 'accepted' && (
                          <div>
                            <div className="text-sm font-medium text-gray-500">
                              Price Quoted:
                            </div>
                            <div className="mt-1 text-sm text-gray-900">
                              ${request.price.toFixed(2)}
                            </div>
                          </div>
                        )}
                        
                        {request.shopOwnerNotes && (
                          <div>
                            <div className="text-sm font-medium text-gray-500">
                              Your Notes:
                            </div>
                            <div className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                              {request.shopOwnerNotes}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  {request.status === 'pending' && (
                    <>
                      {activeRequest === request._id ? (
                        <div className="mt-4 border-t border-gray-200 pt-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                Price *
                              </label>
                              <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <span className="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input
                                  type="number"
                                  id="price"
                                  name="price"
                                  value={price}
                                  onChange={(e) => setPrice(e.target.value)}
                                  step="0.01"
                                  min="0.01"
                                  placeholder="Enter price"
                                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label htmlFor="shopOwnerNotes" className="block text-sm font-medium text-gray-700 mb-1">
                                Notes (Optional)
                              </label>
                              <textarea
                                id="shopOwnerNotes"
                                name="shopOwnerNotes"
                                value={shopOwnerNotes}
                                onChange={(e) => setShopOwnerNotes(e.target.value)}
                                rows={3}
                                placeholder="Add any notes or special instructions"
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                          </div>
                          
                          <div className="flex space-x-3 mt-4">
                            <button
                              type="button"
                              onClick={() => handleAccept(request._id)}
                              disabled={submitting}
                              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                              {submitting ? 'Processing...' : 'Accept & Set Price'}
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => handleReject(request._id)}
                              disabled={submitting}
                              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                              {submitting ? 'Processing...' : 'Reject Request'}
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => {
                                setActiveRequest(null);
                                setPrice('');
                                setShopOwnerNotes('');
                              }}
                              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={() => setActiveRequest(request._id)}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Respond to Request
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        
        <div className="mt-4">
          <button
            onClick={() => navigate(`/shops/${shopId}`)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Shop
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopCustomRequests;