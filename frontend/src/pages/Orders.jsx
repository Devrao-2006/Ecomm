import React, { useState, useEffect } from 'react';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api/axios';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/me');
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderDetails = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'badge-success';
      case 'shipped':
        return 'badge-accent';
      case 'processing':
        return 'badge-warning';
      case 'pending':
        return 'badge-outline';
      case 'cancelled':
        return 'badge-error';
      default:
        return 'badge-outline';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="page-container py-12">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="page-container py-12">
          <div className="empty-state">
            <div className="w-24 h-24 rounded-full bg-[var(--surface)] flex items-center justify-center mx-auto mb-4">
              <Package className="w-12 h-12 text-[var(--text-muted)]" />
            </div>
            <h3>No orders yet</h3>
            <p>Start shopping to see your order history here</p>
            <a href="/products" className="btn btn-primary">
              Browse Products
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="page-container py-12">
        <h1 className="text-4xl font-bold mb-8">My Orders</h1>

        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrders.has(order._id);
            const orderDate = new Date(order.createdAt || order.orderDate || Date.now());

            return (
              <div key={order._id} className="card">
                {/* Order Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        Order #{order.orderNumber || order._id?.slice(-8) || 'N/A'}
                      </h3>
                      <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                        {order.status || 'Pending'}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">
                      Placed on {orderDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4">
                    <div className="text-right">
                      <p className="text-sm text-[var(--text-muted)]">Total</p>
                      <p className="text-xl font-bold">
                        ${(order.totalAmount || order.total || 0).toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleOrderDetails(order._id)}
                      className="btn btn-ghost btn-sm"
                      aria-label={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Order Details (Expanded) */}
                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-gray-200 animate-fade-in">
                    {/* Order Items */}
                    <h4 className="font-semibold mb-4">Order Items</h4>
                    <div className="space-y-3 mb-6">
                      {order.items?.map((item, index) => {
                        const product = item.product || item;
                        return (
                          <div key={index} className="flex gap-3 items-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={product.imageUrl || product.image || 'https://via.placeholder.com/64'}
                                alt={product.name || product.title || 'Product'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/64?text=No+Image';
                                }}
                              />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{product.name || product.title || 'Product'}</p>
                              <p className="text-sm text-[var(--text-muted)]">
                                Quantity: {item.quantity || 1}
                              </p>
                            </div>
                            <p className="font-semibold">
                              ${((product.price || item.price || 0) * (item.quantity || 1)).toFixed(2)}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                      <div>
                        <h4 className="font-semibold mb-2">Shipping Address</h4>
                        <p className="text-sm text-[var(--text-muted)]">
                          {order.shippingAddress.line1}<br />
                          {order.shippingAddress.city}, {order.shippingAddress.zip}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}