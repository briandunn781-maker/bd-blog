import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { revealEmail } from '../controllers/contactController.js';

const router = Router();

const revealLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again in a few minutes' },
});

router.post('/reveal-email', revealLimiter, revealEmail);

export default router;
