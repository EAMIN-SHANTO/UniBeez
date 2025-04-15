import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface PaymentPageState {
  orderId: string;
  shippingAddress: any;
  paymentMethod: string;
  totalAmount: number;
}

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { API_URL, user } = useAuth();
  const { cart } = useCart();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [confirmationId, setConfirmationId] = useState<string>('');
  
  // Payment details state
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardName, setCardName] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [cvv, setCvv] = useState<string>('');
  const [bkashNumber, setBkashNumber] = useState<string>('');
  const [bkashTransaction, setBkashTransaction] = useState<string>('');
  
  // Get payment information from location state
  const paymentInfo = location.state as PaymentPageState;
  
  useEffect(() => {
    // If we don't have payment info or user is not logged in, redirect to checkout
    if (!paymentInfo || !user) {
      navigate('/checkout');
    }
  }, [paymentInfo, user, navigate]);

  if (!paymentInfo) {
    return null; // Don't render anything while redirecting
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsProcessing(true);
      setError(null);

      // Validate payment details based on payment method
      if (paymentInfo.paymentMethod === 'card') {
        if (!cardNumber || !cardName || !expiryDate || !cvv) {
          setError('Please fill in all card details');
          setIsProcessing(false);
          return;
        }
      } else if (paymentInfo.paymentMethod === 'Bkash') {
        if (!bkashNumber || !bkashTransaction) {
          setError('Please fill in all Bkash details');
          setIsProcessing(false);
          return;
        }
      }

      // Process the payment
      const paymentDetails = 
        paymentInfo.paymentMethod === 'card' ? {
          cardNumber,
          cardName,
          expiryDate,
          cvv
        } : paymentInfo.paymentMethod === 'Bkash' ? {
          bkashNumber,
          bkashTransaction
        } : {};
      
      const response = await axios.post(
        `${API_URL}/api/cart/process-payment`,
        {
          orderId: paymentInfo.orderId,
          paymentMethod: paymentInfo.paymentMethod,
          paymentDetails,
          shippingAddress: paymentInfo.shippingAddress
        },
        { withCredentials: true }
      );
      
      setSuccess(true);
      setConfirmationId(response.data.confirmationId);
      
      // Wait 3 seconds then redirect to order confirmation page
      setTimeout(() => {
        navigate('/order-confirmation', { 
          state: { 
            orderId: paymentInfo.orderId,
            confirmationId: response.data.confirmationId
          }
        });
      }, 3000);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment processing failed. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Complete Your Payment</h2>
          <p className="mt-2 text-gray-600">
            Total amount: ${paymentInfo.totalAmount.toFixed(2)}
          </p>
        </div>
        
        {success ? (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="text-center">
              <svg className="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="mt-3 text-xl font-medium text-gray-900">Payment Successful!</h3>
              <p className="mt-2 text-gray-600">
                Your order has been placed and is being processed. Your confirmation ID is: <span className="font-bold">{confirmationId}</span>
              </p>
              <p className="mt-4 text-sm text-gray-500">
                You will be redirected to the order confirmation page shortly...
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
                {error}
              </div>
            )}
            
            <form onSubmit={handlePaymentSubmit}>
              {paymentInfo.paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="cardName" className="block text-sm font-medium text-gray-700">
                      Name on Card
                    </label>
                    <input
                      type="text"
                      id="cardName"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        id="expiryDate"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d{0,2})/, '$1/$2').trim())}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
                        CVV
                      </label>
                      <input
                        type="password"
                        id="cvv"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="123"
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {paymentInfo.paymentMethod === 'Bkash' && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="bkashNumber" className="block text-sm font-medium text-gray-700">
                      Bkash Number
                    </label>
                    <input
                      type="text"
                      id="bkashNumber"
                      value={bkashNumber}
                      onChange={(e) => setBkashNumber(e.target.value.replace(/\D/g, ''))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="01XXXXXXXXX"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="bkashTransaction" className="block text-sm font-medium text-gray-700">
                      Transaction ID
                    </label>
                    <input
                      type="text"
                      id="bkashTransaction"
                      value={bkashTransaction}
                      onChange={(e) => setBkashTransaction(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="TrxID12345678"
                    />
                  </div>
                </div>
              )}
              
              {paymentInfo.paymentMethod === 'cash' && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    You have selected Cash on Delivery. You will pay when your order is delivered.
                  </p>
                </div>
              )}
              
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Complete Payment'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;