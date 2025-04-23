import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import StarRating from './StarRating';

interface ShopRatingProps {
  shopId: string;
  shopOwnerId: string;
}

const ShopRatingComponent: React.FC<ShopRatingProps> = ({ shopId, shopOwnerId }) => {
  const { API_URL, user } = useAuth();
  const [userRating, setUserRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userHasRated, setUserHasRated] = useState(false);

  // Check if user has already rated this shop
  useEffect(() => {
    const checkUserRating = async () => {
      if (!user) return;
      
      try {
        const response = await axios.get(`${API_URL}/api/ratings/check/shop/${shopId}`, {
          withCredentials: true
        });
        
        if (response.data.hasRated) {
          setUserRating(response.data.rating.rating);
          setUserHasRated(true);
        }
      } catch (err) {
        console.error('Error checking user shop rating:', err);
      }
    };

    checkUserRating();
  }, [user, shopId, API_URL]);

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // User can't rate their own shop
    if (user._id === shopOwnerId) {
      setError('You cannot rate your own shop');
      return;
    }

    if (userRating === 0) {
      setError('Please select a rating');
      return;
    }

    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await axios.post(`${API_URL}/api/ratings/shops/${shopId}`, {
        rating: userRating
      }, {
        withCredentials: true
      });

      setSuccess('Rating submitted successfully!');
      setUserHasRated(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || user._id === shopOwnerId) {
    return null; // Don't show rating form for shop owner or guests
  }

  return (
    <div className="mt-4 bg-white p-4 rounded-lg shadow-sm">
      <h4 className="text-lg font-medium mb-2">
        {userHasRated ? 'Update your rating' : 'Rate this shop'}
      </h4>
      
      <form onSubmit={handleSubmitRating}>
        <div className="mb-3">
          <label className="block mb-1 text-sm font-medium text-gray-700">Your Rating</label>
          <StarRating
            rating={userRating}
            setRating={setUserRating}
            disabled={isSubmitting}
            size="medium"
          />
        </div>
        
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        {success && <div className="mb-3 text-sm text-green-600">{success}</div>}
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : userHasRated ? 'Update Rating' : 'Submit Rating'}
        </button>
      </form>
    </div>
  );
};

export default ShopRatingComponent;