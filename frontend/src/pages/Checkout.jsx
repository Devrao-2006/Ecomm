import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import useCart from '../hooks/useCart';
import api from '../api/axios';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { items, total, clearCart } = useCart();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setError('');
    setLoading(true);
    try {
      const intentRes = await api.post('/payments/intent', { amount: total, currency: 'usd' });
      const { clientSecret, paymentRecordId, paymentIntentId } = intentRes.data;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)
        }
      });

      if (result.error) {
        setError(result.error.message || 'Payment failed');
        setLoading(false);
        return;
      }

      await api.post('/payments/confirm', { paymentIntentId, paymentRecordId });
      await api.post('/orders', {
        items: items.map((i) => ({
          product: i.productId,
          quantity: i.quantity,
          price: i.price
        })),
        totalAmount: total,
        paymentId: paymentIntentId,
        paymentRecordId
      });

      await clearCart();
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div>
        <h2>Payment successful</h2>
        <p>Your order has been placed.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
      <div>
        <label>Card details</label>
        <div style={{ padding: '0.75rem', backgroundColor: '#fff', borderRadius: '0.5rem' }}>
          <CardElement />
        </div>
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type="submit" className="btn full" disabled={!stripe || loading}>
        {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
      </button>
    </form>
  );
}

export default function Checkout() {
  const { items, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="container" style={{ paddingTop: '1.5rem' }}>
        <h2>Checkout</h2>
        <p>Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '1.5rem', maxWidth: '600px' }}>
      <h2 style={{ marginBottom: '1rem' }}>Checkout</h2>
      <p style={{ marginBottom: '0.5rem' }}>Total: ${total.toFixed(2)}</p>
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  );
}