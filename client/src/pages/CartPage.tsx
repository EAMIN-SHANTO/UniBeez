import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartPage: React.FC = () => {
  const { cart, loading, error, updateQuantity, removeFromCart, applyVoucher } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // New state for voucher code input
  const [voucherCode, setVoucherCode] = useState<string>('');
  const [applyingVoucher, setApplyingVoucher] = useState<boolean>(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);

  // Handle voucher application
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError('Please enter a voucher code');
      return;
    }

    try {
      setApplyingVoucher(true);
      setVoucherError(null);
      await applyVoucher(voucherCode);
      // Voucher successfully applied
    } catch (err: any) {
      setVoucherError(err.message);
    } finally {
      setApplyingVoucher(false);
    }
  };
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <div className="text-center">
              <h2 className="mt-3 text-2xl font-bold text-gray-900">Shopping Cart</h2>
              <p className="mt-2 text-gray-600">
                Please log in to view your cart.
              </p>
              <div className="mt-6">
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Log In
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
  
  if (error) {
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
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h2>
          
          {(!cart || cart.items.length === 0) ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
              <p className="mt-1 text-sm text-gray-500">Start shopping to add items to your cart</p>
              <div className="mt-6">
                <Link
                  to="/shops"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Browse Shops
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <div className="mt-8">
                <div className="flow-root">
                  <ul className="-my-6 divide-y divide-gray-200">
                    {cart.items.map((item) => (
                      <li key={item._id} className="py-6 flex">
                        <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                          <img
                            src={item.product.images?.[0] || 'https://cdn-icons-png.flaticon.com/512/166/166169.png'}
                            alt={item.product.name}
                            className="w-full h-full object-center object-cover"
                          />
                        </div>

                        <div className="ml-4 flex-1 flex flex-col">
                          <div>
                            <div className="flex justify-between text-base font-medium text-gray-900">
                              <h3>
                                <Link to={`/products/${item.product._id}`}>
                                  {item.product.name}
                                </Link>
                              </h3>
                              <div>
                                {item.discountedPrice ? (
                                  <div className="text-right">
                                    <p className="text-red-600">${item.discountedPrice.toFixed(2)}</p>
                                    <p className="text-sm text-gray-500 line-through">${item.price.toFixed(2)}</p>
                                    {item.discountPercentage && (
                                      <span className="ml-2 bg-red-100 text-red-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                                        {item.discountPercentage}% OFF
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <p>${item.price.toFixed(2)}</p>
                                )}
                              </div>
                            </div>
                            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                              {item.product.description}
                            </p>
                            
                            {/* Show voucher badge if applicable */}
                            {item.hasVoucher && !item.voucherApplied && (
                              <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                                <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                Voucher discount available
                              </span>
                            )}
                            
                            {/* Show applied voucher badge */}
                            {item.voucherApplied && (
                              <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Voucher applied
                              </span>
                            )}
                          </div>
                          <div className="flex-1 flex items-end justify-between text-sm">
                            <div className="flex items-center">
                              <label htmlFor={`quantity-${item._id}`} className="mr-2 text-gray-500">
                                Qty
                              </label>
                              <div className="flex items-center border border-gray-300 rounded">
                                <button
                                  type="button"
                                  className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                                  onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                                >
                                  -
                                </button>
                                <span className="px-2 py-1">{item.quantity}</span>
                                <button
                                  type="button"
                                  className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            <div className="flex">
                              <button
                                type="button"
                                className="font-medium text-indigo-600 hover:text-indigo-500"
                                onClick={() => removeFromCart(item._id)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Voucher code input section */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex flex-col sm:flex-row">
                  <div className="flex-1">
                    <label htmlFor="voucher-code" className="block text-sm font-medium text-gray-700 mb-1">
                      Voucher Code
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        id="voucher-code"
                        name="voucher-code"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                        placeholder="Enter voucher code"
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleApplyVoucher}
                        disabled={applyingVoucher}
                        className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        {applyingVoucher ? 'Applying...' : 'Apply'}
                      </button>
                    </div>
                    {voucherError && (
                      <p className="mt-2 text-sm text-red-600">{voucherError}</p>
                    )}
                    {cart.voucherApplied && (
                      <p className="mt-2 text-sm text-green-600">
                        Voucher code {cart.voucherApplied} applied successfully!
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 py-6">
                <div className="flex justify-between text-base font-medium text-gray-900 mb-1">
                  <p>Subtotal</p>
                  <p>${cart.totalAmount.toFixed(2)}</p>
                </div>
                
                {/* Display discount if available */}
                {cart.totalDiscount && cart.totalDiscount > 0 && (
                  <div className="flex justify-between text-base font-medium text-red-600 mb-1">
                    <p>Discount</p>
                    <p>-${cart.totalDiscount.toFixed(2)}</p>
                  </div>
                )}
                
                {/* Display final amount if available */}
                {cart.finalAmount !== undefined && (
                  <div className="flex justify-between text-lg font-bold text-gray-900 mb-1">
                    <p>Total</p>
                    <p>${cart.finalAmount.toFixed(2)}</p>
                  </div>
                )}
                
                <p className="mt-2 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                <div className="mt-6">
                  <button
                    onClick={() => navigate('/checkout')}
                    className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Proceed to Checkout
                  </button>
                </div>
                <div className="mt-6 flex justify-center text-sm text-center text-gray-500">
                  <p>
                    or{' '}
                    <Link to="/productpage" className="text-indigo-600 font-medium hover:text-indigo-500">
                      Continue Shopping<span aria-hidden="true"> &rarr;</span>
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;