import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
<<<<<<< HEAD
  }
=======
  },
  { _id: false }
>>>>>>> e8e9bc35347c166c03829b7a59dca062879bb374
);

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

export const Cart = mongoose.model('Cart', cartSchema);