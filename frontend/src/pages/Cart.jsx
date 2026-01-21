import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Loader, AlertTriangle } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const navigate = useNavigate();
  const { 
    items: cartItems, 
    loading, 
    updateQuantity, 
    removeFromCart,
    cartTotal
  } = useCart();
  const [updatingItemId, setUpdatingItemId] = React.useState(null);

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      setUpdatingItemId(itemId);
      // Add 500ms minimum delay for loading animation
      await Promise.all([
        updateQuantity(itemId, newQuantity),
        new Promise(resolve => setTimeout(resolve, 500))
      ]);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      setUpdatingItemId(itemId);
      // Add 500ms minimum delay for loading animation
      await Promise.all([
        removeFromCart(itemId),
        new Promise(resolve => setTimeout(resolve, 500))
      ]);
    } catch (error) {
      console.error('Failed to remove item:', error);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const subtotal = cartTotal;
  const tax = subtotal * 0.1; // 10% tax
  const shipping = subtotal > 50 ? 0 : 10;
  const total = subtotal + tax + shipping;
  
  // Check if any items have stock issues
  const hasStockIssues = cartItems.some(item => {
    const product = item.productId || item;
    const stock = product.stock;
    const quantity = item.quantity || 1;
    return stock !== undefined && (stock <= 0 || quantity > stock);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="page-container py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gray-200 rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="page-container py-12">
          <div className="empty-state">
            <div className="w-24 h-24 rounded-full bg-[var(--surface)] flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-12 h-12 text-[var(--text-muted)]" />
            </div>
            <h3>Your cart is empty</h3>
            <p>Start adding some products to your cart!</p>
            <Link to="/products" className="btn btn-primary">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* Loading Overlay for updating cart */}
      {updatingItemId && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 bg-white p-8 rounded-2xl shadow-xl">
            <Loader className="w-12 h-12 animate-spin text-[var(--accent)]" />
            <span className="text-lg font-medium text-[var(--text-main)]">Updating cart...</span>
          </div>
        </div>
      )}
      
      <div className="page-container py-12">
        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const product = item.productId || item;
              const productId = product._id || product.id;
              const productName = product.name || item.name || 'Product';
              const productPrice = product.price || item.price || 0;
              const productImage = product.imageUrl || product.image || 'https://via.placeholder.com/100';
              const quantity = item.quantity || 1;
              const stock = product.stock;
              const isUpdating = updatingItemId === item._id;
              const isOutOfStock = stock !== undefined && stock <= 0;
              const exceedsStock = stock !== undefined && quantity > stock;

              return (
                <div key={item._id} className={`card ${isOutOfStock ? 'border-red-300 bg-red-50' : exceedsStock ? 'border-yellow-300 bg-yellow-50' : ''}`}>
                  {/* Stock Warning */}
                  {isOutOfStock && (
                    <div className="flex items-center gap-2 text-red-600 text-sm mb-3 pb-3 border-b border-red-200">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-medium">Out of Stock</span>
                    </div>
                  )}
                  {exceedsStock && !isOutOfStock && (
                    <div className="flex items-center gap-2 text-yellow-700 text-sm mb-3 pb-3 border-b border-yellow-200">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-medium">Only {stock} available - reduce quantity to checkout</span>
                    </div>
                  )}
                  
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <Link to={`/products/${productId}`} className="flex-shrink-0">
                      <img
                        src={productImage}
                        alt={productName}
                        className={`w-24 h-24 object-cover rounded-lg ${isOutOfStock ? 'opacity-50' : ''}`}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                        }}
                      />
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <Link
                          to={`/products/${productId}`}
                          className={`text-lg font-semibold hover:text-[var(--accent)] transition-colors ${isOutOfStock ? 'text-gray-400' : ''}`}
                        >
                          {productName}
                        </Link>
                        {product.category && (
                          <p className="text-sm text-[var(--text-muted)] mt-1">
                            {product.category}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => handleUpdateQuantity(item._id, quantity - 1)}
                            disabled={isUpdating || quantity <= 1}
                            className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                            aria-label="Decrease quantity"
                          >
                            {isUpdating ? <Loader className="w-4 h-4 animate-spin" /> : <Minus className="w-4 h-4" />}
                          </button>
                          <span className="px-4 py-1 font-semibold">{quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item._id, quantity + 1)}
                            disabled={isUpdating}
                            className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                            aria-label="Increase quantity"
                          >
                            {isUpdating ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Price */}
                        <div className={`text-xl font-bold ${isOutOfStock ? 'text-gray-400' : ''}`}>
                          ${(productPrice * quantity).toFixed(2)}
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item._id)}
                          disabled={isUpdating}
                          className="text-red-600 hover:text-red-700 p-2 disabled:opacity-50"
                          aria-label="Remove item"
                        >
                          {isUpdating ? <Loader className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-sm text-[var(--accent)]">
                    Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                  </p>
                )}
                <div className="border-t border-gray-200 pt-3 flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              {hasStockIssues && (
                <div className="flex items-center gap-2 text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>Please resolve stock issues before checkout</span>
                </div>
              )}

              <button
                onClick={() => navigate('/checkout')}
                disabled={hasStockIssues}
                className="btn btn-primary btn-lg w-full mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </button>

              <Link
                to="/products"
                className="btn btn-outline w-full"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
=======
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
>>>>>>> e8e9bc35347c166c03829b7a59dca062879bb374
    </div>
  );
}