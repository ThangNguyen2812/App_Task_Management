import { asyncHandler } from "../middleware/async_handler.js";
import User from "../models/Users.js"

export const login = asyncHandler(async (req, res) =>{
  const { username, password} = req.body;

  if(!username || !password){
    return res.status(400).json({
        success: false,
        message:"Please provide username and password"
    });
  }

  const user = await User.findOne({ username });
  if(user && (await user.comparePassword(password))){
    return res.status(200).json({
        success: true,
        message:"Login successfully",
        data:{
            user,
        }
    });
  }
  else{
    return res.status(401).json({
        success: false,
        message:"Invalid username or password"
    });
  }
})


export const register = asyncHandler(async (req, res) => {
  const {username, email, password} = req.body;

  if(!username || !email || !password){
    return res.status(400).json({
      success: false,
      message:"Please provide all required fields"
    })
  }

  const userExists = await User.findOne({$or:[{username}, {email}]});
  if(userExists){
    return res.status(400).json({
      success: false,
      message:"User already exists"
    })
  }

  const user = await User.create({username, email, password});
  
  return res.status(201).json({
    success: true,
    message:"User created successfully",
    data:{
      username,
      email,
    }
  })
})