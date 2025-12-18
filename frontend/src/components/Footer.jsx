import React from 'react';

export default function Footer() {
  return (
    <footer style={{ marginTop: '2rem', padding: '1rem 0', backgroundColor: '#111827', color: '#9ca3af' }}>
      <div className="container" style={{ textAlign: 'center', fontSize: '0.9rem' }}>
        <div>Ecomm Store &copy; {new Date().getFullYear()}</div>
      </div>
    </footer>
  );
}