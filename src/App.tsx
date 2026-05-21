/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ScrollToTop from "./components/layout/ScrollToTop";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import PaymentStatus from "./pages/PaymentStatus";
import ContactUs from "./pages/ContactUs";
import TermsConditions from "./pages/TermsConditions";
import RefundsCancellations from "./pages/RefundsCancellations";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle } from "lucide-react";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="relative min-h-screen bg-dark">
          <Toaster 
            position="bottom-center"
            toastOptions={{
              style: {
                background: '#151619',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '1rem',
              },
            }}
          />
          
          <Navbar />
          
          <main>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/payment-status" element={<PaymentStatus />} />
                <Route path="/contact-us" element={<ContactUs />} />
                <Route path="/terms-conditions" element={<TermsConditions />} />
                <Route path="/refunds-cancellations" element={<RefundsCancellations />} />
              </Routes>
            </AnimatePresence>
          </main>

          <Footer />

          {/* Floating WhatsApp Button */}
          <a 
            href="https://wa.me/917676394923?text=Hi%20I%20want%20to%20buy%20the%20reel%20bundle" 
            target="_blank" 
            rel="noopener noreferrer"
            className="fixed bottom-8 right-8 z-40 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform group"
          >
             <MessageCircle className="text-white fill-current" />
             <span className="absolute right-full mr-4 bg-white text-dark px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
               WhatsApp Support
             </span>
          </a>
        </div>
      </Router>
    </AuthProvider>
  );
}
