import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
// import RegistrationInbox from "./routes/admin/RegistrationInbox";
import Events from './routes/Events';
import CurrentEvent from './routes/CurrentEvent';
import { NotificationProvider } from './context/NotificationContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProfileProvider>
        <NotificationProvider>
          <Router>
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
                <Route path="/current-event-21301429" element={<CurrentEvent />} />
                <Route path="*" element={
                  <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                      <p className="text-gray-600">Page not found</p>
                    </div>
                  </div>
                } />
              </Route>
            </Routes>
          </Router>
        </NotificationProvider>
      </ProfileProvider>
    </AuthProvider>
  );
};

export default App; 