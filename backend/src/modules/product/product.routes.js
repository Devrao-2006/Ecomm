import express from 'express';
import { body, query, param } from 'express-validator';
import { authMiddleware } from '../../core/middleware/authMiddleware.js';
import { adminMiddleware } from '../../core/middleware/adminMiddleware.js';
import { validate } from '../../core/middleware/validate.js';
import * as productController from './product.controller.js';
import upload from '../../core/middleware/upload.js';

const router = express.Router();

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('search').optional().isString().trim().escape(),
    query('category').optional().isString().trim(),
  ],
  validate,
  productController.listProducts
);

router.get(
  '/:id',
  [param('id').isUUID().withMessage('Valid product UUID required')],
  validate,
  productController.getProduct
);

router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  upload.single('image'),
  [
    body('sku').optional().isString().trim().isLength({ min: 3, max: 100 }),
    body('name').notEmpty().trim().isLength({ min: 2, max: 255 }).withMessage('Product name is required'),
    body('description').optional().isString().trim(),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number').toFloat(),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer').toInt(),
    body('category').optional().isString().trim(),
    body('brand').optional().isString().trim(),
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
    param('id').isUUID().withMessage('Valid product UUID required'),
    body('name').optional().trim().isLength({ min: 2, max: 255 }),
    body('description').optional().isString().trim(),
    body('price').optional().isFloat({ min: 0 }).toFloat(),
    body('stock').optional().isInt({ min: 0 }).toInt(),
    body('status').optional().isIn(['ACTIVE', 'DRAFT', 'ARCHIVED']),
    body('category').optional().isString().trim(),
    body('brand').optional().isString().trim(),
  ],
  validate,
  productController.updateProduct
);

router.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  [param('id').isUUID().withMessage('Valid product UUID required')],
  validate,
  productController.deleteProduct
);

export default router;