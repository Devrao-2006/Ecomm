import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String },
    provider: { type: String, enum: ['local', 'google'], default: 'local' },
    roles: { type: [String], default: ['user'] },
    refreshToken: { type: String, default: null },
    emailVerified: { type: Boolean, default: false, index: true },
    verificationToken: { type: String, default: null }, // hashed
    verificationTokenExpiresAt: { type: Date, default: null },
    verificationTokenVersion: { type: Number, default: 0 }, // prevent replay
    adminApproved: { type: Boolean, default: true }, // defaults true to not block existing accounts
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);