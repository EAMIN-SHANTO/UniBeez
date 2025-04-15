import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { NotificationProvider } from './context/NotificationContext';
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

const App: React.FC = () => {
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
                <Route path="/updateproductdetails/:id" element={<UpdateProductDetails />} />
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