import { Request, Response } from 'express';
import authService from '../services/authService.js';

class RefreshTokenController {
  public async refreshToken(req: Request, res: Response): Promise<Response> {
    try {
      console.log("Received refresh token request from frontend");
      const { token: refreshToken } = req.body;
      console.log("Refresh token:", refreshToken);

      if (!refreshToken) {  
        return res.status(401).json({ message: 'Refresh token required' });
      }

      const { accessToken, error } = await authService.refreshToken(refreshToken);

      if (error) {
        return res.status(error.status).json({ message: error.message });
      }

      // Send the new access token in the response
      console.log('New access token:', accessToken);
      
      return res.json({ accessToken });
    } catch (err) {
      // Handle unexpected errors
      console.error('Error in refreshToken:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  // You can add more related methods here if needed
}

export default new RefreshTokenController();