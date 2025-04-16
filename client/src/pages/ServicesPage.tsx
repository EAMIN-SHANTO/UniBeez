import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

interface Shop {
  _id: string;
  name: string;
  logo: string;
  category: string;
  owner: {
    _id: string;
    username: string;
    email: string;
  };
}

interface ServiceType {
  id: string;
  name: string;
  icon: JSX.Element;
  description: string;
}

const ServicesPage: React.FC = () => {
  const { API_URL, user } = useAuth();
  const [formData, setFormData] = useState({
    shopId: '',
    serviceType: [] as string[], // Changed to string array for multiple selections
    description: '',
  });
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const serviceTypes: ServiceType[] = [
    { 
      id: 'tables', 
      name: 'Tables & Chairs', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      ),
      description: 'Request tables and chairs for your shop or event'
    },
    { 
      id: 'electricity', 
      name: 'Electricity Support', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      description: 'Request electrical connections and power support'
    },
    { 
      id: 'volunteers', 
      name: 'Volunteer Support', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      description: 'Request student volunteers to help with your shop or event'
    },
    { 
      id: 'water', 
      name: 'Water Supply', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      description: 'Request water supply for your shop or event'
    },
  ];

  useEffect(() => {
    // Fetch shops when component mounts
    const fetchShops = async () => {
      try {
        setLoading(true);
        // Use the new endpoint to get shops for service requests
        const response = await axios.get(`${API_URL}/api/services/shops`);
        
        if (response.data.success) {
          // Filter shops to only show shops owned by the current user
          const userShops = response.data.shops.filter(
            (shop: Shop) => shop.owner && user && shop.owner._id === user._id
          );
          setShops(userShops);
          setError('');
        } else {
          throw new Error('Failed to fetch shops');
        }
      } catch (err) {
        console.error('Error fetching shops:', err);
        setError('Failed to load shops. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, [API_URL, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Updated to toggle service type selection
  const handleServiceTypeSelect = (serviceId: string) => {
    setFormData(prevData => {
      // Check if service is already selected
      const isSelected = prevData.serviceType.includes(serviceId);
      
      let updatedServiceTypes: string[];
      if (isSelected) {
        // Remove the service if already selected
        updatedServiceTypes = prevData.serviceType.filter(id => id !== serviceId);
      } else {
        // Add the service if not selected
        updatedServiceTypes = [...prevData.serviceType, serviceId];
      }
      
      return { ...prevData, serviceType: updatedServiceTypes };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that at least one service is selected
    if (formData.serviceType.length === 0) {
      setError('Please select at least one service type');
      return;
    }
    
    try {
      const response = await axios.post(`${API_URL}/api/services`, formData);
      
      if (response.data) {
        setSuccess('Service request submitted successfully!');
        setFormData({ shopId: '', serviceType: [], description: '' });
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccess('');
        }, 5000);
      } else {
        setError(`Failed to submit the request: ${response.data.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Error:', error);
      setError(`An error occurred while submitting the request: ${error.response?.data?.message || 'Unknown error'}`);
    }
  };

  // Display message if user has no shops
  const noShopsMessage = !loading && shops.length === 0 && (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-sm my-8">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-medium text-yellow-800">No shops found</h3>
          <div className="mt-2 text-yellow-700">
            <p>You don't have any shops yet. Please create a shop first before requesting services.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">University Services</h1>
          <p className="mt-4 text-xl text-gray-500 max-w-3xl mx-auto">
            Request resources and support from university authorities to help your shop or event succeed.
          </p>
        </div>

        {/* Alert messages */}
        {error && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mb-8 bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}
        
        {loading && (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {noShopsMessage}
        
        {!loading && shops.length > 0 && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Request a Service</h2>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="shopId" className="block text-sm font-medium text-gray-700 mb-1">Select Your Shop</label>
                    <div className="relative">
                      <select
                        id="shopId"
                        name="shopId"
                        value={formData.shopId}
                        onChange={handleChange}
                        className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        required
                      >
                        <option value="">Select a shop</option>
                        {shops.map((shop) => (
                          <option key={shop._id} value={shop._id}>
                            {shop.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">You can only request services for shops you own</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">Select Service Types (Select Multiple)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {serviceTypes.map((service) => (
                        <div 
                          key={service.id}
                          onClick={() => handleServiceTypeSelect(service.id)}
                          className={`relative border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                            formData.serviceType.includes(service.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className={`flex-shrink-0 p-2 rounded-md ${
                              formData.serviceType.includes(service.id) ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {service.icon}
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-gray-900">{service.name}</h3>
                              <p className="text-xs text-gray-500">{service.description}</p>
                            </div>
                          </div>
                          {formData.serviceType.includes(service.id) && (
                            <div className="absolute top-2 right-2">
                              <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {/* Display selected services as pills below the grid */}
                    {formData.serviceType.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Selected Services:</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.serviceType.map(serviceId => {
                            const service = serviceTypes.find(s => s.id === serviceId);
                            return (
                              <div key={serviceId} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded flex items-center">
                                {service?.name}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent triggering the parent div's onClick
                                    handleServiceTypeSelect(serviceId);
                                  }}
                                  className="ml-1 text-blue-600 hover:text-blue-800"
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {formData.serviceType.length === 0 && (
                      <p className="mt-2 text-sm text-red-500">Please select at least one service type</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Request Details
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      rows={4}
                      placeholder="Please provide specific details about your request - what you need, when you need it, and any special requirements."
                      required
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-end">
                  <button 
                    type="submit" 
                    disabled={formData.serviceType.length === 0}
                    className={`inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white ${
                      formData.serviceType.length === 0 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    } transition-colors`}
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;