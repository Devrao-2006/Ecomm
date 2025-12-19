import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import api from '../api/axios';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const res = await api.get('/auth/google/url');
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        setError('Google login is not configured.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to start Google login');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '440px', marginTop: '2.5rem' }}>
      <h2 style={{ marginBottom: '0.5rem' }}>Welcome back</h2>
      <p style={{ marginBottom: '1.25rem', color: '#4b5563' }}>Sign in to continue shopping and manage your orders.</p>
      {error && <div style={{ color: 'red', marginBottom: '0.75rem' }}>{error}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '0.6rem', marginTop: '0.25rem', borderRadius: '0.375rem', border: '1px solid #d1d5db' }}
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.6rem', marginTop: '0.25rem', borderRadius: '0.375rem', border: '1px solid #d1d5db' }}
          />
        </div>
        <button type="submit" className="btn full" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div style={{ display: 'flex', alignItems: 'center', margin: '0.75rem 0' }}>
        <div style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
        <span style={{ margin: '0 0.75rem', fontSize: '0.8rem', color: '#6b7280' }}>OR</span>
        <div style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
      </div>
      <button type="button" className="btn full google" onClick={handleGoogleLogin} disabled={googleLoading}>
        {googleLoading ? 'Redirecting...' : 'Continue with Google'}
      </button>
      <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
        Don&apos;t have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}