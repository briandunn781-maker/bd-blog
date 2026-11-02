import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import HttpError from '../utils/httpError.js';

async function userFromToken(req) {
  const token = req.cookies?.token;
  if (!token) return null;
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    return await User.findById(id);
  } catch {
    return null;
  }
}

// Sets req.user when a valid session exists, but never blocks the request
export async function optionalAuth(req, res, next) {
  req.user = await userFromToken(req);
  next();
}

export async function protect(req, res, next) {
  req.user = await userFromToken(req);
  if (!req.user) throw new HttpError(401, 'Please sign in to continue');
  next();
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') throw new HttpError(403, 'Admin access required');
  next();
}
