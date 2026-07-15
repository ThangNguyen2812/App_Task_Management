import express from "express";
import { login, logout, register, refreshAccessToken } from "../controllers/authController.js";

const authRoute = express.Router();

authRoute.post("/register", register);

authRoute.post("/login", login);

authRoute.post("/logout", logout);

authRoute.post("/refresh", refreshAccessToken)

export default authRoute;