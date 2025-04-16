import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const paymentMethods = [
  { label: 'bKash', value: 'bKash' },
  { label: 'Bank Transfer', value: 'bank' },
  { label: 'Card', value: 'card' }
];

const durationTypes = [
  { label: 'Days', value: 'days' },
  { label: 'Weeks', value: 'weeks' },
  { label: 'Months', value: 'months' }
];

const FeatureProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { API_URL } = useAuth();
  const navigate = useNavigate();

  // Set default startDate to today
  const today = new Date().toISOString().split('T')[0];
  const [duration, setDuration] = useState('3'); // Default to 3 for days
  const [durationType, setDurationType] = useState('days');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [productLoading, setProductLoading] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);
  const [isAlreadyFeatured, setIsAlreadyFeatured] = useState(false);
  const [unfeaturing, setUnfeaturing] = useState(false);
  const [amount, setAmount] = useState(0);

  // Calculate amount whenever duration or durationType changes
  useEffect(() => {
    let days = 0;
    if (!duration || isNaN(Number(duration)) || Number(duration) <= 0) {
      setAmount(0);
      return;
    }
    const n = Number(duration);
    if (durationType === 'days') days = n;
    else if (durationType === 'weeks') days = n * 7;
    else if (durationType === 'months') days = n * 30;
    setAmount(days * 0.79);
  }, [duration, durationType]);

  // Ensure minimum duration for "days" is 3
  useEffect(() => {
    if (durationType === 'days') {
      if (!duration || Number(duration) < 3) {
        setDuration('3');
      }
    }
  }, [durationType]);

  const checkFeatureStatus = async () => {
    try {
      if (!id) {
        setError('Product ID is missing.');
        return false;
      }

      const response = await axios.get(
        `${API_URL}/api/feature/${id}`,
        { withCredentials: true }
      );
      const requests = response.data.data;
      const pendingRequest = requests.find((req: { status: string; }) => req.status === 'pending');
      if (pendingRequest) {
        setError('You already have a pending feature request for this product.');
        return false;
      }
      return true;
    } catch (err: any) {
      setError('Failed to check feature status.');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!startDate) {
      setError('Please select a start date.');
      return;
    }
    if (!duration || isNaN(Number(duration)) || Number(duration) <= 0) {
      setError('Please enter a valid duration.');
      return;
    }
    if (durationType === 'days' && Number(duration) < 3) {
      setError('Minimum duration for days is 3.');
      return;
    }
    if (!paymentMethod) {
      setError('Please select a payment method.');
      return;
    }
    if (!transactionId.trim()) {
      setError('Please enter the transaction ID.');
      return;
    }

    setSubmitting(true);
    try {
      await axios.put(
        `${API_URL}/api/featureproducts/feature-product`,
        {
          productId: id,
          startDate,
          duration: Number(duration),
          durationType,
          paymentMethod,
          transactionId,
          amount // send amount to backend
        },
        { withCredentials: true }
      );
      setSuccess(true);
      setTimeout(() => navigate(`/products/${id}`), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to feature product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnfeature = async () => {
    if (!id) return;
    setUnfeaturing(true);
    setError(null);
    try {
      await axios.put(
        `${API_URL}/api/featureproducts/unfeature-product/${id}`,
        {},
        { withCredentials: true }
      );
      setIsAlreadyFeatured(false);
      setSuccess(false);
      setError(null);
      setProduct((prev: any) => prev ? { ...prev, isFeatured: false } : prev);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to unfeature product.');
    } finally {
      setUnfeaturing(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    setProductLoading(true);
    setProductError(null);
    axios
      .get(`${API_URL}/api/productpage/${id}`)
      .then(res => {
        setProduct(res.data.product);
        setProductError(null); 
        if (res.data.product?.isFeatured) {
          setIsAlreadyFeatured(true);
          setError(null);
        } else {
          setIsAlreadyFeatured(false);
        }
      })
      .catch(() => {
        setProductError('Failed to load product details.');
      })
      .finally(() => setProductLoading(false));
  }, [id, API_URL]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 mt-10">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg transform transition-all hover:scale-[1.01]">
        <h2 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Feature Your Product</h2>
        <p className="text-center text-gray-600 mb-6">Boost your visibility and reach more potential buyers today!</p>
        {/* Product details section below the intro text */}
        {productLoading ? (
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : productError ? (
          <div className="mb-4 text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{productError}</div>
        ) : product ? (
          <div className="flex items-center gap-4 mb-6 border-b pb-4">
            <img
              src={product.images?.[0] || 'https://via.placeholder.com/80x80'}
              alt={product.name}
              className="w-16 h-16 object-cover rounded"
            />
            <div>
              <div className="font-semibold text-lg text-gray-900">{product.name}</div>
              <div className="text-gray-600">${product.price?.toFixed(2)}</div>
            </div>
          </div>
        ) : null}
        {error && (
          <div className="mb-4 text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>
        )}
        {success && (
          <div className="mb-4 text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">
            Product featured successfully!
          </div>
        )}
        {isAlreadyFeatured && (
          <div className="mb-4 flex items-center gap-3">
            <span className="text-amber-700 font-semibold bg-amber-100 px-3 py-1 rounded">
              Already featured
            </span>
            <button
              type="button"
              onClick={handleUnfeature}
              disabled={unfeaturing}
              className={`inline-flex items-center px-3 py-1.5 rounded bg-red-600 text-white font-medium hover:bg-red-700 transition ${unfeaturing ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {unfeaturing ? 'Unfeaturing...' : 'Unfeature'}
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Start Date</label>
            <input
              type="date"
              className="border px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Duration</label>
            <div className="flex gap-3">
              <input
                type="number"
                min={durationType === 'days' ? 3 : 1}
                className="border px-3 py-2 rounded-lg w-1/2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                required
              />
              <select
                className="border px-3 py-2 rounded-lg w-1/2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
                value={durationType}
                onChange={e => setDurationType(e.target.value)}
              >
                {durationTypes.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            {durationType === 'days' && (
              <div className="text-xs text-gray-500 mt-1">Minimum 3 days required</div>
            )}
          </div>
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Payment Method</label>
            <select
              className="border px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              required
            >
              <option value="">Select payment method</option>
              {paymentMethods.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Transaction ID</label>
            <input
              type="text"
              className="border px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
              value={transactionId}
              onChange={e => setTransactionId(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Amount to Pay</label>
            <div className="border px-3 py-2 rounded-lg w-full bg-gray-50 text-gray-800 font-semibold">
              ${amount > 0 ? amount.toFixed(2) : '0.00'}
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting || isAlreadyFeatured}
            className={`w-full py-3 px-4 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-semibold hover:opacity-90 transform transition-all hover:-translate-y-0.5 focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 ${
              (submitting || isAlreadyFeatured) ? 'opacity-60 cursor-not-allowed bg-gray-300 bg-none' : ''
            }`}
          >
            {isAlreadyFeatured ? 'Feature Product' : (submitting ? 'Featuring...' : 'Feature Product')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeatureProduct;
