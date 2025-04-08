import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import Layout from "./routes/Layout";
import Homepage from "./routes/Homepage";
import Login from "./routes/Login";
import Register from "./routes/Register";
import Profile from "./routes/Profile";
import EditProfile from "./routes/EditProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./routes/admin/AdminDashboard";
import UsersManagement from "./routes/admin/UsersManagement";
import ShopManagement from "./routes/admin/ShopManagement";
import EventManagement from "./routes/admin/EventManagement";
import ServiceManagement from "./routes/admin/ServiceManagement";
import SellerManagement from "./routes/admin/SellerManagement";
//import RegistrationInbox from "./routes/admin/RegistrationInbox";
import Events from './routes/Events';
import Shops from './routes/Shops';
import CreateShop from './routes/CreateShop';
import ShopDetail from './routes/ShopDetail';
import ProductDetail from './routes/ProductDetail';
import CreateProduct from './routes/CreateProduct';
import ProductPages from './routes/ProductDetail';
import ProductPage from './routes/ProductPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProfileProvider>
        <Router>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Homepage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/events" element={<Events />} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
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
              <Route path="/shops" element={<Shops />} />
              <Route path="/shops/create" element={
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
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/productpages" element={<ProductPages />} />
              <Route path="/productpages/:id" element={<ProductPage />} />
            </Route>
          </Routes>
        </Router>
      </ProfileProvider>
    </AuthProvider>
  );
};

export default App;