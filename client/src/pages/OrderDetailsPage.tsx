import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface OrderItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    images: string[];
    price: number;
  };
  shop: {
    _id: string;
    name: string;
  };
  quantity: number;
  price: number;
  status: 'processing' | 'shipped' | 'delivered';
}

interface Order {
  _id: string;
  user: {
    _id: string;
    username: string;
    email: string;
  };
  items: OrderItem[];
  orderId: string;
  confirmationId: string;
  totalAmount: number;
  createdAt: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    email: string;
  };
  paymentMethod: string;
}

const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { API_URL, user } = useAuth();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [statusToUpdate, setStatusToUpdate] = useState<'processing' | 'shipped' | 'delivered'>('shipped');
  const [userOwnedShopIds, setUserOwnedShopIds] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/orders/${id}`, {
          withCredentials: true
        });
        setOrder(response.data.order);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch order details');
        console.error('Error fetching order details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetails();
    }
  }, [id, API_URL]);

  useEffect(() => {
    const fetchUserShops = async () => {
      if (user) {
        try {
          const response = await axios.get(`${API_URL}/api/shops/owned-by-user`, {
            withCredentials: true
          });
          setUserOwnedShopIds(response.data.shops.map((shop: any) => shop._id));
        } catch (err) {
          console.error("Error fetching user shops:", err);
        }
      }
    };
    
    fetchUserShops();
  }, [user, API_URL]);

  // Check if user is order owner
  const isOrderOwner = useMemo(() => {
    if (!user || !order) return false;
    return user._id === order.user._id;
  }, [user, order]);

  // Check if user is a shop owner in this order
  const isShopOwner = useMemo(() => {
    if (!user || !order || userOwnedShopIds.length === 0) return false;
    
    return order.items.some(item => 
      item.shop && userOwnedShopIds.includes(item.shop._id)
    );
  }, [user, order, userOwnedShopIds]);

  // Get items owned by current user (if they're a shop owner)
  const shopOwnerItems = useMemo(() => {
    if (!order || userOwnedShopIds.length === 0) return [];
    
    return order.items.filter(item => 
      item.shop && userOwnedShopIds.includes(item.shop._id)
    );
  }, [order, userOwnedShopIds]);

  const handleItemCheckboxChange = (itemId: string) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleSelectAllItems = () => {
    if (!order) return;
    
    const itemsToSelect = isShopOwner ? shopOwnerItems.map(item => item._id) : [];
    
    if (selectedItems.length === itemsToSelect.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(itemsToSelect);
    }
  };

  const handleStatusUpdate = async () => {
    if (!order || selectedItems.length === 0) return;
    
    try {
      setUpdateLoading(true);
      
      await axios.patch(
        `${API_URL}/api/orders/${order._id}/status`,
        {
          status: statusToUpdate,
          itemIds: selectedItems
        },
        { withCredentials: true }
      );
      
      // Reload order data
      const response = await axios.get(`${API_URL}/api/orders/${id}`, {
        withCredentials: true
      });
      
      setOrder(response.data.order);
      setSelectedItems([]);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update order status');
      console.error('Error updating order status:', err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error || 'Order not found'}</h3>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <button onClick={() => navigate(-1)} className="text-indigo-600 hover:text-indigo-800">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Order header */}
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Order #{order.orderId}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Placed on {new Date(order.createdAt).toLocaleDateString()} | Confirmation: {order.confirmationId}
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back
            </button>
          </div>
          
          {/* Order details */}
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Customer</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {order.user.username} <br />
                  {order.user.email}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {order.paymentMethod === 'card' ? 'Credit/Debit Card' : 
                   order.paymentMethod === 'Bkash' ? 'Bkash' : 
                   order.paymentMethod === 'cash' ? 'Cash on Delivery' : 
                   order.paymentMethod}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Shipping Address</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
                  {order.shippingAddress.address}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                  {order.shippingAddress.country}
                </dd>
              </div>
            </dl>
          </div>
          
          {/* Order items */}
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Order Items
              </h3>
              {isShopOwner && shopOwnerItems.length > 0 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSelectAllItems}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    {selectedItems.length === shopOwnerItems.length ? 'Deselect All' : 'Select All Your Products'}
                  </button>
                </div>
              )}
            </div>
            
            <div className="mt-6 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {isShopOwner && (
                      <th scope="col" className="w-12 px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {isShopOwner ? 'Select' : ''}
                      </th>
                    )}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items.map((item) => {
                    const isOwnedItem = isShopOwner && item.shop && userOwnedShopIds.includes(item.shop._id);
                    
                    return (
                      <tr key={item._id} className={isOwnedItem ? 'bg-blue-50' : ''}>
                        {isShopOwner && (
                          <td className="w-12 px-3 py-4 whitespace-nowrap text-center">
                            {isOwnedItem && (
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(item._id)}
                                onChange={() => handleItemCheckboxChange(item._id)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                            )}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md overflow-hidden">
                              {item.product.images && item.product.images.length > 0 ? (
                                <img
                                  src={item.product.images[0]}
                                  alt={item.product.name}
                                  className="h-full w-full object-center object-cover"
                                />
                              ) : (
                                <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                                  No image
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {item.product.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                Shop: {item.shop?.name || 'Unknown Shop'}
                                {isOwnedItem && <span className="ml-2 text-xs text-blue-600">(Your Product)</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getBadgeColor(item.status)}`}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={isShopOwner ? 4 : 3} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      Total
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          
          {/* Status update section - only visible to shop owners */}
          {isShopOwner && selectedItems.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <label htmlFor="status-select" className="block text-sm font-medium text-gray-700">
                    Update Status for Selected Items:
                  </label>
                  <select
                    id="status-select"
                    value={statusToUpdate}
                    onChange={(e) => setStatusToUpdate(e.target.value as any)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
                <button
                  onClick={handleStatusUpdate}
                  disabled={updateLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {updateLoading ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;