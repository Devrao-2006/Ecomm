import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, index: true },
    brand: { type: String },
<<<<<<< HEAD
    images: [{ type: String }],
    imageUrl: { type: String },
=======
    image: { type: String },
>>>>>>> e8e9bc35347c166c03829b7a59dca062879bb374
    stock: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Product = mongoose.model('Product', productSchema);