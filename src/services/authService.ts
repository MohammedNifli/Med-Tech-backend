import jwt from 'jsonwebtoken';
import authRepo from '../repositories/authRepository.js';


interface AuthResponse {
  accessToken?: string;
  error?: { status: number; message: string };
}

class AuthService {
  public async refreshToken(token: string): Promise<AuthResponse> {
    try {
      
      const refreshToken = await authRepo.findToken(token);
   
      
      if (!refreshToken) {
        return { error: { status: 403, message: 'Invalid refresh token' } };
      }


      const user = jwt.verify(token, process.env.JWT_REFRESH_TOKEN as string) as { userId: string };
      console.log("user",user)


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
