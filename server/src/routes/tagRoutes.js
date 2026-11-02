import { Router } from 'express';
import { listTags } from '../controllers/tagController.js';

const router = Router();

router.get('/', listTags);

export default router;
