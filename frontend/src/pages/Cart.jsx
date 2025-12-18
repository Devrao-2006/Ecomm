import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useCart from '../hooks/useCart';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, total } = useCart();
  const navigate = useNavigate();

  return (
    <div className="container" style={{ paddingTop: '1.5rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>Cart</h2>
      {items.length === 0 ? (
        <p>
          Your cart is empty. <Link to="/products">Browse products</Link>
        </p>
      ) : (
        <>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {items.map((item) => (
              <div
                key={item.productId}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>{item.name}</div>
                  <div style={{ fontSize: '0.9rem', color: '#4b5563' }}>
                    ${item.price.toFixed(2)} x
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                      style={{ width: '60px', marginLeft: '0.5rem' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                  <div>${(item.price * item.quantity).toFixed(2)}</div>
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={() => removeFromCart(item.productId)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 600 }}>Total: ${total.toFixed(2)}</div>
            <button type="button" className="btn" onClick={() => navigate('/checkout')}>
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}