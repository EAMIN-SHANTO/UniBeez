import React, { useState } from 'react';
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

  const [duration, setDuration] = useState('');
  const [durationType, setDurationType] = useState('days');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
        `${API_URL}/api/feature/${id}/true`,
        {
          startDate,
          duration: Number(duration),
          durationType,
          paymentMethod,
          transactionId
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg transform transition-all hover:scale-[1.01]">
        <h2 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Feature Your Product</h2>
        <p className="text-center text-gray-600 mb-6">Boost your visibility and reach more potential buyers today!</p>
        {error && (
          <div className="mb-4 text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>
        )}
        {success && (
          <div className="mb-4 text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">
            Product featured successfully!
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
                min={1}
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
          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3 px-4 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-semibold hover:opacity-90 transform transition-all hover:-translate-y-0.5 focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {submitting ? 'Featuring...' : 'Feature Product'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeatureProduct;
