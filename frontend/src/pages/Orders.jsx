import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function loadOrders() {
      const res = await api.get('/orders/me');
      setOrders(res.data.orders);
    }
    loadOrders();
  }, []);

  return (
    <div className="container" style={{ paddingTop: '1.5rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>My Orders</h2>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {orders.map((order) => (
            <div key={order._id} style={{ backgroundColor: '#fff', padding: '0.75rem', borderRadius: '0.5rem' }}>
              <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>
                Order #{order._id.slice(-6)} - {order.status}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '0.5rem' }}>
                {new Date(order.createdAt).toLocaleString()}
              </div>
              <ul style={{ paddingLeft: '1.25rem', margin: 0, marginBottom: '0.5rem' }}>
                {order.items.map((item, idx) => (
                  <li key={`${order._id}-${idx}`}>
                    {item.quantity} x ${item.price.toFixed(2)}
                  </li>
                ))}
              </ul>
              <div style={{ fontWeight: 600 }}>Total: ${order.totalAmount.toFixed(2)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}