import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import useCart from '../hooks/useCart';
import useAuth from '../hooks/useAuth';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.product);
      } catch (e) {
        setError('Product not found');
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  const handleAdd = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart(product, 1);
  };

  if (loading) return <div className="container">Loading...</div>;
  if (error) return <div className="container" style={{ color: 'red' }}>{error}</div>;
  if (!product) return null;

  return (
    <div className="container" style={{ paddingTop: '1.5rem', display: 'grid', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr', alignItems: 'flex-start' }}>
        {product.images && product.images[0] && (
          <img
            src={product.images[0]}
            alt={product.name}
            style={{ maxWidth: '400px', width: '100%', borderRadius: '0.5rem' }}
          />
        )}
        <div>
          <h2 style={{ marginBottom: '0.5rem' }}>{product.name}</h2>
          <div style={{ marginBottom: '0.75rem', color: '#4b5563' }}>${product.price.toFixed(2)}</div>
          <p style={{ marginBottom: '1rem' }}>{product.description}</p>
          <button type="button" className="btn" onClick={handleAdd}>
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}