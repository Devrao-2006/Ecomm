import { stripe } from '../../config/stripe.js';
import { AppError } from '../../core/errors/AppError.js';
import { pgPool } from '../../config/db.postgres.js';

export async function createPaymentIntent(req, res, next) {
  try {
    if (!stripe) {
      throw new AppError('Stripe not configured', 500);
    }
    const { amount, currency = 'usd' } = req.body;
    if (!amount || amount <= 0) {
      throw new AppError('Valid amount required', 400);
    }

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata: {
        userId: req.user.id,
      },
    });

    const insertResult = await pgPool.query(
      'INSERT INTO payments (user_id, stripe_payment_intent_id, amount, currency, status) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [req.user.id, intent.id, amount, currency, 'pending']
    );

    const paymentRecordId = insertResult.rows[0].id;

    res.json({
      success: true,
      clientSecret: intent.client_secret,
      paymentRecordId,
      paymentIntentId: intent.id,
    });
  } catch (err) {
    next(err);
  }
}
