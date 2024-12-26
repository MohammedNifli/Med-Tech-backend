import express from 'express';
import refreshTokenController from '../controllers/authController.js'; // Import the controller function

const router = express.Router();

// Define a POST route for refreshing tokens
router.post('/refresh', refreshTokenController.refreshToken );

export default router;
