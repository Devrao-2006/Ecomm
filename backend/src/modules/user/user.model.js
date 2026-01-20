import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String },
    provider: { type: String, enum: ['local', 'google'], default: 'local' },
    roles: { type: [String], default: ['user'] },
    refreshToken: { type: String, default: null },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);