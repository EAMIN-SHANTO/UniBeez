import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import StarRating from './StarRating';

interface Review {
  _id: string;
  user: {
    _id: string;
    username: string;
    img?: string;
  };
  rating: number;
  comment?: string;
  createdAt: string;
}

interface ProductReviewsProps {
  productId: string;
  shopOwnerId: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, shopOwnerId }) => {
  const { API_URL, user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/ratings/products/${productId}`, {
          withCredentials: true
        });
        setReviews(response.data.ratings);
        setTotalReviews(response.data.totalCount);
      } catch (err) {
        console.error('Error fetching product reviews:', err);
      }
    };

    fetchReviews();
  }, [productId, API_URL]);

  // Check if user has already rated this product
  useEffect(() => {
    const checkUserRating = async () => {
      if (!user) return;
      
      try {
        const response = await axios.get(`${API_URL}/api/ratings/check/product/${productId}`, {
          withCredentials: true
        });
        
        if (response.data.hasRated) {
          setUserRating(response.data.rating.rating);
          setComment(response.data.rating.comment || '');
          setUserHasReviewed(true);
        }
      } catch (err) {
        console.error('Error checking user rating:', err);
      }
    };

    checkUserRating();
  }, [user, productId, API_URL]);

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // User can't rate their own product
    if (user._id === shopOwnerId) {
      setError('You cannot rate your own product');
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
      const response = await axios.post(`${API_URL}/api/ratings/products/${productId}`, {
        rating: userRating,
        comment
      }, {
        withCredentials: true
      });

      setSuccess('Review submitted successfully!');
      setUserHasReviewed(true);

      // Refresh reviews
      const updatedReviews = await axios.get(`${API_URL}/api/ratings/products/${productId}`);
      setReviews(updatedReviews.data.ratings);
      setTotalReviews(updatedReviews.data.totalCount);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Reviews</h3>

      {/* Review form */}
      {user && user._id !== shopOwnerId && (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <h4 className="text-lg font-medium mb-2">
            {userHasReviewed ? 'Update your review' : 'Leave a review'}
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
            
            <div className="mb-3">
              <label htmlFor="comment" className="block mb-1 text-sm font-medium text-gray-700">
                Your Review (optional)
              </label>
              <textarea
                id="comment"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Write your review here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={isSubmitting}
              ></textarea>
            </div>
            
            {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
            {success && <div className="mb-3 text-sm text-green-600">{success}</div>}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : userHasReviewed ? 'Update Review' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      {/* Reviews list */}
      {displayedReviews.length > 0 ? (
        <div className="space-y-4">
          {displayedReviews.map((review) => (
            <div key={review._id} className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-bold">
                    {review.user.img ? (
                      <img 
                        src={review.user.img} 
                        alt={review.user.username} 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      review.user.username[0].toUpperCase()
                    )}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{review.user.username}</p>
                  <div className="mt-1">
                    <StarRating rating={review.rating} disabled size="small" />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                  {review.comment && (
                    <p className="mt-2 text-sm text-gray-700">{review.comment}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
      )}

      {/* Show more/less button */}
      {totalReviews > 3 && (
        <button 
          className="mt-4 text-indigo-600 hover:text-indigo-800 text-sm font-medium focus:outline-none"
          onClick={() => setShowAllReviews(!showAllReviews)}
        >
          {showAllReviews ? 'Show less reviews' : `Show all ${totalReviews} reviews`}
        </button>
      )}
    </div>
  );
};

export default ProductReviews;