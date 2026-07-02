import mongoose from 'mongoose';
import dns from 'node:dns';

// Force public DNS resolution for Atlas
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Create connection instance without opening it immediately (avoids ES Module hoisting env bugs)
export const connection = mongoose.createConnection();

export const connectDB = async () => {
  try {
    await connection.openUri(process.env.MONGO_URI, { dbName: 'task-manager' });
    console.log(`MongoDB Connection Established: ${connection.host}`);
    console.log(`Connected Database: ${connection.name}`);
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  }
};
