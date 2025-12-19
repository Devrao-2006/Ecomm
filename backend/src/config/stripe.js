import Stripe from 'stripe';
import { env } from './env.js';

if (!env.stripeSecretKey) {
  console.warn('STRIPE_SECRET_KEY not set. Stripe payments will not work.');
}

export const stripe = env.stripeSecretKey ? new Stripe(env.stripeSecretKey, { apiVersion: '2024-06-20' }) : null;