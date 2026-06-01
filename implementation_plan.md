# Implement Stripe Webhooks for Secure Payment Confirmation

This plan outlines the steps to replace the current client-side payment confirmation with a robust, server-side Stripe Webhook integration. This prevents scenarios where a user's browser closes before the order is finalized, resulting in a charge without an order.

## User Review Required

> [!WARNING]
> **API Change**: The endpoint `POST /api/orders` (currently used by the frontend to create an order after payment) will be removed. The order creation flow will be entirely handled by the backend:
> 1. `POST /api/payments/intent` will now read the user's Cart, calculate the total securely, create a `pending` Order, and return the Stripe `clientSecret`.
> 2. The Stripe Webhook will asynchronously mark the Order as `paid`, deduct stock, and clear the cart when the payment succeeds.
> 
> **You will need to update your frontend** to stop calling `POST /api/orders` after a successful payment. Instead, just redirect the user to a success page.

## Proposed Changes

### `src/app.js`
Modify the middleware stack to allow Stripe to send the raw request body. Webhooks require the raw body to verify the cryptographic signature.
- Mount a new `/api/webhooks` route **before** `app.use(express.json())` using `express.raw({ type: 'application/json' })`.

---

### `src/modules/payment`

#### [MODIFY] `payment.controller.js`
- **`createPaymentIntent`**: 
  - Instead of trusting the `amount` from `req.body`, it will fetch the user's current `Cart` from the database.
  - Calculate the total amount securely on the backend.
  - Create an `Order` in the database with status `pending`.
  - Create the Stripe `PaymentIntent`, passing `orderId: newOrder.id` in the metadata.
  - Create the `payments` record and return the `clientSecret`.

#### [NEW] `webhook.controller.js`
- Implement `handleStripeWebhook`:
  - Verify `stripe-signature` header using `env.stripeWebhookSecret`.
  - Listen for `payment_intent.succeeded`:
    - Extract `orderId` from metadata.
    - Run a database transaction: mark payment as succeeded, deduct product stock, mark Order as `paid`, and clear the user's `Cart`.
  - Listen for `payment_intent.payment_failed`:
    - Mark payment and Order as `failed`.

#### [NEW] `webhook.routes.js`
- Expose `POST /stripe` mapped to `handleStripeWebhook`. This route will *not* have `authMiddleware` because Stripe requests are server-to-server and signed, not JWT authenticated.

---

### `src/modules/order`

#### [MODIFY] `order.controller.js`
- **Delete** `createOrder`: This function is no longer needed since order creation is now initiated by `/intent` and finalized by the webhook.

#### [MODIFY] `order.routes.js`
- **Delete** `router.post('/', ...)` pointing to `createOrder`.

## Verification Plan

### Automated Tests
- I will simulate a Stripe Webhook call using a mock payload and signature to ensure the webhook successfully updates an order, deducts stock, and clears the cart.

### Manual Verification
- You will need to trigger a payment from your frontend and verify that the database updates correctly without the frontend explicitly calling the `/api/orders` creation endpoint.
