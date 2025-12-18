import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useCart from '../hooks/useCart';
import { isAdmin } from '../utils/jwt';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <nav style={{ backgroundColor: '#111827', color: '#fff', padding: '0.75rem 1rem' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ fontWeight: 700, fontSize: '1.1rem' }}>Ecomm</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/products">Shop</Link>
          {user && <Link to="/orders">Orders</Link>}
          {user && isAdmin(user) && <Link to="/admin">Admin</Link>}
          <Link to="/cart">Cart {user && count > 0 && `(${count})`}</Link>
          {!user && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
          {user && (
            <>
              <span style={{ fontSize: '0.9rem' }}>{user.name}</span>
              <button type="button" className="btn secondary" onClick={logout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}