import React, { createContext, useEffect, useState, useContext } from 'react';
import api from '../api/axios';

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch cart from backend
  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cart');
      setItems(res.data.cart?.items || []);
    } catch (error) {
      // If unauthorized or error, reset to empty
      console.error('Failed to fetch cart:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Load cart on mount
  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (productId, quantity = 1, productData = null) => {
    try {
      // If productData is provided, use it; otherwise fetch product details
      let name, price;
      
      if (productData) {
        name = productData.name;
        price = productData.price;
      } else {
        // Fetch product details - API returns { success, product }
        const productRes = await api.get(`/products/${productId}`);
        const product = productRes.data.product;
        name = product.name;
        price = product.price;
      }

      const res = await api.post('/cart/items', {
        productId,
        name,
        price,
        quantity
      });
      
      setItems(res.data.cart?.items || []);
      setIsOpen(true); // Auto open cart sidebar on add
      return res.data;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const res = await api.delete(`/cart/${itemId}`);
      setItems(res.data.cart?.items || []);
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      return removeFromCart(itemId);
    }
    
    try {
      const res = await api.put(`/cart/${itemId}`, { quantity: newQuantity });
      setItems(res.data.cart?.items || []);
    } catch (error) {
      console.error('Failed to update quantity:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setItems([]);
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  };

  const cartTotal = items.reduce((sum, item) => {
    const price = item.productId?.price || item.price || 0;
    return sum + (price * (item.quantity || 1));
  }, 0);

  const cartCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <CartContext.Provider value={{
      items,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount,
      isOpen,
      setIsOpen,
      fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
