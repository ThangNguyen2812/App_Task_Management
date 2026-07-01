import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {connectDB} from './config/db.js';
import {errorHandler} from './middleware/error_middleware.js';
import authRoute from './routes/authRoutes.js';
import morgan from 'morgan';


dotenv.config();

connectDB();




const app = express();
const PORT = process.env.PORT || 5000;

app.use(morgan('dev'))
app.use(cors());


app.use(express.json());


app.use("/auth", authRoute)

app.use(errorHandler);

app.listen(PORT, ()=>{
  console.log(`Server is running at the port ${PORT}`);
})