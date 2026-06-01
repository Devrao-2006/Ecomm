import { prisma } from '../../config/db.prisma.js';
import { AppError } from '../../core/errors/AppError.js';
import * as productCache from './product.cache.js';

export async function listProducts(req, res, next) {
  try {
    const { page = 1, limit = 12, search = '', category } = req.query;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 12;

    const cachedData = await productCache.getProductList(req.query);
    if (cachedData) {
      return res.json({ success: true, ...cachedData });
    }

    const where = { isActive: true };
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (category) {
      where.category = category;
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
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

    await productCache.setProductList(req.query, result);

    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req, res, next) {
  try {
    const { id } = req.params;

    let product = await productCache.getProduct(id);

    if (!product) {
      product = await prisma.product.findUnique({ where: { id } });

      if (!product || !product.isActive) {
        throw new AppError('Product not found', 404);
      }

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

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        category,
        brand,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null
      }
    });

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
    
    const data = {};
    if (name) data.name = name;
    if (description) data.description = description;
    if (price !== undefined) data.price = Number(price);
    if (category !== undefined) data.category = category;
    if (brand !== undefined) data.brand = brand;
    if (req.file) data.imageUrl = `/uploads/${req.file.filename}`;

    try {
      const product = await prisma.product.update({
        where: { id },
        data,
      });

      await productCache.invalidateProduct(id);
      await productCache.invalidateProductLists();

      res.json({ success: true, product });
    } catch (e) {
      throw new AppError('Product not found', 404);
    }
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    
    try {
      await prisma.product.update({
        where: { id },
        data: { isActive: false }
      });
    } catch (e) {
      throw new AppError('Product not found', 404);
    }

    await productCache.invalidateProduct(id);
    await productCache.invalidateProductLists();

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}