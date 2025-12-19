import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useCart from '../hooks/useCart';
import useAuth from '../hooks/useAuth';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAdd = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart(product, 1);
  };

  console.log('IMAGE FIELD:', product.image);
  console.log('FULL PRODUCT:', product);

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '0.5rem', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
      {product.image && (
        <img
          src={`http://localhost:5000${product.image}`}
          alt={product.name}
          style={{
            width: '100%',
            height: '180px',
            objectFit: 'cover',
            borderRadius: '0.5rem',
            marginBottom: '0.75rem'
          }}
        />
      )}
      <Link to={`/products/${product._id}`} style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
        {product.name}
      </Link>
      <div style={{ marginBottom: '0.5rem', color: '#4b5563' }}>${product.price.toFixed(2)}</div>
      <button type="button" className="btn full" onClick={handleAdd}>
        Add to cart
      </button>
    </div>
  );
}