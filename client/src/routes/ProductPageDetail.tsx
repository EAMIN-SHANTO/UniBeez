import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  description: string;
  shop: {
    _id: string;
    name: string;
  };
}

interface ProductPage {
  _id: string;
  title: string;
  description: string;
  bannerImage: string;
  viewCount: number;
  createdAt: string;
  owner: {
    _id: string;
    username: string;
    email: string;
  };
  category?: string;
  filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    keyword?: string;
  };
  products: Product[];
}

const ProductPageDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { API_URL } = useAuth();
  const navigate = useNavigate();

  const [productPage, setProductPage] = useState<ProductPage | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductPage = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/productpages/${id}`);
        setProductPage(response.data.productPage);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to load product page. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProductPage();
  }, [id, API_URL]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (error || !productPage) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-6">
          <div className="bg-red-50 p-4 rounded-md text-red-800">
            {error || 'Product page not found.'}
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

  const { title, description, bannerImage, viewCount, products, filters } = productPage;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="relative h-64">
            <img
              src={bannerImage || 'https://via.placeholder.com/1200x300'}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h1 className="text-3xl font-bold text-white">{title}</h1>
              <p className="text-sm text-white/80 mt-2">{description}</p>
            </div>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                <p className="text-sm text-gray-500 mt-1">{description}</p>
              </div>
              <div className="text-sm text-gray-400">{viewCount} views</div>
            </div>

            {filters && (
              <div className="text-sm text-gray-600 mb-4">
                {filters.category && <span className="mr-2">Category: <strong>{filters.category}</strong></span>}
                {filters.keyword && <span className="mr-2">Keyword: <strong>{filters.keyword}</strong></span>}
                {filters.minPrice !== undefined && <span className="mr-2">Min: ${filters.minPrice}</span>}
                {filters.maxPrice !== undefined && <span className="mr-2">Max: ${filters.maxPrice}</span>}
              </div>
            )}

            {products.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No products found in this page.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Link
                    key={product._id}
                    to={`/products/${product._id}`}
                    className="block bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition"
                  >
                    <img
                      src={product.images?.[0] || 'https://via.placeholder.com/300'}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                      <p className="mt-2 text-indigo-600 font-bold">${product.price.toFixed(2)}</p>
                      <p className="text-xs text-gray-400 mt-1">Sold by: {product.shop.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate(-1)}
                className="text-indigo-600 hover:text-indigo-800 text-sm"
              >
                &larr; Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPageDetail;
