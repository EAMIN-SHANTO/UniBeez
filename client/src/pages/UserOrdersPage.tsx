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
  };
  quantity: number;
  price: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled'; // Updated to include cancelled
}

interface Order {
  _id: string;
  orderId: string;
  confirmationId: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
  paymentMethod: string;
}

const UserOrdersPage: React.FC = () => {
  const { API_URL } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchUserOrders();
  }, [API_URL]);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/orders/user-orders`, {
        withCredentials: true
      });
      setOrders(response.data.orders);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch your orders');
      console.error('Error fetching user orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to get the overall status of an order
  const getOrderStatus = (items: OrderItem[]) => {
    if (items.every(item => item.status === 'cancelled')) return 'Cancelled';
    if (items.every(item => item.status === 'delivered')) return 'Delivered';
    if (items.every(item => item.status === 'shipped')) return 'Shipped';
    if (items.some(item => item.status === 'shipped')) return 'Partially Shipped';
    return 'Processing';
  };

  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      case 'Partially Shipped': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if an order can be cancelled
  const canCancel = (items: OrderItem[]) => {
    return items.every(item => item.status === 'processing');
  };

  // Handle order cancellation
  const handleCancelOrder = async (orderId: string) => {
    // Confirm cancellation
    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }
    
    try {
      setCancellingOrderId(orderId);
      const response = await axios.patch(
        `${API_URL}/api/orders/${orderId}/cancel`,
        {},
        { withCredentials: true }
      );
      
      // Update the local state with the cancelled order
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? { ...order, items: order.items.map(item => ({ ...item, status: 'cancelled' as 'cancelled' })) }
            : order
        )
      );
      
      alert('Order cancelled successfully');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel order');
      console.error('Error cancelling order:', err);
    } finally {
      setCancellingOrderId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">My Orders</h1>
          <p className="mt-2 text-gray-600">View and track your order history</p>
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
        ) : orders.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              You haven't placed any orders yet.
            </p>
            <div className="mt-6">
              <Link
                to="/shops"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const orderStatus = getOrderStatus(order.items);
              const badgeColor = getBadgeColor(orderStatus);
              const isOrderCancellable = canCancel(order.items);
              
              return (
                <div key={order._id} className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Order #{order.orderId}
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeColor}`}>
                      {orderStatus}
                    </span>
                  </div>
                  
                  <div className="border-t border-gray-200">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flow-root">
                        <ul className="divide-y divide-gray-200">
                          {order.items.slice(0, 3).map((item) => (
                            <li key={item._id} className="py-4 flex">
                              <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-md overflow-hidden">
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
                              <div className="ml-4 flex-1 flex flex-col">
                                <div>
                                  <div className="flex justify-between text-sm font-medium text-gray-900">
                                    <h4>
                                      <Link to={`/products/${item.product._id}`} className="hover:underline">
                                        {item.product.name}
                                      </Link>
                                    </h4>
                                    <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                                  </div>
                                  <div className="flex justify-between mt-1">
                                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getBadgeColor(item.status)}`}>
                                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                          
                          {order.items.length > 3 && (
                            <li className="py-2 text-sm text-gray-500 text-center">
                              + {order.items.length - 3} more items
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 px-4 py-4 sm:px-6 flex justify-between items-center">
                    <div className="text-base font-medium text-gray-900">
                      Total: ${order.totalAmount.toFixed(2)}
                    </div>
                    <div className="flex items-center space-x-4">
                      {isOrderCancellable && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          disabled={cancellingOrderId === order._id}
                          className="text-sm font-medium text-red-600 hover:text-red-500 disabled:opacity-50"
                        >
                          {cancellingOrderId === order._id ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                      )}
                      <Link
                        to={`/orders/${order._id}`}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        View Order Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOrdersPage;