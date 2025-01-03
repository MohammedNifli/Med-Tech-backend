import jwt from 'jsonwebtoken';
import authRepo from '../repositories/authRepository.js';
class AuthService {
    async refreshToken(token) {
        try {
            const refreshToken = await authRepo.findToken(token);
            if (!refreshToken) {
                return { error: { status: 403, message: 'Invalid refresh token' } };
            }
            const user = jwt.verify(token, process.env.JWT_REFRESH_TOKEN);
            console.log("user", user);
            const newAccessToken = jwt.sign({ userId: user.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
            return { accessToken: newAccessToken };
        }
        catch (error) {
            console.log(error);
            return { error: { status: 500, message: 'Could not refresh token' } };
        }
    }
}
export default new AuthService();
