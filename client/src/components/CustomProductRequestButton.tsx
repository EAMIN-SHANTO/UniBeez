import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface CustomProductRequestButtonProps {
  shopId: string;
  shopOwnerId: string;
  className?: string;
}

const CustomProductRequestButton: React.FC<CustomProductRequestButtonProps> = ({ 
  shopId, 
  shopOwnerId,
  className = ''
}) => {
  const { user } = useAuth();
  
  // Don't show button if user is not logged in or is the shop owner
  if (!user || user._id === shopOwnerId) {
    return null;
  }
  
  return (
    <Link 
      to={`/shops/${shopId}/request-custom-product`}
      className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${className}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Request Custom Product
    </Link>
  );
};

export default CustomProductRequestButton;