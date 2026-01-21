import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Loader } from 'lucide-react';

export default function ProductCard({ product, onAddToCart }) {
  // Handle different property names from backend - MongoDB uses _id, some may use id
  const productId = product._id || product.id;
  const productName = product.name || product.title || 'Product';
  const productImage = product.image || product.imageUrl || 'https://via.placeholder.com/300';
  const productRating = product.rating || 0;
  const inStock = product.stock !== undefined ? product.stock > 0 : true;
  const productPrice = product.price || 0;
  const productCategory = product.category;

  const [adding, setAdding] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      setAdding(true);
      try {
        // Add 1 second delay for loading animation
        await Promise.all([
          onAddToCart(product),
          new Promise(resolve => setTimeout(resolve, 1000))
        ]);
      } finally {
        setAdding(false);
      }
    }
  };

  return (
    <Link to={`/products/${productId}`}>
      <div className={`card card-interactive h-full flex flex-col group relative ${adding ? 'pointer-events-none' : ''}`}>
        {/* Loading Overlay */}
        {adding && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
            <div className="flex flex-col items-center gap-2">
              <Loader className="w-8 h-8 animate-spin text-[var(--accent)]" />
              <span className="text-sm font-medium text-[var(--text-muted)]">Adding to cart...</span>
            </div>
          </div>
        )}
        <div className="relative overflow-hidden rounded-lg mb-4 bg-gray-100" style={{ aspectRatio: '1/1' }}>
          <img
            src={productImage}
            alt={productName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300?text=No+Image';
            }}
          />

          {/* Category Badge */}
          {productCategory && (
            <div className="absolute top-2 left-2">
              <span className="badge badge-primary">{productCategory}</span>
            </div>
          )}

          {/* Stock Badge */}
          {!inStock && (
            <div className="absolute top-2 right-2">
              <span className="badge badge-error">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-lg font-semibold text-[var(--text-main)] mb-2 line-clamp-2 group-hover:text-[var(--accent)] transition-colors">
            {productName}
          </h3>

          {/* Rating */}
          {productRating > 0 && (
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(productRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                    }`}
                />
              ))}
              <span className="text-sm text-[var(--text-muted)] ml-1">
                ({productRating.toFixed(1)})
              </span>
            </div>
          )}

          {/* Price and Add to Cart */}
          <div className="flex items-center justify-between mt-auto">
            <div className="text-2xl font-bold text-[var(--primary)]">
              ${typeof productPrice === 'number' ? productPrice.toFixed(2) : productPrice}
            </div>

            {inStock && onAddToCart && (
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="btn btn-accent btn-sm disabled:opacity-50"
                aria-label="Add to cart"
              >
                {adding ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <ShoppingCart className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}