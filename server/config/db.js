import mongoose from 'mongoose';

/**
 * Connect to MongoDB with robust error handling and event logging
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hackathon_portal';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    console.warn(`[MongoDB] Note: Please make sure MongoDB is running locally or specify a valid MONGO_URI in server/.env`);
  }
};

export default connectDB;
