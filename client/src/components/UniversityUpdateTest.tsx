import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const UniversityUpdateTest: React.FC = () => {
  const { API_URL } = useAuth();
  const [university, setUniversity] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      console.log('Sending university update:', university);
      
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ university })
      });

      const data = await response.json();
      console.log('University update response:', data);
      
      if (data.success) {
        setMessage(`University updated to: ${data.user.university}`);
        setUniversity('');
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('University update error:', error);
      setMessage('Failed to update university');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow mt-4">
      <h2 className="text-xl font-semibold mb-4">Test University Update</h2>
      
      {message && (
        <div className={`p-3 mb-4 rounded ${message.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            University (Test)
          </label>
          <input
            type="text"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter university name"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update University Only'}
        </button>
      </form>
    </div>
  );
};

export default UniversityUpdateTest; 