import express from 'express';
import { login, verify2FA, register ,logout ,checkAuth ,listAdmins,deleteAdmin,updateProfile } from '../controllers/auth.controller.js';
const router = express.Router();
import { protectRoute } from '../middleware/auth.middleware.js';

router.post('/register', register);
router.post('/login', login);
router.post('/verify-2fa', verify2FA);
router.post('/logout', logout);
router.get('/check', checkAuth);
router.get('/admins',protectRoute ,listAdmins);
router.delete('/del/:id',protectRoute, deleteAdmin);
router.put('/profile', protectRoute,updateProfile);

export default router;