import React from 'react';
<<<<<<< HEAD
import HeroBanner from '../components/HeroBanner';
import CategoryCards from '../components/CategoryCards';
import ProductCard from '../components/ProductCard';
import { ArrowRight, Truck, Shield, Clock, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock featured products - will be replaced with API data
const FEATURED_PRODUCTS = [
  {
    id: 1,
    name: 'Wireless Headphones',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
    category: 'Audio',
    rating: 4.8,
    stock: 15
  },
  {
    id: 2,
    name: 'Smart Watch Pro',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
    category: 'Watches',
    rating: 4.6,
    stock: 8
  },
  {
    id: 3,
    name: 'Laptop Backpack',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800',
    category: 'Accessories',
    rating: 4.7,
    stock: 22
  },
  {
    id: 4,
    name: 'Portable Speaker',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=800',
    category: 'Audio',
    rating: 4.5,
    stock: 12
  },
];

const FEATURES = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders over $50'
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: '100% secure checkout'
  },
  {
    icon: Clock,
    title: '24/7 Support',
    description: 'Dedicated support team'
  },
  {
    icon: Award,
    title: 'Quality Guarantee',
    description: '30-day money back'
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroBanner />

      {/* Features Section */}
      <section className="section-sm bg-white border-b border-gray-200">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--accent)]/10 mb-3">
                    <Icon className="w-6 h-6 text-[var(--accent)]" />
                  </div>
                  <h3 className="font-semibold text-[var(--text-main)] mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <CategoryCards />

      {/* Featured Products Section */}
      <section className="section bg-white">
        <div className="page-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
              <p className="text-[var(--text-muted)]">
                Handpicked items just for you
              </p>
            </div>
            <Link
              to="/products"
              className="hidden md:flex items-center gap-2 text-[var(--accent)] font-semibold hover:gap-3 transition-all"
            >
              View All
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid-layout">
            {FEATURED_PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-8 md:hidden">
            <Link to="/products" className="btn btn-outline">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="section bg-gradient-to-r from-[var(--primary)] to-[#334155] text-white">
        <div className="page-container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Stay Updated
            </h2>
            <p className="text-gray-200 text-lg mb-8">
              Subscribe to our newsletter for exclusive deals, new arrivals, and special offers.
            </p>

            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-white text-[var(--text-main)]"
                required
              />
              <button
                type="submit"
                className="btn btn-accent px-8 py-3"
              >
                Subscribe
              </button>
            </form>

            <p className="text-sm text-gray-300 mt-4">
              We respect your privacy. Unsubscribe anytime.
            </p>
          </div>
=======
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
>>>>>>> e8e9bc35347c166c03829b7a59dca062879bb374
        </div>
      </section>
    </div>
  );
}