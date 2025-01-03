import RefreshToken from '../models/refreshToken.js';
class AuthRepository {
    async findToken(token) {
        try {
            // Find the refresh token in the database
            return await RefreshToken.findOne({ token });
        }
        catch (error) {
            console.error('Error finding token:', error);
            return null;
        }
    }
    async removeToken(token) {
        try {
            // Delete the refresh token from the database
            await RefreshToken.findOneAndDelete({ token });
        }
        catch (error) {
            console.error('Error removing token from database:', error);
            throw new Error('Failed to remove token from database');
        }
    }
}
export default new AuthRepository();
