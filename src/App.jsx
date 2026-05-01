import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';

import MadhuraSnack from './pages/MadhuraSnack';
import BalajiSack from './pages/BalajiSack';
import VishalSnack from './pages/VishalSnack';
import KunalUlwe from './pages/KunalUlwe';
import FriendsSnack from './pages/FriendsSnack';
import ShopVisit from './pages/ShopVisit';
import CustomerFeedback from './pages/CustomerFeedback';
import AssignedComplain from './pages/AssignedComplain';
import ComplainResolution from './pages/ComplainResolution';
import HelpTicket from './pages/HelpTicket';
import TraderInvoices from './pages/TraderInvoices';
import { useAuthStore } from './store/authStore';

function App() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <div className="min-h-screen">
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />

            {/* Inventory */}
            <Route path="inventory" element={<Navigate to="/inventory/madhura" replace />} />
            <Route path="inventory/madhura" element={<MadhuraSnack />} />
            <Route path="inventory/balaji" element={<BalajiSack />} />
            <Route path="inventory/vishal" element={<VishalSnack />} />
            <Route path="inventory/kunal" element={<KunalUlwe />} />
            <Route path="inventory/friends" element={<FriendsSnack />} />

            {/* Operations */}
            <Route path="shop-visit" element={<ShopVisit />} />
            <Route path="customer-feedback" element={<CustomerFeedback />} />
            <Route path="assigned-complain" element={<AssignedComplain />} />
            <Route path="complain-resolution" element={<ComplainResolution />} />
            <Route path="help-ticket" element={<HelpTicket />} />
            <Route path="trader-invoices" element={<TraderInvoices />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;