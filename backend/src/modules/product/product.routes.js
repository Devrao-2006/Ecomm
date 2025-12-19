import express from 'express';
import { body } from 'express-validator';
import { authMiddleware } from '../../core/middleware/authMiddleware.js';
import { adminMiddleware } from '../../core/middleware/adminMiddleware.js';
import { validate } from '../../core/middleware/validate.js';
import * as productController from './product.controller.js';
import upload from '../../core/middleware/upload.js';

const router = express.Router();

router.get('/', productController.listProducts);
router.get('/:id', productController.getProduct);

router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  upload.single('image'),
  [
    body('name').notEmpty(),
    body('description').notEmpty(),
    body('price')
      .notEmpty()
      .isFloat({ min: 0 })
      .toFloat(),
  ],
  validate,
  productController.createProduct
);

router.put(
  '/:id',
  authMiddleware,
  adminMiddleware,
  upload.single('image'),
  [
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .toFloat(),
  ],
  validate,
  productController.updateProduct
);

router.delete('/:id', authMiddleware, adminMiddleware, productController.deleteProduct);

export default router;