import { stripe } from '../../config/stripe.js';
import { AppError } from '../../core/errors/AppError.js';
import { prisma } from '../../config/db.prisma.js';

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

    const paymentRecord = await prisma.payments.create({
      data: {
        user_id: req.user.id,
        stripe_payment_intent_id: intent.id,
        amount,
        currency,
        status: 'pending'
      }
    });

    const paymentRecordId = paymentRecord.id;

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
