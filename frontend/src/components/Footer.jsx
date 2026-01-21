import React from 'react';
<<<<<<< HEAD
import { Link } from 'react-router-dom';
import { ShoppingBag, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--primary)] text-white mt-auto">
      <div className="page-container">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="w-6 h-6" />
              <span className="text-xl font-bold">ShopHub</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              Your trusted online marketplace for quality products at great prices. Shop with confidence.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-gray-300 hover:text-white transition-colors text-sm">
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Returns & Refunds
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-gray-300 text-sm">
                <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <a href="mailto:support@shophub.com" className="hover:text-white transition-colors">
                  support@shophub.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-gray-300 text-sm">
                <Phone className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <a href="tel:+1234567890" className="hover:text-white transition-colors">
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-start gap-3 text-gray-300 text-sm">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>123 Commerce St, Suite 100<br />City, State 12345</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-300">
            <p>&copy; {currentYear} ShopHub. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
=======

export default function Footer() {
  return (
    <footer style={{ marginTop: '2rem', padding: '1rem 0', backgroundColor: '#111827', color: '#9ca3af' }}>
      <div className="container" style={{ textAlign: 'center', fontSize: '0.9rem' }}>
        <div>Ecomm Store &copy; {new Date().getFullYear()}</div>
>>>>>>> e8e9bc35347c166c03829b7a59dca062879bb374
      </div>
    </footer>
  );
}