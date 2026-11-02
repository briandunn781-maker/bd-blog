import mongoose from 'mongoose';

export default async function connectDB() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not set. Copy server/.env.example to server/.env and fill it in.');
    process.exit(1);
  }
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB connected: ${conn.connection.host}`);
}
