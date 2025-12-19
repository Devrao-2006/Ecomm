import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  category: '',
  brand: ''
};

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const loadProducts = async () => {
    const res = await api.get('/products');
    setProducts(res.data.items);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...form,
        price: Number(form.price)
      };
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setForm(emptyForm);
      setEditingId(null);
      await loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving product');
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      category: product.category || '',
      brand: product.brand || ''
    });
  };

  const handleDelete = async (id) => {
    // simple confirm
    // eslint-disable-next-line no-alert
    if (!window.confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    await loadProducts();
  };

  return (
    <div className="container" style={{ paddingTop: '1.5rem', display: 'grid', gap: '1.5rem' }}>
      <section>
        <h2 style={{ marginBottom: '1rem' }}>{editingId ? 'Edit product' : 'Add product'}</h2>
        {error && <div style={{ color: 'red', marginBottom: '0.75rem' }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem', maxWidth: '480px' }}>
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
            style={{ padding: '0.5rem' }}
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            required
            style={{ padding: '0.5rem', minHeight: '80px' }}
          />
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            required
            style={{ padding: '0.5rem' }}
          />
          <input
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
            style={{ padding: '0.5rem' }}
          />
          <input
            name="brand"
            placeholder="Brand"
            value={form.brand}
            onChange={handleChange}
            style={{ padding: '0.5rem' }}
          />
          <button type="submit" className="btn">
            {editingId ? 'Update product' : 'Create product'}
          </button>
        </form>
      </section>
      <section>
        <h2 style={{ marginBottom: '1rem' }}>Products</h2>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {products.map((p) => (
            <div key={p._id} style={{ backgroundColor: '#fff', padding: '0.75rem', borderRadius: '0.5rem' }}>
              <div style={{ fontWeight: 500 }}>{p.name}</div>
              <div style={{ fontSize: '0.9rem', color: '#4b5563' }}>${p.price.toFixed(2)}</div>
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                <button type="button" className="btn secondary" onClick={() => handleEdit(p)}>
                  Edit
                </button>
                <button type="button" className="btn secondary" onClick={() => handleDelete(p._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}