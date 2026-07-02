import { asyncHandler } from "./async_handler.js";
import jwt from 'jsonwebtoken';
import User from '../models/Users.js';


export const protectRoute = asyncHandler((req,res,next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

    if(!token) {
        return res.status(401).json({
            success:false,
            message:"Not authorized to access this resource"
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
        if(err){
            return res.status(403).json({
                success:false,
                message:"Failed to authenticate token"
            })
        }

        const user = await User.findById(decodedToken.id).select("-password");

        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }
        
        req.user = user;
        next();
    })
});