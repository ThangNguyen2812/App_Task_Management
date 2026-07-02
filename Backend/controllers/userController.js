import { asyncHandler } from "../middleware/async_handler.js";

// @desc Get user profile
// @route GET /user/profile
// @access Private
export const getProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  return res.status(200).json({
    success: true,
    message: "User profile fetched successfully",
    data: {
      user: {
        username: user.username,
        email: user.email
      }
    }
  });
});
