import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { NotificationProvider } from './context/NotificationContext';
import { API_URL, getApiUrl } from './config';
import axios from 'axios';
import Layout from "./pages/Layout";
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersManagement from "./pages/admin/UsersManagement";
import ShopManagement from "./pages/admin/ShopManagement";
import EventManagement from "./pages/admin/EventManagement";
import ServiceManagement from "./pages/admin/ServiceManagement";
import SellerManagement from "./pages/admin/SellerManagement";
// import RegistrationInbox from "./routes/admin/RegistrationInbox";
import Events from './pages/Events';
import CurrentEvent from './pages/CurrentEvent';
import Shops from './pages/Shops';
import CreateShop from './pages/CreateShop';
import ShopDetail from './pages/ShopDetail';
import ProductDetail from './pages/ProductDetail';
import CreateProduct from './pages/CreateProduct';
import EditShop from './pages/EditShop';
import ProductPage from './pages/ProductPage'; 
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import { CartProvider } from './context/CartContext'; 
import UpdateProductDetails from './pages/UpdateProductDetails'; 
import FeatureProduct from './pages/FeatureProduct';
import PaymentPage from './pages/PaymentPage';
import OrderConfirmation from './pages/OrderConfirmation';
import ServicesPage from './pages/ServicesPage';
import FeaturedProductmanagement from './pages/admin/FeaturedProductManagement';
import Wishlist from './pages/Wishlist';
import CustomProductRequestForm from './pages/CustomProductRequestForm';
import ShopCustomRequestsDashboard from './pages/ShopCustomRequestsDashboard';
// New imports for order management
import ShopOrdersPage from './pages/ShopOrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import UserOrdersPage from './pages/UserOrdersPage';


const App: React.FC = () => {
  useEffect(() => {
    // Log the API URL at application startup for debugging
    console.log('🔥 APP INIT - API URL:', API_URL);
    console.log('🔥 APP INIT - Hostname:', window.location.hostname);
    console.log('🔥 APP INIT - Origin:', window.location.origin);
    
    // Set up axios defaults at app level
    axios.defaults.baseURL = API_URL;
    axios.defaults.withCredentials = true;
    axios.defaults.headers.common['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    axios.defaults.headers.common['Pragma'] = 'no-cache';
    
    // Monitor all axios requests
    axios.interceptors.request.use(config => {
      if (config.url) {
        // For absolute URLs, make sure they use the production API
        if (config.url.includes('localhost:3000')) {
          console.warn('⚠️ Intercepted localhost API call in axios:', config.url);
          config.url = config.url.replace('http://localhost:3000', API_URL);
          console.log('🔄 Redirected to:', config.url);
        }
        
        // For relative URLs, make sure they are correctly prefixed
        if (!config.url.includes('://') && !config.baseURL) {
          console.warn('⚠️ Relative URL without baseURL:', config.url);
          config.baseURL = API_URL;
        }
      }
      return config;
    });
    
    // Monitor axios responses
    axios.interceptors.response.use(
      response => {
        console.log(`✅ [${response.config.method?.toUpperCase()}] ${response.config.url}: ${response.status}`);
        return response;
      },
      error => {
        console.error('❌ Axios error:', error.message);
        if (error.response) {
          console.error(`❌ [${error.config.method?.toUpperCase()}] ${error.config.url}: ${error.response.status}`);
          console.error('Response data:', error.response.data);
        } else if (error.request) {
          console.error(`❌ Request made but no response received: ${error.config.url}`);
        }
        return Promise.reject(error);
      }
    );
    
    // Force a configuration check to show in console
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      console.log('⚠️ PRODUCTION BUILD - Ensuring all API calls go to:', API_URL);
      
      // Check if fetch has been intercepted properly
      if (window.fetch.toString().includes('function fetch() { [native code] }')) {
        console.warn('⚠️ FETCH INTERCEPTOR NOT INSTALLED CORRECTLY!');
      } else {
        console.log('✅ Fetch interceptor correctly installed');
      }
    }
  }, []);

  return (
    <AuthProvider>
      <ProfileProvider>
        <Router>
          <CartProvider>
          <NotificationProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Navigate to="/21301429" replace />} />
                <Route path="/21301429" element={<Homepage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/events-21301429" element={<Events />} />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  } />
                <Route path="/profile/edit" element={
                  <ProtectedRoute>
                    <EditProfile />
                  </ProtectedRoute>
                } />
                <Route path="/wishlist" element={
                  <ProtectedRoute>
                    <Wishlist />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <ProtectedRoute adminOnly>
                    <UsersManagement />
                  </ProtectedRoute>
                } />
                <Route path="/admin/shops" element={
                  <ProtectedRoute adminOnly>
                    <ShopManagement />
                  </ProtectedRoute>
                } />
                <Route path="/admin/events" element={
                  <ProtectedRoute adminOnly>
                    <EventManagement />
                  </ProtectedRoute>
                } />
                <Route path="/admin/services" element={
                  <ProtectedRoute adminOnly>
                    <ServiceManagement />
                  </ProtectedRoute>
                } />
                <Route path="/admin/sellers" element={
                  <ProtectedRoute adminOnly>
                    <SellerManagement />
                  </ProtectedRoute>
                } />

                <Route path="shops" element={<Shops />} />
                <Route path="shops/create" element={
                  <ProtectedRoute>
                    <CreateShop />
                  </ProtectedRoute>
                } />
                <Route path="/shops/:id" element={<ShopDetail />} />
                
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/products/create/:shopId" element={
                  <ProtectedRoute>
                    <CreateProduct />
                  </ProtectedRoute>
                } />
                <Route path="/shops/edit/:id" element={
                  <ProtectedRoute>
                    <EditShop />
                  </ProtectedRoute>
                } />
                
                {/* Custom Product Request Routes */}
                <Route path="/shops/:shopId/request-custom-product" element={
                  <ProtectedRoute>
                    <CustomProductRequestForm />
                  </ProtectedRoute>
                } />
                <Route path="/shops/:shopId/custom-requests" element={
                  <ProtectedRoute>
                    <ShopCustomRequestsDashboard />
                  </ProtectedRoute>
                } />
                

                <Route path="/current-event-21301429" element={<CurrentEvent />} />
                <Route path="*" element={
                  <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                      <p className="text-gray-600">Page not found</p>
                    </div>
                  </div>
                } />
                <Route path="/productpage" element={<ProductPage />} />
                <Route path="/updateproductpage/:id" element={
                  <ProtectedRoute>
                    <UpdateProductDetails />
                  </ProtectedRoute>
                } />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
                <Route path="/updateproductdetails/:id" element={<UpdateProductDetails />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/admin/featured-product-management" element={
                  <ProtectedRoute >
                    <FeaturedProductmanagement />
                  </ProtectedRoute>
                } />
                <Route path="/feature-product/:id" element={
                  <ProtectedRoute>
                    <FeatureProduct />
                  </ProtectedRoute>
                } />
                
                {/* New Order Management Routes */}
                <Route path="/shop-orders" element={
                  <ProtectedRoute>
                    <ShopOrdersPage />
                  </ProtectedRoute>
                } />
                <Route path="/orders/:id" element={
                  <ProtectedRoute>
                    <OrderDetailsPage />
                  </ProtectedRoute>
                } />
                <Route path="/my-orders" element={
                  <ProtectedRoute>
                    <UserOrdersPage />
                  </ProtectedRoute>
                } />
              </Route>
            </Routes>
          </NotificationProvider>
          </CartProvider>
        </Router>
      </ProfileProvider>
    </AuthProvider>
  );
};

export default App;