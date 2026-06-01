import { stripe } from '../../config/stripe.js';
import { env } from '../../config/env.js';
import { prisma } from '../../config/db.prisma.js';
import { logger } from '../../core/utils/logger.js';

export async function handleStripeWebhook(req, res, next) {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    if (!env.stripeWebhookSecret) {
      logger.error('Stripe webhook secret is not configured.');
      return res.status(500).send('Webhook secret not configured');
    }
    // Verify signature using the raw body (req.body is a Buffer because of express.raw())
    event = stripe.webhooks.constructEvent(req.body, sig, env.stripeWebhookSecret);
  } catch (err) {
    logger.error('Webhook signature verification failed.', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.orderId;
        const paymentRecordId = paymentIntent.metadata?.paymentRecordId;

        if (!orderId || !paymentRecordId) {
          logger.error('Missing metadata in payment_intent.succeeded', { id: paymentIntent.id });
          break;
        }

        // Fulfill the order within a transaction
        await prisma.$transaction(async (tx) => {
          // 1. Mark payment record as succeeded
          const paymentRecord = await tx.payments.findUnique({ where: { id: parseInt(paymentRecordId, 10) } });
          if (paymentRecord && paymentRecord.status !== 'succeeded') {
            await tx.payments.update({
              where: { id: paymentRecord.id },
              data: { status: 'succeeded' }
            });
            await tx.transactions.create({
              data: {
                payment_id: paymentRecord.id,
                type: 'charge',
                amount: paymentIntent.amount / 100,
                status: 'succeeded'
              }
            });
          }

          // 2. Mark order as paid and deduct stock
          const order = await tx.order.findUnique({
            where: { id: orderId },
            include: { items: true }
          });

          if (order && order.status !== 'paid') {
            await tx.order.update({
              where: { id: orderId },
              data: { status: 'paid' }
            });

            for (const item of order.items) {
              await tx.product.updateMany({
                where: { 
                  id: item.productId, 
                  stock: { gte: item.quantity } 
                },
                data: { stock: { decrement: item.quantity } }
              });
            }

            // 3. Clear the user's cart
            const cart = await tx.cart.findUnique({ where: { userId: order.userId } });
            if (cart) {
              await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
            }
          }
        });

        logger.info(`Successfully fulfilled order ${orderId} for PaymentIntent ${paymentIntent.id}`);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.orderId;
        const paymentRecordId = paymentIntent.metadata?.paymentRecordId;

        if (!orderId || !paymentRecordId) break;

        await prisma.$transaction(async (tx) => {
          await tx.payments.updateMany({
            where: { id: parseInt(paymentRecordId, 10) },
            data: { status: 'failed' }
          });
          
          await tx.order.updateMany({
            where: { id: orderId },
            data: { status: 'failed' }
          });
        });

        logger.info(`Marked order ${orderId} as failed for PaymentIntent ${paymentIntent.id}`);
        break;
      }
      
      default:
        // Unexpected event type
        logger.info(`Unhandled event type ${event.type}`);
    }

    // Acknowledge receipt of the event
    res.json({ received: true });
  } catch (err) {
    logger.error('Error processing webhook event', err);
    // Returning 500 will cause Stripe to retry the webhook
    res.status(500).json({ error: 'Webhook processing error' });
  }
}
