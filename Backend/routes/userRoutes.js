import express from "express";
import { getProfile } from "../controllers/userController.js";

const userRoute = express.Router();

userRoute.get("/profile", getProfile);

export default userRoute;