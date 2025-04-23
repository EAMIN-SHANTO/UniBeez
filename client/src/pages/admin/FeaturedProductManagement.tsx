import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface FeatureRequest {
  _id: string;
  productId: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    category: string;
    isFeatured?: boolean;
    shop: {
      name: string;
    };
  };
  userId: {
    _id: string;
    username: string;
    email: string;
  };
  startDate: string;
  duration: number;
  durationType: 'days' | 'weeks' | 'months';
  paymentMethod: string;
  transactionId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  endDate?: string;
}

interface FeaturedProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  description?: string;
  isFeatured?: boolean;
  featured?: boolean;
  shop: {
    _id: string;
    name: string;
    owner?: string;
  };
}

const FeaturedProductManagement: React.FC = () => {
  const { API_URL } = useAuth();
  const navigate = useNavigate(); // Add useNavigate hook
  const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [unfeaturedProducts, setUnfeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('featured');
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<FeatureRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'unfeature' | 'feature' | null>(null);
  const [unfeaturing, setUnfeaturing] = useState<boolean>(false);
  const [featuring, setFeaturing] = useState<boolean>(false);
  const [refreshData, setRefreshData] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<FeaturedProduct | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    // Avoid unnecessary API calls by only fetching what's needed based on active tab
    if (activeTab === 'featured') {
      fetchFeaturedProducts();
    } else if (activeTab === 'unfeatured') {
      fetchAllProducts();
    }
    // Always fetch feature requests
    fetchFeatureRequests();
  }, [refreshData, activeTab, API_URL]);

  const fetchFeatureRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Using the correct endpoint path
      const response = await axios.get(`${API_URL}/api/featureproducts/feature-requests`, {
        withCredentials: true
      });
      
      console.log('API Response for feature requests:', response.data);
      
      // Set feature requests even if empty array
      let featureRequests = [];
      
      // Check if the response exists and has data
      if (response.data) {
        if (Array.isArray(response.data)) {
          // If the response is directly an array
          featureRequests = response.data;
        } else if (response.data.featureRequests) {
          // If the response has a featureRequests property
          featureRequests = response.data.featureRequests;
        } else if (response.data.success && response.data.count >= 0) {
          // Alternative structure with success flag
          featureRequests = response.data.featureRequests || [];
        }
        
        // Sort requests by most recent by default
        featureRequests = featureRequests.sort((a: { createdAt: string | number | Date; }, b: { createdAt: string | number | Date; }) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      }
      
      // Always set the state, even if empty
      setFeatureRequests(featureRequests);
    } catch (err: any) {
      console.error("Error fetching feature requests:", err);
      setError(err?.response?.data?.message || 'Failed to load feature requests');
      // Set empty array in case of error
      setFeatureRequests([]);
    } finally {
      // Always reset loading state regardless of success or failure
      setLoading(false);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/productpage`);
      const allProducts = response.data.products || [];
      
      // Filter products that are featured (matching how ProductPage.tsx does it)
      const featured = allProducts.filter(
        (product: FeaturedProduct) => product.isFeatured || product.featured
      );
      
      setFeaturedProducts(featured);
    } catch (err: any) {
      console.error("Error fetching featured products:", err);
      setError(err.response?.data?.message || 'Failed to load featured products');
    }
  };

  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/productpage`);
      const allProducts = response.data.products || [];
      
      // Filter products that are NOT featured
      const unfeatured = allProducts.filter(
        (product: FeaturedProduct) => !(product.isFeatured || product.featured)
      );
      
      setUnfeaturedProducts(unfeatured);
      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching products:", err);
      setError(err.response?.data?.message || 'Failed to load products');
      setLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if ((!selectedRequest && !selectedProduct) || !actionType) return;
    
    try {
      setError(null);
      if (actionType === 'unfeature' && selectedRequest) {
        await handleUnfeature(selectedRequest.productId._id);
      } else if (actionType === 'feature' && selectedProduct) {
        await handleFeature(selectedProduct._id);
      } else if (selectedRequest) {
        const newStatus = actionType === 'approve' ? 'approved' : 'rejected';
        
        await axios.put(
          `${API_URL}/api/featureproducts/request-status/${selectedRequest._id}`, 
          { status: newStatus },
          { withCredentials: true }
        );
      }
      
      // Refresh data after action
      setRefreshData(!refreshData);
      setOpenDialog(false);
      setSelectedRequest(null);
      setSelectedProduct(null);
      setActionType(null);
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${actionType}`);
    }
  };

  const handleUnfeature = async (productId: string) => {
    if (!productId) return;
    setUnfeaturing(true);
    setError(null);
    try {
      await axios.put(
        `${API_URL}/api/featureproducts/unfeature-product/${productId}`,
        {},
        { withCredentials: true }
      );
      
      // Refresh data after unfeaturing
      setRefreshData(!refreshData);
      
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to unfeature product.');
    } finally {
      setUnfeaturing(false);
    }
  };

  const handleFeature = async (productId: string) => {
    if (!productId) return;
    setFeaturing(true);
    setError(null);
    try {
      // Update to match how the feature button works in ProductDetail page
      await axios.post(
        `${API_URL}/api/featureproducts/feature-product/${productId}`,
        {
          startDate: new Date().toISOString(),
          duration: 30, // Default to 30 days
          durationType: 'days',
          paymentMethod: 'admin',
          transactionId: 'admin-feature',
          amount: 0 // Admin-initiated featuring is free
        },
        { withCredentials: true }
      );
      
      // Refresh data after featuring
      setRefreshData(!refreshData);
      
      // Close dialog if open
      setOpenDialog(false);
      setSelectedProduct(null);
      setActionType(null);
      
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to feature product.');
    } finally {
      setFeaturing(false);
    }
  };

  const handleOpenDialog = (request: FeatureRequest | null, product: FeaturedProduct | null, type: 'approve' | 'reject' | 'unfeature' | 'feature') => {
    setSelectedRequest(request);
    setSelectedProduct(product);
    setActionType(type);
    setOpenDialog(true);
  };

  const calculateEndDate = (request: FeatureRequest) => {
    const startDate = new Date(request.startDate);
    let days = request.duration;
    
    if (request.durationType === 'weeks') {
      days *= 7;
    } else if (request.durationType === 'months') {
      days *= 30;
    }
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days);
    
    return endDate.toLocaleDateString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'featured') {
      fetchFeaturedProducts();
    } else if (tab === 'unfeatured') {
      fetchAllProducts();
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filter unfeatured products based on search term
  const filteredUnfeaturedProducts = unfeaturedProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.shop?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Featured Product Management</h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setRefreshData(!refreshData);
                if (activeTab === 'featured') {
                  fetchFeaturedProducts();
                } else if (activeTab === 'unfeatured') {
                  fetchAllProducts();
                }
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Main content - Products section */}
          <div className="md:w-3/5">
            {/* Tab Navigation */}
            <div className="mb-6 border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => handleTabChange('featured')}
                  className={`mr-8 py-4 px-1 ${
                    activeTab === 'featured'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Featured Products ({featuredProducts.length})
                </button>
                <button
                  onClick={() => handleTabChange('unfeatured')}
                  className={`mr-8 py-4 px-1 ${
                    activeTab === 'unfeatured'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Unfeatured Products ({unfeaturedProducts.length})
                </button>
              </nav>
            </div>

            {/* Featured Products List */}
            {activeTab === 'featured' && (
              <div className="space-y-4">
                {featuredProducts.length > 0 ? (
                  featuredProducts.map((product) => (
                    <div key={product._id} className="bg-white rounded-lg shadow overflow-hidden border border-yellow-200 bg-yellow-50">
                      <div className="p-6">
                        <div className="flex items-center">
                          <img
                            className="h-16 w-16 object-cover rounded"
                            src={product.images?.[0] || 'https://via.placeholder.com/140'}
                            alt={product.name}
                          />
                          <div className="ml-4 flex-1">
                            <div className="flex justify-between">
                              <div>
                                <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                                <p className="text-sm text-gray-500">Shop: {product.shop?.name}</p>
                                <p className="text-sm text-gray-600 mt-1">Price: ${product.price?.toFixed(2)}</p>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-1">{product.description}</p>
                                <p className="text-sm text-gray-600 mt-1">Category: {product.category}</p>
                              </div>
                              <div className="text-right">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Featured
                                </span>
                              </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                              <button
                                onClick={() => handleUnfeature(product._id)}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                Unfeature
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <p className="text-gray-500">No active featured products</p>
                  </div>
                )}
              </div>
            )}

            {/* Unfeatured Products List */}
            {activeTab === 'unfeatured' && (
              <div className="space-y-4">
                <div className="mb-4 bg-white p-4 rounded-lg shadow">
                  <input
                    type="text"
                    placeholder="Search products by name, category, shop..."
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {filteredUnfeaturedProducts.length > 0 ? (
                  filteredUnfeaturedProducts.map((product) => (
                    <div key={product._id} className="bg-white rounded-lg shadow overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-center">
                          <img
                            className="h-16 w-16 object-cover rounded"
                            src={product.images?.[0] || 'https://via.placeholder.com/140'}
                            alt={product.name}
                          />
                          <div className="ml-4 flex-1">
                            <div className="flex justify-between">
                              <div>
                                <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                                <p className="text-sm text-gray-500">Shop: {product.shop?.name}</p>
                                <p className="text-sm text-gray-600 mt-1">Price: ${product.price?.toFixed(2)}</p>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-1">{product.description}</p>
                                <p className="text-sm text-gray-600 mt-1">Category: {product.category}</p>
                              </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                              {/* Update button to navigate to feature-product page */}
                              <button
                                onClick={() => navigate(`/feature-product/${product._id}`)}
                                className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 flex items-center"
                              >
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                Feature Product
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <p className="text-gray-500">
                      {searchTerm ? 'No products match your search' : 'No unfeatured products found'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Feature Requests section - Now on the right */}
          <div className="md:w-2/5">
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <h2 className="text-xl font-semibold mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Feature Requests ({featureRequests.length})
              </h2>
            </div>

            <div className="space-y-3">
              {featureRequests.length > 0 ? (
                featureRequests.map((request) => (
                  <div key={request._id} className={`bg-white rounded-lg shadow overflow-hidden ${
                    request.status === 'approved' ? 'border border-green-200' : 
                    request.status === 'rejected' ? 'border border-red-200' : ''
                  }`}>
                    <div className="p-4">
                      <div className="flex items-center">
                        <img
                          className="h-12 w-12 object-cover rounded"
                          src={request.productId.images[0] || 'https://via.placeholder.com/140'}
                          alt={request.productId.name}
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="text-base font-bold text-gray-900">{request.productId.name}</h3>
                              <p className="text-xs text-gray-500">Shop: {request.productId.shop.name}</p>
                            </div>
                            <div className="text-right">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mb-1 ${
                                getStatusBadgeColor(request.status)
                              }`}>
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                              </span>
                              <p className="text-xs font-medium text-gray-900">
                                {request.amount} TK ({request.paymentMethod})
                              </p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <p className="text-xs text-gray-600">
                              Requested by: {request.userId.username}
                            </p>
                            <p className="text-xs text-gray-600">
                              Duration: {request.duration} {request.durationType} (Starts: {formatDate(request.startDate)})
                            </p>
                            <p className="text-xs text-gray-600">
                              Requested on: {formatDate(request.createdAt)}
                            </p>
                            {request.status === 'approved' && (
                              <p className="text-xs text-gray-600">
                                End date: {calculateEndDate(request)}
                              </p>
                            )}
                          </div>
                          <div className="mt-3 flex justify-end space-x-2">
                            {request.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleOpenDialog(request, null, 'reject')}
                                  className="px-2 py-1 text-xs bg-white border border-red-500 text-red-500 rounded hover:bg-red-50"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => handleOpenDialog(request, null, 'approve')}
                                  className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                  Approve
                                </button>
                              </>
                            )}
                            {request.status === 'approved' && (
                              <button
                                onClick={() => handleOpenDialog(request, null, 'unfeature')}
                                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                Unfeature
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <p className="text-gray-500">No feature requests found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Confirmation Dialog */}
        {openDialog && (selectedRequest || selectedProduct) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">
                {actionType === 'approve' 
                  ? 'Approve Feature Request' 
                  : actionType === 'reject' 
                  ? 'Reject Feature Request'
                  : actionType === 'feature'
                  ? 'Feature Product'
                  : 'Unfeature Product'}
              </h2>
              <p className="mb-6">
                {actionType === 'approve'
                  ? 'Are you sure you want to approve this feature request? The product will be featured immediately.'
                  : actionType === 'reject' 
                  ? 'Are you sure you want to reject this feature request?'
                  : actionType === 'feature'
                  ? 'Are you sure you want to feature this product? It will appear in the featured section immediately.'
                  : 'Are you sure you want to remove this product from featured section?'}
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setOpenDialog(false);
                    setSelectedRequest(null);
                    setSelectedProduct(null);
                    setActionType(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAction}
                  className={`px-4 py-2 text-white rounded-md ${
                    actionType === 'approve' || actionType === 'feature'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {actionType === 'approve'
                    ? 'Approve'
                    : actionType === 'reject'
                    ? 'Reject'
                    : actionType === 'feature'
                    ? 'Feature'
                    : 'Unfeature'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedProductManagement;
