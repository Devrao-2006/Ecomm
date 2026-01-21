import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import useAuth from '../hooks/useAuth';
import { ShoppingCart, Search, Menu, X, User, LogOut, Package, ShoppingBag } from 'lucide-react';

export default function Navbar() {
  const { cartCount, setIsOpen } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleCartClick = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate('/cart');
    }
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="page-container">
          <div className="flex items-center justify-between h-[var(--nav-height)]">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 text-2xl font-bold text-[var(--primary)] hover:opacity-80 transition-opacity"
            >
              <ShoppingBag className="w-7 h-7" />
              <span>ShopHub</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                to="/"
                className="text-base font-medium text-[var(--text-main)] hover:text-[var(--accent)] transition-colors"
              >
                Home
              </Link>
              <Link
                to="/products"
                className="text-base font-medium text-[var(--text-main)] hover:text-[var(--accent)] transition-colors"
              >
                Products
              </Link>
              {user?.isAdmin && (
                <Link
                  to="/admin"
                  className="text-base font-medium text-[var(--text-main)] hover:text-[var(--accent)] transition-colors"
                >
                  Admin
                </Link>
              )}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-6">
              {/* Search Icon */}
              <button
                className="text-[var(--text-main)] hover:text-[var(--accent)] transition-colors"
                title="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* User Menu or Login */}
              {!user ? (
                <Link
                  to="/login"
                  className="flex items-center gap-2 text-base font-medium text-[var(--text-main)] hover:text-[var(--accent)] transition-colors"
                >
                  <User className="w-5 h-5" />
                  Login
                </Link>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 text-base font-medium text-[var(--text-main)] hover:text-[var(--accent)] transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span>{user.name}</span>
                  </button>

                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden animate-fade-in">
                      <Link
                        to="/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-[var(--text-main)] hover:bg-[var(--surface)] transition-colors"
                      >
                        <Package className="w-5 h-5" />
                        <span>My Orders</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-[var(--text-main)] hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Actions: Cart & Menu */}
            <div className="flex items-center gap-4">
              {/* Cart - Visible on all screens */}
              <Link
                to={user ? "/cart" : "/login"}
                className="relative btn btn-ghost btn-icon"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {user && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[var(--accent)] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 text-[var(--text-main)] hover:text-[var(--accent)] transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 animate-fade-in">
            <div className="page-container py-4 flex flex-col gap-4">
              <Link
                to="/"
                className="text-base font-medium text-[var(--text-main)] hover:text-[var(--accent)] transition-colors py-2"
                onClick={closeMobileMenu}
              >
                Home
              </Link>
              <Link
                to="/products"
                className="text-base font-medium text-[var(--text-main)] hover:text-[var(--accent)] transition-colors py-2"
                onClick={closeMobileMenu}
              >
                Products
              </Link>

              {user?.isAdmin && (
                <Link
                  to="/admin"
                  className="text-base font-medium text-[var(--text-main)] hover:text-[var(--accent)] transition-colors py-2"
                  onClick={closeMobileMenu}
                >
                  Admin
                </Link>
              )}

              <hr className="border-gray-200" />

              {/* Mobile Auth Section */}
              {!user ? (
                <Link
                  to="/login"
                  className="flex items-center gap-2 text-base font-medium text-[var(--accent)] py-2"
                  onClick={closeMobileMenu}
                >
                  <User className="w-5 h-5" />
                  Login
                </Link>
              ) : (
                <>
                  <div className="text-base font-medium text-[var(--text-main)] flex items-center gap-2 py-2">
                    <User className="w-5 h-5" />
                    {user.name}
                  </div>
                  <Link
                    to="/orders"
                    className="flex items-center gap-2 text-base font-medium text-[var(--text-main)] hover:text-[var(--accent)] transition-colors py-2"
                    onClick={closeMobileMenu}
                  >
                    <Package className="w-5 h-5" />
                    My Orders
                  </Link>
                  <button
                    onClick={() => { handleLogout(); closeMobileMenu(); }}
                    className="flex items-center gap-2 text-base font-medium text-red-600 hover:text-red-700 transition-colors text-left py-2"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              )}

              <hr className="border-gray-200" />

              {/* Mobile Cart */}
              <button
                onClick={() => { handleCartClick(); closeMobileMenu(); }}
                className="flex items-center justify-between text-base font-medium text-[var(--text-main)] hover:text-[var(--accent)] transition-colors py-2"
              >
                <span className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Cart
                </span>
                {cartCount > 0 && (
                  <span className="badge badge-accent">{cartCount}</span>
                )}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-[var(--nav-height)]" />
    </>
  );
}