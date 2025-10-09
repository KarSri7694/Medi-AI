import { Router } from 'express';
import { getUserLocation } from '../controllers/startup.controller.js';

const router = Router();

router.route('/').get(getUserLocation);

export default router;
