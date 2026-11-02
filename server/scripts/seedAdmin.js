import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../src/config/db.js';
import User from '../src/models/User.js';

const { ADMIN_NAME = 'Admin', ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env first.');
  process.exit(1);
}

await connectDB();

const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() }).select('+password');
if (existing) {
  existing.set({ name: ADMIN_NAME, password: ADMIN_PASSWORD, role: 'admin' });
  await existing.save();
  console.log(`Updated ${ADMIN_EMAIL}: role set to admin and password reset.`);
} else {
  await User.create({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin' });
  console.log(`Created admin account ${ADMIN_EMAIL}.`);
}

await mongoose.disconnect();
