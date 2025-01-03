import jwt from 'jsonwebtoken';
import RefreshToken from '../models/refreshToken.js';
// Function to generate a new refresh token
const generateRefreshToken = async (Id, role) => {
    try {
        // Create a new JWT token for the refresh token
        const token = jwt.sign({ Id, role }, process.env.JWT_REFRESH_TOKEN, { expiresIn: '1d' });
        // Calculate the expiration date (1 day from now)
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day in milliseconds
        // Save the new refresh token in the database
        const refreshToken = new RefreshToken({
            token,
            userId: Id,
            expiresAt,
        });
        const refresh = await refreshToken.save();
        // console.log("refresh",refresh)
        return token;
    }
    catch (error) {
        console.error('Error generating refresh token:', error);
        throw new Error('Could not generate refresh token');
    }
};
export default generateRefreshToken;
