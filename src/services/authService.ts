import jwt from 'jsonwebtoken';
import authRepo from '../repositories/authRepository.js';


interface AuthResponse {
  accessToken?: string;
  error?: { status: number; message: string };
}

class AuthService {
  public async refreshToken(token: string): Promise<AuthResponse> {
    try {
      // Find the refresh token in the database
      const refreshToken = await authRepo.findToken(token);
      console.log("token got from db",refreshToken)
      
      if (!refreshToken) {
        return { error: { status: 403, message: 'Invalid refresh token' } };
      }

      // Verify the refresh token
      const user = jwt.verify(token, process.env.JWT_REFRESH_TOKEN as string) as { userId: string };
      console.log("user",user)

      // Generate a new access token
      const newAccessToken = jwt.sign(
        { userId: user.userId },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: '15m' }
      );

      return { accessToken: newAccessToken };
    } catch (error) {
      console.log(error);
      return { error: { status: 500, message: 'Could not refresh token' } };
    }
  }
}

export default new AuthService();
