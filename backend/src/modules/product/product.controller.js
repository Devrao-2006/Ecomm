import { Product } from './product.model.js';
import { AppError } from '../../core/errors/AppError.js';

export async function listProducts(req, res, next) {
  try {
    const { page = 1, limit = 12, search = '', category } = req.query;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 12;

    const filter = { isActive: true };
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if (category) {
      filter.category = category;
    }

    const [items, total] = await Promise.all([
      Product.find(filter)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .sort({ createdAt: -1 }),
      Product.countDocuments(filter),
    ]);

    const result = {
      items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };

    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req, res, next) {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product || !product.isActive) {
      throw new AppError('Product not found', 404);
    }

    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const data = req.body;
    const product = await Product.create(data);
    res.status(201).json({ success: true, product });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const product = await Product.findByIdAndUpdate(id, updates, { new: true });
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}


