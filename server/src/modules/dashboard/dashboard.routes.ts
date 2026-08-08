import { Router } from 'express';
import { getStats } from './dashboard.controller.js';
import { authenticator } from '../../middlewares/authenticator.middleware.js';

const router = Router();

router.get('/stats', authenticator, getStats);

export default router;
