import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

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
  shop: {
    _id: string;
    name: string;
  };
}

const Products: React.FC = () => {
  const { API_URL } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState<string>(searchParams.get('category') || '');
  const [shopFilter, setShopFilter] = useState<string>(searchParams.get('shop') || '');
  const [priceMin, setPriceMin] = useState<string>(searchParams.get('minPrice') || '');
  const [priceMax, setPriceMax] = useState<string>(searchParams.get('maxPrice') || '');
  const [sortOption, setSortOption] = useState<string>(searchParams.get('sort') || 'newest');
  
  const categories = ['Food', 'Clothing', 'Electronics', 'Books', 'Services', 'Other'];
  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Build query params
        const params = new URLSearchParams();
        if (categoryFilter) params.append('category', categoryFilter);
        if (shopFilter) params.append('shop', shopFilter);
        if (priceMin) params.append('minPrice', priceMin);
        if (priceMax) params.append('maxPrice', priceMax);
        if (sortOption) params.append('sort', sortOption);
        
        const response = await axios.get(`${API_URL}/api/products/1584?${params.toString()}`);
        
        // Filter by search term client-side
        let filtered = response.data.products;
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          filtered = filtered.filter((product: Product) => 
            product.name.toLowerCase().includes(search) || 
            product.description.toLowerCase().includes(search)
          );
        }
        
        setProducts(filtered);
        setError(null);
      } catch (err) {
        setError('Failed to fetch products. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    
    // Update search params
    const params: Record<string, string> = {};
    if (searchTerm) params.search = searchTerm;
    if (categoryFilter) params.category = categoryFilter;
    if (shopFilter) params.shop = shopFilter;
    if (priceMin) params.minPrice = priceMin;
    if (priceMax) params.maxPrice = priceMax;
    if (sortOption) params.sort = sortOption;
    
    setSearchParams(params);
  }, [API_URL, categoryFilter, shopFilter, priceMin, priceMax, sortOption]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Searching is handled in the useEffect
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setShopFilter('');
    setPriceMin('');
    setPriceMax('');
    setSortOption('newest');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Products
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Browse products from university shops
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 bg-white p-4 rounded-lg shadow">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="col-span-1 md:col-span-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button 
                  type="submit"
                  className="absolute inset-y-0 right-0 px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
                >
                  Search
                </button>
              </div>
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="price-range" className="block text-sm font-medium text-gray-700 mb-1">
                Price Range
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                />
                <span className="flex items-center">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                id="sort"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </form>
          
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={resetFilters}
              className="text-sm text-gray-600 hover:text-indigo-600"
            >
              Reset Filters
            </button>
            
            <span className="text-sm text-gray-600">
              {products.length} product{products.length !== 1 ? 's' : ''} found
            </span>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
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
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter parameters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
            {products.map((product) => (
              <Link key={product._id} to={`/products/${product._id}`} className="group">
                <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
                    <img
                      src={product.images[0] || 'https://via.placeholder.com/300?text=No+Image'}
                      alt={product.name}
                      className="w-full h-64 object-center object-cover group-hover:opacity-75"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex-1">
                      <h3 className="text-sm text-gray-700 font-medium">{product.name}</h3>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-medium text-gray-900">${product.price.toFixed(2)}</p>
                        <div className="flex items-center">
                          <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="ml-1 text-sm text-gray-500">{product.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">{product.shop.name}</p>
                      {!product.inStock && (
                        <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Out of stock
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;