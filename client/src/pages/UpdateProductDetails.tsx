import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  quantity: number;
  shop: {
    _id: string;
    name: string;
    owner: string | {
      _id: string;
      username: string;
    };
  };
  discount?: {
    isActive: boolean;
    type: string;
    value: number;
    startDate?: string;
    endDate?: string;
    voucherCode?: string;
  };
}

const UpdateProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { API_URL, user } = useAuth();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    quantity: '1',
    images: [''],
    discount: {
      isActive: false,
      type: 'none',
      value: '',
      startDate: '',
      endDate: '',
      voucherCode: ''
    }
  });

  // Fetch product details for editing
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/products/${id}`, {
          withCredentials: true
        });
        
        const productData = response.data.product;
        setProduct(productData);
        
        // Handle different owner types (string ID or object)
        const ownerId = typeof productData.shop.owner === 'object' 
          ? productData.shop.owner._id 
          : productData.shop.owner;
          
        if (ownerId.toString() !== user?._id.toString()) {
          setError("You don't have permission to edit this product");
          return;
        }
        
        // Initialize form data with product details
        setFormData({
          name: productData.name || '',
          description: productData.description || '',
          price: productData.price ? productData.price.toString() : '',
          category: productData.category || '',
          quantity: productData.quantity ? productData.quantity.toString() : '1',
          images: productData.images && productData.images.length > 0 ? productData.images : [''],
          discount: {
            isActive: productData.discount?.isActive || false,
            type: productData.discount?.type || 'none',
            value: productData.discount?.value ? productData.discount.value.toString() : '',
            startDate: productData.discount?.startDate || '',
            endDate: productData.discount?.endDate || '',
            voucherCode: productData.discount?.voucherCode || ''
          }
        });
      } catch (err) {
        setError('Failed to fetch product details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
  
    if (id) {
      fetchProductDetails();
    }
  }, [id, API_URL, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('discount.')) {
      const discountField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        discount: {
          ...prev.discount,
          [discountField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleDiscountTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      discount: {
        ...prev.discount,
        type: value,
        isActive: value !== 'none'
      }
    }));
  };

  const handleDiscountToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isActive = e.target.checked;
    setFormData(prev => ({
      ...prev,
      discount: {
        ...prev.discount,
        isActive,
        type: isActive ? (prev.discount.type !== 'none' ? prev.discount.type : 'flash_sale') : 'none'
      }
    }));
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const removeImageField = (index: number) => {
    if (formData.images.length <= 1) return;
    
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.price || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate discount fields if discount is active
    if (formData.discount.isActive) {
      if (formData.discount.type === 'flash_sale') {
        if (!formData.discount.startDate || !formData.discount.endDate || !formData.discount.value) {
          setError('Please fill in all flash sale fields');
          return;
        }
      } else if (formData.discount.type === 'voucher') {
        if (!formData.discount.voucherCode || !formData.discount.value) {
          setError('Please fill in all voucher fields');
          return;
        }
      }
    }

    try {
      setSubmitting(true);
      setError(null);
      
      // Filter out empty image URLs
      const filteredImages = formData.images.filter(img => img.trim() !== '');
      
      // Prepare the data we're sending
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        quantity: parseInt(formData.quantity),
        images: filteredImages,
        discount: formData.discount.isActive ? {
          isActive: true,
          type: formData.discount.type,
          value: parseFloat(formData.discount.value),
          ...(formData.discount.type === 'flash_sale' && {
            startDate: formData.discount.startDate,
            endDate: formData.discount.endDate
          }),
          ...(formData.discount.type === 'voucher' && {
            voucherCode: formData.discount.voucherCode
          })
        } : {
          isActive: false,
          type: 'none',
          value: 0
        }
      };
      
      // Log what we're sending to the server
      console.log('Sending updated product data:', productData);
      
      const response = await axios.put(
        `${API_URL}/api/products/${id}`,
        productData,
        {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          withCredentials: true
        }
      );
      
      console.log('Server response:', response.data);
      // Navigate back to product detail page
      navigate(`/products/${id}`);
    } catch (err: any) {
      console.log('Error response:', err.response?.data);
      
      // Set a more descriptive error message
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Failed to update product';
      
      setError(errorMessage);
      console.error('Error details:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white shadow-sm rounded-lg p-6">
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
          <div className="mt-4 text-center">
            <button 
              onClick={() => navigate(-1)} 
              className="text-indigo-600 hover:text-indigo-800"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Update Product</h2>
          <p className="mt-2 text-gray-600">
            Edit your product details
          </p>
        </div>
        
        {error && (
          <div className="mb-4 bg-red-50 p-4 rounded-md">
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
        )}
        
        <form onSubmit={handleSubmit} className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price ($) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="0"
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images (URLs)
            </label>
            
            {formData.images.map((image, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="url"
                  value={image}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="appearance-none block flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm mr-2"
                />
                <button
                  type="button"
                  onClick={() => removeImageField(index)}
                  className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addImageField}
              className="mt-2 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Image URL
            </button>
          </div>
          
          {/* Discount Section */}
          <div className="mt-8 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Discount Options</h3>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="discount-active"
                checked={formData.discount.isActive}
                onChange={handleDiscountToggle}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="discount-active" className="ml-2 block text-sm text-gray-900">
                Add a discount to this product
              </label>
            </div>
            
            {formData.discount.isActive && (
              <div className="pl-6 space-y-4 border-l-2 border-gray-200">
                <div>
                  <label htmlFor="discount-type" className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Type
                  </label>
                  <select
                    id="discount-type"
                    name="discount.type"
                    value={formData.discount.type}
                    onChange={handleDiscountTypeChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="none">Select discount type</option>
                    <option value="flash_sale">Flash Sale</option>
                    <option value="voucher">Voucher Code</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="discount-value" className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Percentage (%)
                  </label>
                  <input
                    type="number"
                    id="discount-value"
                    name="discount.value"
                    value={formData.discount.value}
                    onChange={handleChange}
                    min="1"
                    max="100"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                {formData.discount.type === 'flash_sale' && (
                  <>
                    <div>
                      <label htmlFor="discount-start-date" className="block text-sm font-medium text-gray-700 mb-1">
                        Sale Start Date
                      </label>
                      <input
                        type="datetime-local"
                        id="discount-start-date"
                        name="discount.startDate"
                        value={formData.discount.startDate}
                        onChange={handleChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="discount-end-date" className="block text-sm font-medium text-gray-700 mb-1">
                        Sale End Date
                      </label>
                      <input
                        type="datetime-local"
                        id="discount-end-date"
                        name="discount.endDate"
                        value={formData.discount.endDate}
                        onChange={handleChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </>
                )}
                
                {formData.discount.type === 'voucher' && (
                  <div>
                    <label htmlFor="discount-voucher-code" className="block text-sm font-medium text-gray-700 mb-1">
                      Voucher Code
                    </label>
                    <input
                      type="text"
                      id="discount-voucher-code"
                      name="discount.voucherCode"
                      value={formData.discount.voucherCode}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="e.g. SUMMER10"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(`/products/${id}`)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {submitting ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProductDetails;