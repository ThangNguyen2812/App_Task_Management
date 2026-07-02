import mongoose from 'mongoose';
import { connection } from '../config/db.js';
import bcrypt from 'bcryptjs';


const userSchema = new mongoose.Schema(
  {
    username: { 
      type: String, 
      required: [true, 'Please add a username'], 
      trim: true 
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String, 
      required: [true, 'Please add a password'], 
      minlength: 6 
    }
  },
  { timestamps: true }
);

// Password Hashing Middleware
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//Compare password method
userSchema.methods.comparePassword = async function(password){
  return await bcrypt.compare(password, this.password)
}


const User = connection.model('User', userSchema);

export default User;
