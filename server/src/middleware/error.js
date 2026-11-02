import multer from 'multer';
import { ZodError } from 'zod';
import HttpError from '../utils/httpError.js';

export function notFound(req, res, next) {
  next(new HttpError(404, `Not found: ${req.originalUrl}`));
}

// Express 5 forwards rejected promises here, so controllers can simply throw
export function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message || 'Server error';

  if (err instanceof ZodError) {
    status = 400;
    message = err.issues.map((i) => (i.path.length ? `${i.path.join('.')}: ${i.message}` : i.message)).join(', ');
  } else if (err instanceof multer.MulterError) {
    status = 400;
    if (err.code === 'LIMIT_FILE_SIZE') message = 'Image must be 5 MB or smaller';
  } else if (err.name === 'CastError') {
    status = 404;
    message = 'Resource not found';
  } else if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.code === 11000) {
    status = 409;
    message = `${Object.keys(err.keyValue).join(', ')} is already in use`;
  }

  if (status >= 500) console.error(err);
  res.status(status).json({ message });
}
