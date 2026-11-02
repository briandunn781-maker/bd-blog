import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User.js';
import HttpError from '../utils/httpError.js';

const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(60),
  email: z.email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

const loginSchema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const isProd = () => process.env.NODE_ENV === 'production';

const cookieOptions = () => ({
  httpOnly: true,
  secure: isProd(),
  sameSite: 'lax',
  path: '/',
});

function sendSession(res, user, status = 200) {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res
    .cookie('token', token, { ...cookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000 })
    .status(status)
    .json({ user });
}

export async function register(req, res) {
  const data = registerSchema.parse(req.body);
  // Public sign-up always creates readers; the admin comes from `npm run seed:admin`
  const user = await User.create({ ...data, role: 'reader' });
  sendSession(res, user, 201);
}

export async function login(req, res) {
  const { email, password } = loginSchema.parse(req.body);
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw new HttpError(401, 'Invalid email or password');
  }
  sendSession(res, user);
}

export function logout(req, res) {
  res.clearCookie('token', cookieOptions()).json({ message: 'Signed out' });
}

export function me(req, res) {
  res.json({ user: req.user ?? null });
}
