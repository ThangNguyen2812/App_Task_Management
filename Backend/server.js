import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {connectDB} from './config/db.js';


dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());


app.use(express.json());

app.use("/", (req,res)=>{
  res.json("Backend is running");
})


app.listen(PORT, ()=>{
  console.log(`Server is running at the port ${PORT}`);
})