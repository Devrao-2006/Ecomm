import React, { useEffect, useState } from 'react';
import { Package, DollarSign, ShoppingCart, Users, Plus, Edit, Trash2, X } from 'lucide-react';
import api from '../api/axios';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  category: '',
  brand: '',
  stock: '',
  imageUrl: ''
};

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalRevenue: 0, totalUsers: 0 });
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadProducts = async () => {
    try {
      const res = await api.get('/products');
      const productsList = res.data.items || res.data.products || res.data || [];
      setProducts(productsList);
      setStats(prev => ({ ...prev, totalProducts: productsList.length }));
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const loadStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      if (res.data && res.data.success) {
        setStats(res.data.stats);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadProducts(), loadStats()]);
      setLoading(false);
    };
    loadData();
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
        price: Number(form.price),
        stock: form.stock ? Number(form.stock) : undefined,
        imageUrl: form.imageUrl || undefined
      };

      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post('/products', payload);
      }

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
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
      brand: product.brand || '',
      stock: product.stock ? String(product.stock) : '',
      imageUrl: product.imageUrl || product.image || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      await loadProducts();
    } catch (error) {
      alert('Failed to delete product');
    }
  };

  const cancelEdit = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="page-container py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="grid md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="page-container py-12">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-muted)] mb-1">Total Products</p>
                <p className="text-3xl font-bold">{stats.totalProducts}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-[var(--accent)]" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-muted)] mb-1">Total Orders</p>
                <p className="text-3xl font-bold">{stats.totalOrders}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-muted)] mb-1">Total Revenue</p>
                <p className="text-3xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-muted)] mb-1">Total Users</p>
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Product Management Section */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Product Management</h2>
            {!showForm && (
              <button onClick={() => setShowForm(true)} className="btn btn-primary">
                <Plus className="w-5 h-5" />
                Add Product
              </button>
            )}
          </div>

          {/* Product Form */}
          {showForm && (
            <div className="bg-[var(--surface)] rounded-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">
                  {editingId ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button onClick={cancelEdit} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Product Name *</label>
                  <input
                    id="name"
                    name="name"
                    placeholder="Enter product name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="price" className="form-label">Price *</label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.price}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category" className="form-label">Category</label>
                  <input
                    id="category"
                    name="category"
                    placeholder="e.g., Electronics"
                    value={form.category}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="brand" className="form-label">Brand</label>
                  <input
                    id="brand"
                    name="brand"
                    placeholder="e.g., Apple"
                    value={form.brand}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="stock" className="form-label">Stock Quantity</label>
                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.stock}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="imageUrl" className="form-label">Image URL</label>
                  <input
                    id="imageUrl"
                    name="imageUrl"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={form.imageUrl}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group md:col-span-2">
                  <label htmlFor="description" className="form-label">Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Enter product description"
                    value={form.description}
                    onChange={handleChange}
                    required
                    className="form-textarea"
                  />
                </div>

                <div className="md:col-span-2 flex gap-3">
                  <button type="submit" className="btn btn-primary">
                    {editingId ? 'Update Product' : 'Create Product'}
                  </button>
                  <button type="button" onClick={cancelEdit} className="btn btn-outline">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-sm text-[var(--text-muted)]">Product</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-[var(--text-muted)]">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-[var(--text-muted)]">Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-[var(--text-muted)]">Stock</th>
                  <th className="text-right py-3 px-4 font-semibold text-sm text-[var(--text-muted)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-[var(--text-muted)]">
                      No products found. Add your first product to get started.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product._id} className="border-b border-gray-100 hover:bg-[var(--surface)] transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-[var(--text-muted)] line-clamp-1">
                          {product.description}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm">{product.category || '-'}</td>
                      <td className="py-4 px-4 font-semibold">${product.price.toFixed(2)}</td>
                      <td className="py-4 px-4">
                        {product.stock !== undefined ? (
                          <span className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-error'}`}>
                            {product.stock}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="btn btn-ghost btn-sm"
                            aria-label="Edit product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="btn btn-ghost btn-sm text-red-600 hover:text-red-700"
                            aria-label="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}