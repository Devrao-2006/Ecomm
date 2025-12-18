import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <section style={{ display: 'grid', gap: '2rem', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Modern E-commerce Experience</h1>
          <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>
            Discover high quality products with a smooth checkout flow, secure payments, and fast performance.
          </p>
          <Link to="/products" className="btn">
            Start shopping
          </Link>
        </div>
      </section>
    </div>
  );
}