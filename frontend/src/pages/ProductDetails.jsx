import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Minus, Plus, Package, Truck, Shield, Loader } from 'lucide-react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [changingQty, setChangingQty] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.product);
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      setAdding(true);
      // Add minimum 1 second delay for loading animation
      const [result] = await Promise.all([
        addToCart(id, quantity),
        new Promise(resolve => setTimeout(resolve, 1000))
      ]);
      // Show success feedback
      // alert('Added to cart successfully!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      navigate('/login');
    } finally {
      setAdding(false);
    }
  };

  const incrementQuantity = async () => {
    if (changingQty) return;
    if (product && product.stock && quantity < product.stock) {
      setChangingQty(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setQuantity(quantity + 1);
      setChangingQty(false);
    } else if (!product.stock) {
      setChangingQty(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setQuantity(quantity + 1);
      setChangingQty(false);
    }
  };

  const decrementQuantity = async () => {
    if (changingQty) return;
    if (quantity > 1) {
      setChangingQty(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setQuantity(quantity - 1);
      setChangingQty(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="page-container py-12">
          <div className="grid md:grid-cols-2 gap-12 animate-pulse">
            <div className="bg-gray-200 rounded-lg h-96" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-6 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white">
        <div className="page-container py-12">
          <div className="empty-state">
            <h3>Product Not Found</h3>
            <p>{error || 'The product you are looking for does not exist.'}</p>
            <button onClick={() => navigate('/products')} className="btn btn-primary">
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const inStock = product.stock !== undefined ? product.stock > 0 : true;
  const rating = product.rating || 0;

  return (
    <div className="min-h-screen bg-white relative">
      {/* Loading Overlay for Add to Cart or Changing Quantity */}
      {(adding || changingQty) && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 bg-white p-8 rounded-2xl shadow-xl">
            <Loader className="w-12 h-12 animate-spin text-[var(--accent)]" />
            <span className="text-lg font-medium text-[var(--text-main)]">
              {adding ? 'Adding to cart...' : 'Updating quantity...'}
            </span>
          </div>
        </div>
      )}

      <div className="page-container py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-8">
          <a href="/products" className="hover:text-[var(--accent)]">Products</a>
          <span>/</span>
          {product.category && (
            <>
              <span>{product.category}</span>
              <span>/</span>
            </>
          )}
          <span className="text-[var(--text-main)] font-medium">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="rounded-lg overflow-hidden bg-gray-100 aspect-square">
              <img
                src={product.imageUrl || product.image || 'https://via.placeholder.com/600'}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600?text=No+Image';
                }}
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {/* Category Badge */}
            {product.category && (
              <span className="badge badge-accent mb-4 w-fit">{product.category}</span>
            )}

            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

            {/* Rating */}
            {rating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                        }`}
                    />
                  ))}
                </div>
                <span className="text-[var(--text-muted)]">({rating.toFixed(1)})</span>
              </div>
            )}

            {/* Price */}
            <div className="text-4xl font-bold text-[var(--primary)] mb-6">
              ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {inStock ? (
                <span className="badge badge-success">In Stock</span>
              ) : (
                <span className="badge badge-error">Out of Stock</span>
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-[var(--text-muted)] leading-relaxed">
                {product.description || 'No description available.'}
              </p>
            </div>

            {/* Quantity Selector */}
            {inStock && (
              <div className="mb-6">
                <label className="form-label mb-2">Quantity</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={decrementQuantity}
                      disabled={changingQty || quantity <= 1}
                      className="p-3 hover:bg-gray-100 transition-colors disabled:opacity-50"
                      aria-label="Decrease quantity"
                    >
                      {changingQty ? <Loader className="w-5 h-5 animate-spin" /> : <Minus className="w-5 h-5" />}
                    </button>
                    <span className="px-6 py-2 font-semibold text-lg">{quantity}</span>
                    <button
                      onClick={incrementQuantity}
                      disabled={changingQty}
                      className="p-3 hover:bg-gray-100 transition-colors disabled:opacity-50"
                      aria-label="Increase quantity"
                    >
                      {changingQty ? <Loader className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                    </button>
                  </div>
                  {product.stock && (
                    <span className="text-sm text-[var(--text-muted)]">
                      {product.stock} available
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!inStock || adding}
              className="btn btn-primary btn-lg w-full mb-4"
            >
              {adding ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Adding to Cart...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </>
              )}
            </button>

            {/* Features */}
            <div className="border-t border-gray-200 pt-6 mt-6 space-y-4">
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Free Shipping</h4>
                  <p className="text-sm text-[var(--text-muted)]">On orders over $50</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Fast Delivery</h4>
                  <p className="text-sm text-[var(--text-muted)]">2-3 business days</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Secure Payment</h4>
                  <p className="text-sm text-[var(--text-muted)]">100% secure transactions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}