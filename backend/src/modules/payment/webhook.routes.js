import express from 'express';
import * as webhookController from './webhook.controller.js';

const router = express.Router();

router.post('/stripe', webhookController.handleStripeWebhook);

export default router;
