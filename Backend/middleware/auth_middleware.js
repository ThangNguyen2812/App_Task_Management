import { asyncHandler } from "./async_handler.js";
import jwt from 'jsonwebtoken';
import User from '../models/Users.js';


export const protectRoute = asyncHandler(async (req, res, next) => {
  // Extract token from header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(" ")[1];

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this resource"
    });
  }

  try {
    // Verify token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decodedToken.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: "Failed to authenticate token"
    });
  }
});