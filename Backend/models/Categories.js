import mongoose from 'mongoose';
import { connection } from '../config/db.js';

const categorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'Please add a category name'],
      trim: true,
    },
    color: {
      type: String,
      default: '#3b82f6', // Default blue hex code for frontend UI rendering
    },
  },
  {
    timestamps: true,
  }
);

// Prevent a user from creating duplicate categories with the exact same name
categorySchema.index({ user: 1, name: 1 }, { unique: true });

const Category = connection.model('Category', categorySchema);

export default Category;