import mongoose from 'mongoose';
import { connection } from '../config/db.js';

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Please add a task title'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isCompleted: {
      type: Boolean,
      required: true,
      default: false,
    },
    // ADD THIS FIELD: Reference to our new Category Model
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null, // Optional field
    },
  },
  {
    timestamps: true,
  }
);

const Task = connection.model('Task', taskSchema);

export default Task;