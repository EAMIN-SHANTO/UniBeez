import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  quantity: number;
  isFeatured: boolean; // Add isFeatured property instead of featured
  shop: {
    _id: string;
    name: string;
    owner: {
      _id: string;
      username: string;
    }
  };
  createdAt: string;
  // Remove the featured? property since we now have isFeatured
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { API_URL, user } = useAuth();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);
  const [cartMessage, setCartMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/products/${id}`);
        setProduct(response.data.product);
        setError(null);
      } catch (err) {
        setError('Failed to fetch product details. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id, API_URL]);

  const isOwner = user && product && user._id === product.shop.owner.toString();

  const handleDelete = async () => {
    if (!product) return;
    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this product?");
      if (!confirmDelete) return;

      await axios.delete(`${API_URL}/api/productpage/${product._id}`);
      alert("Product deleted successfully.");
      navigate(-1);
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert("Failed to delete product. Please try again.");
    }
  };




  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      setIsAddingToCart(true);
      setCartMessage(null);
      
      if (product) {
        await addToCart(product._id, quantity);
      }
      setCartMessage('Product added to cart!');
      
      setTimeout(() => {
        setCartMessage(null);
      }, 3000);
    } catch (err: any) {
      setCartMessage(err.message || 'Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-100 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <div className="bg-red-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error || "Product not found"}</h3>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <button onClick={() => navigate(-1)} className="text-indigo-600 hover:text-indigo-800">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col md:flex-row -mx-4">
              <div className="md:flex-1 px-4">
                <div className="mb-4">
                  <div className="h-64 md:h-80 rounded-lg bg-gray-100 mb-4 flex items-center justify-center">
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[activeImage]} 
                        alt={product.name} 
                        className="object-contain h-full"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-1 text-sm text-gray-500">No image available</p>
                      </div>
                    )}
                  </div>
                  
                  {product.images && product.images.length > 1 && (
                    <div className="flex -mx-2 mb-4">
                      {product.images.map((image, i) => (
                        <div key={i} className="px-2">
                          <button 
                            onClick={() => setActiveImage(i)}
                            className={`h-16 w-16 rounded-md bg-gray-100 flex items-center justify-center ${i === activeImage ? 'ring-2 ring-indigo-500' : ''}`}
                          >
                            <img 
                              src={image} 
                              alt={`${product.name} - ${i + 1}`} 
                              className="object-contain h-12"
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="md:flex-1 px-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
                    {product.isFeatured && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-200 text-yellow-800 border border-yellow-400">
                        Featured
                      </span>
                    )}
                    <Link to={`/shops/${product.shop._id}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                      {product.shop.name}
                    </Link>
                  </div>
                  <div>
                     {isOwner && (
                      <div className="flex space-x-4">
                        <Link
                          to={`/updateproductdetails/${product._id}`} // Corrected path
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={handleDelete}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => navigate(`/feature-product/${product._id}`)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded bg-amber-500 text-white font-semibold hover:bg-amber-600 transition"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          Feature
                        </button>
                      </div>
                     )}
                  </div>
                </div>
                
                <div className="mt-2 flex items-center">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="ml-1 text-sm text-gray-500">
                      {product.rating.toFixed(1)} ({product.reviewCount} reviews)
                    </span>
                  </div>
                  <span className="mx-2 text-gray-300">|</span>
                  <span className="text-sm text-gray-500">
                    {product.category}
                  </span>
                </div>
                
                <div className="mt-4">
                  <span className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                </div>
                
                <div className="mt-6 prose prose-sm text-gray-500">
                  <h3 className="text-sm font-medium text-gray-900">Description</h3>
                  <div className="mt-2">
                    <p>{product.description}</p>
                  </div>
                </div>

     
                <div className="mt-4">
                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.inStock && product.quantity > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.inStock && product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                    {product.inStock && product.quantity > 0 && (
                      <span className="ml-2 text-sm text-gray-500">
                        {product.quantity} available
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Cart/quantity section remains below */}
                <div className="mt-6">
                  {product.inStock ? (
                    <div>
                      <div className="flex items-center mb-4">
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mr-4">
                          Quantity:
                        </label>
                        <div className="flex items-center border border-gray-300 rounded">
                          <button 
                            type="button"
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          >
                            -
                          </button>
                          <span className="px-3 py-1">{quantity}</span>
                          <button 
                            type="button"
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                            onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                          >
                            +
                          </button>
                        </div>
                        <span className="ml-2 text-sm text-gray-500">
                          {product.quantity} available
                        </span>
                      </div>
                      
                      <button
                        onClick={handleAddToCart}
                        disabled={isAddingToCart}
                        className="w-full bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                      </button>
                      
                      {cartMessage && (
                        <div className="mt-2 text-sm text-center">
                          <span className={cartMessage.includes('Failed') ? 'text-red-500' : 'text-green-500'}>
                            {cartMessage}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="inline-block bg-red-100 text-red-700 px-4 py-2 rounded-md">
                      Out of Stock
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex items-center">
                  <button 
                    onClick={() => navigate(-1)} 
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    &larr; Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;