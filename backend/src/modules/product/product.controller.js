import { Product } from './product.model.js';
import { AppError } from '../../core/errors/AppError.js';
import * as productCache from './product.cache.js';

export async function listProducts(req, res, next) {
  try {
    const { page = 1, limit = 12, search = '', category } = req.query;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 12;

    // Try to get from cache first
    const cachedData = await productCache.getProductList(req.query);
    if (cachedData) {
      return res.json({ success: true, ...cachedData });
    }

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

    // Cache the result
    await productCache.setProductList(req.query, result);

    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req, res, next) {
  try {
    const { id } = req.params;

    // Try to get from cache first
    let product = await productCache.getProduct(id);

    if (!product) {
      // Cache miss - get from database
      product = await Product.findById(id);

      if (!product || !product.isActive) {
        throw new AppError('Product not found', 404);
      }

      // Cache the result
      await productCache.setProduct(id, product);
    }

    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const { name, description, price, category, brand } = req.body;

    const product = new Product({
      name,
      description,
      price,
      category,
      brand,
      image: req.file ? `/uploads/${req.file.filename}` : undefined
    });

    await product.save();

    // Invalidate product list caches
    await productCache.invalidateProductLists();

    res.status(201).json({ success: true, product });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, price, category, brand } = req.body;
    const updates = {
      name,
      description,
      price,
      category,
      brand
    };
    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }
    const product = await Product.findByIdAndUpdate(id, updates, { new: true });
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Invalidate caches
    await productCache.invalidateProduct(id);
    await productCache.invalidateProductLists();

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

    // Invalidate caches
    await productCache.invalidateProduct(id);
    await productCache.invalidateProductLists();

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}