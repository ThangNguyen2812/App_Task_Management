import { asyncHandler } from "../middleware/async_handler.js";
import Session from "../models/Sessions.js";
import User from "../models/Users.js";
import { generatetoken, refreshtoken, expiresTime } from "../utils/generateToken.js";

// @desc    Auth user & get token
// @route   POST /auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Please enter Username and Password"
    });
  }

  // 1. Verify User exists
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid username or password"
    });
  }

  // 2. Compare password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid username or password"
    });
  }

  // 3. Clear any previous session from this browser tab/client to prevent session accumulation
  const oldRefreshToken = req.cookies?.refreshToken;
  if (oldRefreshToken) {
    try {
      await Session.findOneAndDelete({ refreshtoken: oldRefreshToken });
    } catch (err) {
      // Ignore if session not found in database
    }
  }

  // 4. Generate new tokens
  const accessToken = generatetoken(user._id);
  const refreshToken = refreshtoken(user._id);

  // 5. Save Session in Database
  await Session.create({
    user: user._id,
    refreshtoken: refreshToken,
    expiresAt: new Date(Date.now() + expiresTime.refreshMs)
  });

  // 5. Send Refresh Token cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: expiresTime.refreshMs
  });

  // 6. Return response with access token
  return res.status(200).json({
    success: true,
    message: "Login successfully",
    data: {
      token: accessToken,
      user: {
        _id: user._id,
        username: user.username,
      }
    }
  });
});

// @desc    Register a new user
// @route   POST /auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields"
    });
  }

  const userExists = await User.findOne({ $or: [{ username }, { email }] });
  
  if (userExists) {
    return res.status(400).json({
      success: false,
      message: "User already exists"
    });
  }

  const user = await User.create({ username, email, password });
  
  return res.status(201).json({
    success: true,
    message: "User created successfully",
    data: {
      user: {
        _id: user._id,
        username: user.username
      }
    }
  });
});


// @desc Logout user
// @route POST /auth/logout
// @access Private
export const logout = asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken;

    if(token){
        await Session.findOneAndDelete({refreshtoken: token})
    }
    
    //Clear refresh token cookie
    res.clearCookie('refreshToken');
    
    //Return response
    return res.status(200).json({
        success: true,
        message: "Logout successfully"
    });
});


// @desc create access token from refresh token
// @route POST /auth/refresh
// @access Private
export const refreshAccessToken = asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken;

    if(!token){
        return res.status(401).json({
            success: false,
            message: "Refresh token is required"
        });
    }

    const session = await Session.findOne({refreshtoken: token});

    if(!session){
      return res.status(403).json({
        success: false,
        message: "Invalid refresh token or Outdated"
      });
    }

    if(session.expiresAt < new Date()){
      return res.status(403).json({
        success: false,
        message: "Outdated token"
      })
    }

    const accessToken = generatetoken(session.user);

    return res.status(200).json({
        success: true,
        message: "Access token refreshed successfully",
        data: {
            token: accessToken
        }
    });
});

