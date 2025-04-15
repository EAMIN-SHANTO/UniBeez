import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';

interface OrderConfirmationState {
  orderId: string;
  confirmationId: string;
}

const OrderConfirmation: React.FC = () => {
  const location = useLocation();
  const orderInfo = location.state as OrderConfirmationState;
  
  if (!orderInfo) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <div className="text-center">
            <svg className="mx-auto h-24 w-24 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">Order Complete!</h2>
            <p className="mt-4 text-lg text-gray-600">
              Thank you for your purchase. Your order has been received and is now being processed.
            </p>
            <div className="mt-6 border-t border-b border-gray-200 py-6">
              <div className="flex flex-col space-y-2 text-gray-700">
                <div className="flex justify-between">
                  <span className="font-medium">Order ID:</span>
                  <span>{orderInfo.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Confirmation ID:</span>
                  <span>{orderInfo.confirmationId}</span>
                </div>
              </div>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Return to Home
              </Link>
              <Link
                to="/productpage"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;