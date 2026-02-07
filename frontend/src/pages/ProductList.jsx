import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';

export default function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const { addToCart } = useCart();

  const loadProducts = async (pageParam = 1, searchParam = '', categoryParam = '', sortParam = '') => {
    setLoading(true);
    try {
      const res = await api.get('/products', {
        params: { page: pageParam, search: searchParam, category: categoryParam, sort: sortParam }
      });
      setProducts(res.data.items || res.data.products || res.data || []);
      setPage(res.data.pagination?.page || pageParam);
      setPages(res.data.pagination?.pages || 1);
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(1, '', '', '');
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadProducts(1, search, category, sortBy);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setSortBy('');
    loadProducts(1, '', '', '');
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product.id || product._id, 1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="bg-[var(--surface)] border-b border-gray-200">
        <div className="page-container py-8">
          <h1 className="text-4xl font-bold mb-2">All Products</h1>
          <p className="text-[var(--text-muted)] text-lg">
            Discover our complete collection of quality products
          </p>
        </div>
      </div>

      <div className="page-container py-8">
        {/* Search and Filter Bar */}
        <div className="card mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)] w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input pl-12"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative w-full md:w-48">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  loadProducts(1, search, category, e.target.value);
                }}
                className="form-select appearance-none pr-10"
              >
                <option value="">Default Sort</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="rating-desc">Highest Rated</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)] w-5 h-5 pointer-events-none" />
            </div>

            {/* Filter Toggle (Mobile) */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-outline md:hidden"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filters
            </button>

            {/* Search Button */}
            <button type="submit" className="btn btn-primary">
              Search
            </button>

            {/* Clear Filters */}
            {(search || category || sortBy) && (
              <button
                type="button"
                onClick={clearFilters}
                className="btn btn-ghost"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </form>

          {/* Category Filter (Desktop & Mobile Expanded) */}
          {(showFilters || window.innerWidth >= 768) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <label className="form-label mb-2">Category</label>
              <input
                type="text"
                placeholder="Enter category..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-input"
              />
            </div>
          )}

          {/* Active Filters */}
          {(search || category || sortBy) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-[var(--text-muted)] font-medium">
                  Active filters:
                </span>
                {search && (
                  <span className="badge badge-outline">
                    Search: "{search}"
                  </span>
                )}
                {category && (
                  <span className="badge badge-outline">
                    Category: {category}
                  </span>
                )}
                {sortBy && (
                  <span className="badge badge-outline">
                    Sort: {sortBy}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-[var(--text-muted)]">
            {loading ? 'Loading products...' : `${products.length} ${products.length === 1 ? 'product' : 'products'} found`}
          </p>
          {pages > 1 && (
            <p className="text-[var(--text-muted)]">
              Page {page} of {pages}
            </p>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid-layout">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="w-full h-64 bg-gray-200 rounded-lg mb-4" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
                <div className="h-6 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid-layout">
            {products.map((product) => (
              <ProductCard
                key={product._id || product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="w-20 h-20 rounded-full bg-[var(--surface)] flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-[var(--text-muted)]" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No products found</h3>
            <p className="mb-6">
              {search || category
                ? 'Try adjusting your filters or search terms'
                : 'Check back later for new products'}
            </p>
            {(search || category || sortBy) && (
              <button onClick={clearFilters} className="btn btn-primary">
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && products.length > 0 && pages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => loadProducts(page - 1, search, category, sortBy)}
              className="btn btn-outline"
            >
              Previous
            </button>

            <div className="flex items-center gap-2">
              {[...Array(Math.min(pages, 5))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => loadProducts(pageNum, search, category, sortBy)}
                    className={`w-10 h-10 rounded-lg font-semibold transition-all ${page === pageNum
                      ? 'bg-[var(--primary)] text-white'
                      : 'border border-gray-300 text-[var(--text-main)] hover:border-[var(--primary)] hover:bg-[var(--surface)]'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={page >= pages}
              onClick={() => loadProducts(page + 1, search, category, sortBy)}
              className="btn btn-outline"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}