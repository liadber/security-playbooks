import { Schema, model } from 'mongoose';
import type { IUser } from './user.types.js';

// Email normalization (trim + lowercase) happens in validation, so the model
// only enforces presence and uniqueness.
const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);

export const User = model<IUser>('User', userSchema);
