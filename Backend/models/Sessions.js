import mongoose from 'mongoose';
import { connection } from '../config/db.js';

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  refreshtoken: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
}, {timestamps: true});

//Auto Delete
sessionSchema.index({expiresAt:1}, {expireAfterSeconds: 0});

const Session = connection.model('Session', sessionSchema);

export default Session;