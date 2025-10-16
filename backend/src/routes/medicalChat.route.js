import { Router } from 'express';
import { getMedicalHistory, mediChat } from '../controllers/medicalChat.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJWT);

router.post('/get-medical-history', getMedicalHistory);
router.post('/chat', mediChat);

export default router;
