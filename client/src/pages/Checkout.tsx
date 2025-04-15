import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Checkout: React.FC = () => {
  const { cart, loading, error, checkout } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orderProcessing, setOrderProcessing] = useState<boolean>(false);
  const [orderComplete, setOrderComplete] = useState<boolean>(false);
  const [orderId, setOrderId] = useState<string>('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    email: user?.email || '',
    paymentMethod: 'card'
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.firstName || !formData.lastName || !formData.address || 
        !formData.city || !formData.postalCode || !formData.country || !formData.email) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      setOrderProcessing(true);
      
      const shippingAddress = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country,
        email: formData.email
      };
      
      const result = await checkout(shippingAddress, formData.paymentMethod);
      
      setOrderId(result.orderId);
      setOrderComplete(true);
    } catch (err) {
      console.error('Checkout failed:', err);
      alert('Checkout failed. Please try again.');
    } finally {
      setOrderProcessing(false);
    }
  };
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
              <p className="mt-2 text-gray-600">
                Please log in to proceed with checkout.
              </p>
              <div className="mt-6">
                <Link to="/login" className="text-indigo-600 font-medium hover:text-indigo-500">
                  Log In <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
              <p className="mt-2 text-gray-600">
                Add items to your cart before proceeding to checkout.
              </p>
              <div className="mt-6">
                <Link to="/shops" className="text-indigo-600 font-medium hover:text-indigo-500">
                  Browse Shops <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <div className="text-center">
              <svg className="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <h2 className="mt-3 text-2xl font-bold text-gray-900">Order Complete!</h2>
              <p className="mt-2 text-gray-600">
                Thank you for your order! Your order number is <span className="font-medium">{orderId}</span>.
              </p>
              <p className="mt-1 text-gray-600">
                We've sent a confirmation email to <span className="font-medium">{formData.email}</span>.
              </p>
              <div className="mt-6">
                <Link to="/" className="text-indigo-600 font-medium hover:text-indigo-500">
                  Return to Home <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-900">Checkout</h2>
          <p className="mt-2 text-gray-600">Complete your order</p>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            {/* Shipping & Payment Form */}
            <div className="md:col-span-2 p-6">
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Shipping Information</h3>
                  <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First name</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last name</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Postal code</label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Payment Method</h3>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center">
                      <input
                        id="card"
                        name="paymentMethod"
                        type="radio"
                        value="card"
                        checked={formData.paymentMethod === 'card'}
                        onChange={handleChange}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                      />
                      <label htmlFor="card" className="ml-3 block text-sm font-medium text-gray-700">
                        Credit/Debit Card
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="Bkash"
                        name="paymentMethod"
                        type="radio"
                        value="Bkash"
                        checked={formData.paymentMethod === 'Bkash'}
                        onChange={handleChange}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                      />
                      <label htmlFor="Bkash" className="ml-3 block text-sm font-medium text-gray-700">
                        Bkash
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="cash"
                        name="paymentMethod"
                        type="radio"
                        value="cash"
                        checked={formData.paymentMethod === 'cash'}
                        onChange={handleChange}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                      />
                      <label htmlFor="cash" className="ml-3 block text-sm font-medium text-gray-700">
                        Cash on Delivery
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <Link to="/cart" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    Return to cart
                  </Link>
                  <button
                    type="submit"
                    disabled={orderProcessing}
                    className="px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {orderProcessing ? 'Processing...' : 'Complete Order'}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Order Summary */}
            <div className="bg-gray-50 p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900">Order Summary</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Review your order details before completing your purchase.
                </p>
              </div>
              
              <div className="border-t border-gray-200 py-6">
                <div className="flow-root">
                  <ul className="-my-4 divide-y divide-gray-200">
                    {cart.items.map((item) => (
                      <li key={item._id} className="flex py-4 space-x-3">
                        <div className="flex-none w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                          <img 
                            src={item.product.images?.[0] || 'https://cdn-icons-png.flaticon.com/512/166/166169.png'} 
                            alt={item.product.name}
                            className="w-full h-full object-center object-cover"
                          />
                        </div>
                        <div className="flex-1 flex flex-col">
                          <div>
                            <div className="flex justify-between text-sm font-medium text-gray-900">
                              <h4>{item.product.name}</h4>
                              <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">Qty {item.quantity}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-600">Subtotal</dt>
                  <dd className="font-medium text-gray-900">${cart.totalAmount.toFixed(2)}</dd>
                </div>
                
                <div className="flex justify-between text-sm mt-2">
                  <dt className="text-gray-600">Shipping</dt>
                  <dd className="font-medium text-gray-900">$5.00</dd>
                </div>
                
                <div className="flex justify-between text-sm mt-2">
                  <dt className="text-gray-600">Tax</dt>
                  <dd className="font-medium text-gray-900">${(cart.totalAmount * 0.05).toFixed(2)}</dd>
                </div>
                
                <div className="flex justify-between text-base font-medium text-gray-900 mt-6">
                  <dt>Total</dt>
                  <dd>${(cart.totalAmount + 5 + cart.totalAmount * 0.05).toFixed(2)}</dd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;