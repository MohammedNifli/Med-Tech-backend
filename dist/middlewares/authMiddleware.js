import jwt from 'jsonwebtoken';
import generateAccessToken from '../utils/accessToken.js';
import { HttpStatusCode } from '../enums/httpStatusCodes.js';
export const authentication = (req, res, next) => {
    try {
        const token = req.cookies?.accessToken;
        const refreshToken = req.cookies?.refreshToken;
        console.log('accesToken', token);
        console.log('refreshToken', refreshToken);
        if (!token) {
            if (!refreshToken) {
                return res.status(HttpStatusCode.UNAUTHORIZED).json({ message: 'Access token and refresh token are missing' });
            }
            jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN, (err, decoded) => {
                if (err || !decoded) {
                    console.error('Refresh token verification failed:', err?.message || 'No decoded data');
                    return res.status(HttpStatusCode.FORBIDDEN).json({ message: 'Invalid refresh token' });
                }
                let newAccessToken;
                let role;
                if (typeof decoded === 'string') {
                    newAccessToken = generateAccessToken('anonymous', 'guest');
                    role = 'guest';
                }
                else {
                    const { Id, role: decodedRole } = decoded;
                    newAccessToken = generateAccessToken(Id, decodedRole);
                    role = decodedRole;
                }
                res.cookie('accessToken', newAccessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
                req.user = decoded;
                const user1 = req.user;
                console.log("user1", user1);
                req.role = role;
                console.log('New access token generated and user from refresh token:', req.user);
                next();
            });
        }
        else {
            jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET, (err, decoded) => {
                if (err || !decoded) {
                    console.error('Access token verification failed:', err?.message || 'No decoded data');
                    return res.status(HttpStatusCode.FORBIDDEN).json({ message: 'Invalid access token' });
                }
                req.user = decoded;
                if (typeof decoded !== 'string') {
                    req.role = decoded.role;
                }
                console.log('Decoded user from token:', req.user);
                next();
            });
        }
    }
    catch (error) {
        console.error('Authentication middleware error:', error);
        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
};
// Middleware to check if the user has a specific role
export const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.role) {
            return res.status(HttpStatusCode.FORBIDDEN).json({ message: 'Access denied. No role specified.' });
        }
        if (allowedRoles.includes(req.role)) {
            next();
        }
        else {
            res.status(HttpStatusCode.FORBIDDEN).json({ message: 'Access denied. Insufficient permissions.' });
        }
    };
};
