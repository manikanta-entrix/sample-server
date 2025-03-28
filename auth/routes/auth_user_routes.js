import express from 'express';
import { register, signin } from '../controller/auth_controller.js';

const router = express.Router();
router.post('/signup', register);
router.post('/signin', signin);
export default router;
