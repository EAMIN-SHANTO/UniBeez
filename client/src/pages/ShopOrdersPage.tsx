import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  quantity: number;
  price: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled'; // Add cancelled status
  shop: {
    _id: string;
    name: string;
  };
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

const ShopOrdersPage: React.FC = () => {
  const { API_URL } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [userOwnedShopIds, setUserOwnedShopIds] = useState<string[]>([]);

  useEffect(() => {
    // Fetch the user's shops first
    const fetchUserShops = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/shops/owned-by-user`, {
          withCredentials: true
        });
        
        if (response.data.success) {
          setUserOwnedShopIds(response.data.shops.map((shop: any) => shop._id));
        }
      } catch (err) {
        console.error('Error fetching user shops:', err);
      }
    };

    fetchUserShops();
  }, [API_URL]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/orders/shop-orders`, {
          withCredentials: true
        });
        setOrders(response.data.orders);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch orders');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userOwnedShopIds.length > 0) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [API_URL, userOwnedShopIds]);

  // Filter orders to only include items from shops owned by the user
  const filteredOrders = orders.map(order => {
    // Create a new order object with only the items from owned shops
    const filteredItems = order.items.filter(item => {
      // Handle both string and object IDs by converting to string for comparison
      const shopId = item.shop && (typeof item.shop === 'object' ? item.shop._id : item.shop);
      return shopId && userOwnedShopIds.includes(shopId.toString());
    });
    
    return {
      ...order,
      items: filteredItems
    };
  }).filter(order => {
    // Remove orders that don't have any items from owned shops
    if (order.items.length === 0) return false;
    
    // Apply status filter if set
    if (statusFilter !== 'all') {
      return order.items.some(item => item.status === statusFilter);
    }
    
    return true;
  });

  // Function to get the most common status among order items
  const getOverallOrderStatus = (items: OrderItem[]) => {
    if (items.every(item => item.status === 'delivered')) return 'Delivered';
    if (items.every(item => item.status === 'shipped')) return 'Shipped';
    if (items.some(item => item.status === 'shipped')) return 'Partially Shipped';
    return 'Processing';
  };

  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'Delivered': 
      case 'delivered': 
        return 'bg-green-100 text-green-800';
      case 'Shipped': 
      case 'shipped': 
        return 'bg-blue-100 text-blue-800';
      case 'Partially Shipped': 
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Update status of an item directly from the list
  const handleUpdateStatus = async (orderId: string, itemId: string, newStatus: string) => {
    try {
      await axios.patch(
        `${API_URL}/api/orders/${orderId}/status`,
        {
          status: newStatus,
          itemIds: [itemId]
        },
        { withCredentials: true }
      );
      
      // Update the local state to reflect the change
      setOrders(prevOrders => 
        prevOrders.map(order => {
          if (order._id === orderId) {
            return {
              ...order,
              items: order.items.map(item => {
                if (item._id === itemId) {
                  return { ...item, status: newStatus as 'processing' | 'shipped' | 'delivered' | 'cancelled' };
                }
                return item;
              })
            };
          }
          return order;
        })
      );
    } catch (err: any) {
      console.error('Error updating status:', err);
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Shop Orders</h1>
          <p className="mt-2 text-gray-600">Manage orders for your shop products</p>
        </div>
        
        {/* Filter controls */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {filteredOrders.length} orders found
          </div>
          <div className="flex items-center">
            <label htmlFor="status-filter" className="mr-2 text-sm font-medium text-gray-700">
              Status:
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            >
              <option value="all">All</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>

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
        ) : userOwnedShopIds.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No shops found</h3>
            <p className="mt-1 text-sm text-gray-500">
              You need to create a shop before you can manage orders.
            </p>
            <div className="mt-6">
              <Link
                to="/shops/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Shop
              </Link>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {statusFilter === 'all' ? 'You don\'t have any orders yet.' : `No orders with status "${statusFilter}" found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Order #{order.orderId}
                    </h3>
                    <div className="mt-1 text-sm text-gray-500 flex flex-col sm:flex-row sm:gap-4">
                      <span>Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
                      <span>By: {order.user.username} ({order.user.email})</span>
                    </div>
                  </div>
                  <Link
                    to={`/orders/${order._id}`}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    View Full Details
                  </Link>
                </div>
                
                <div className="border-t border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200 table-fixed">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                          Product
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                          Quantity
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">
                          Price
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {order.items.map((item) => (
                        <tr key={item._id}>
                          <td className="px-6 py-4">
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
                              <div className="ml-4 flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                  <Link to={`/products/${item.product._id}`} className="hover:underline" title={item.product.name}>
                                    {item.product.name}
                                  </Link>
                                </div>
                                <div className="text-sm text-gray-500 truncate">
                                  Shop: {item.shop?.name || 'Unknown Shop'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            ${(item.price * item.quantity).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getBadgeColor(item.status)}`}>
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <select
                              value={item.status}
                              onChange={(e) => handleUpdateStatus(order._id, item._id, e.target.value)}
                              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                              disabled={item.status === 'cancelled'} // Disable dropdown for cancelled items
                            >
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              {item.status === 'cancelled' && <option value="cancelled">Cancelled</option>}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="border-t border-gray-200 px-4 py-4 sm:px-6 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Shipping Address: {order.shippingAddress.firstName} {order.shippingAddress.lastName}, {order.shippingAddress.address}, {order.shippingAddress.city}
                  </div>
                  <div className="text-base font-medium text-gray-900">
                    Payment: {order.paymentMethod}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopOrdersPage;