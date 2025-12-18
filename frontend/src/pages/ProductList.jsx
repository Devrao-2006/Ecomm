import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const loadProducts = async (pageParam = 1, searchParam = '', categoryParam = '') => {
    const res = await api.get('/products', {
      params: { page: pageParam, search: searchParam, category: categoryParam }
    });
    setProducts(res.data.items);
    setPage(res.data.pagination.page);
    setPages(res.data.pagination.pages);
  };

  useEffect(() => {
    loadProducts(1, '', '');
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadProducts(1, search, category);
  };

  return (
    <div className="container" style={{ paddingTop: '1.5rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>Products</h2>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '180px', padding: '0.5rem' }}
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ width: '150px', padding: '0.5rem' }}
        />
        <button type="submit" className="btn">
          Filter
        </button>
      </form>
      <div className="grid cols-3">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button
          type="button"
          className="btn secondary"
          disabled={page <= 1}
          onClick={() => loadProducts(page - 1, search, category)}
        >
          Prev
        </button>
        <button
          type="button"
          className="btn secondary"
          disabled={page >= pages}
          onClick={() => loadProducts(page + 1, search, category)}
        >
          Next
        </button>
        <span style={{ alignSelf: 'center', marginLeft: '0.5rem' }}>
          Page {page} of {pages}
        </span>
      </div>
    </div>
  );
}