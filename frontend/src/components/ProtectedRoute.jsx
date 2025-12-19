import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { isAdmin } from '../utils/jwt';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin(user)) {
    return <Navigate to="/" replace />;
  }

  return children;
}