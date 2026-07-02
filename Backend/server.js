import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {connectDB} from './config/db.js';
import {errorHandler} from './middleware/error_middleware.js';
import authRoute from './routes/authRoutes.js';
import userRoute from './routes/userRoutes.js';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { protectRoute } from './middleware/auth_middleware.js';

//Load environment variables
dotenv.config();

//Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

//Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(cookieParser());
app.use(express.json());

//Mount auth router
app.use("/auth", authRoute)

app.use(protectRoute)
//Mount user router
app.use("/user", userRoute)

//Mount error handler
app.use(errorHandler);

app.listen(PORT, ()=>{
  console.log(`Server is running at the port ${PORT}`);
})