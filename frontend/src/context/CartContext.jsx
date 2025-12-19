import React, { createContext, useEffect, useState } from 'react';
import api from '../api/axios';

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function loadCart() {
      try {
        const res = await api.get('/cart');
        setItems(res.data.cart.items || []);
      } catch (e) {
        setItems([]);
      }
    }
    loadCart();
  }, []);

  const syncCart = async (newItems) => {
    setItems(newItems);
    try {
      await api.post('/cart', { items: newItems });
    } catch (e) {
      //Ignore
    }
  };

  const addToCart = (product, quantity = 1) => {
    if (!product || !product._id) return;
    const existing = items.find((i) => i.productId === product._id);
    let updated;
    if (existing) {
      updated = items.map((i) =>
        i.productId === product._id ? { ...i, quantity: i.quantity + quantity } : i
      );
    } else {
      updated = [...items, { productId: product._id, name: product.name, price: product.price, quantity }];
    }
    syncCart(updated);
  };

  const updateQuantity = (productId, quantity) => {
    const updated = items.map((i) =>
      i.productId === productId ? { ...i, quantity } : i
    );
    syncCart(updated);
  };

  const removeFromCart = (productId) => {
    const updated = items.filter((i) => i.productId !== productId);
    syncCart(updated);
  };

  const clearCart = async () => {
    setItems([]);
    try {
      await api.delete('/cart');
    } catch (e) {
      // ignore
    }
  };

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const value = {
    items,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    total
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}