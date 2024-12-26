import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken';
import  generateAccessToken  from '../utils/accessToken.js';

// Extending the Request interface to add the `user` and `role` properties
interface AuthenticatedRequest extends Request {
  user?: JwtPayload | string;
  role?: string;
}

export const authentication = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;
    console.log('accesToken',token);
    console.log('refreshToken',refreshToken)
   

    if (!token) {
      // No access token, check for a refresh token
      if (!refreshToken) {
        return res.status(401).json({ message: 'Access token and refresh token are missing' });
      }

      // Verify the refresh token
      jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN!, (err: VerifyErrors | null, decoded: JwtPayload | string | undefined) => {
        if (err || !decoded) {
          console.error('Refresh token verification failed:', err?.message || 'No decoded data');
          return res.status(403).json({ message: 'Invalid refresh token' });
        }

        let newAccessToken: string;
        let role: string;
        if (typeof decoded === 'string') {
          newAccessToken = generateAccessToken('anonymous', 'guest');
          role = 'guest';
        } else {
          const { Id, role: decodedRole } = decoded as JwtPayload;
          newAccessToken = generateAccessToken(Id, decodedRole);
          role = decodedRole;
        }

        res.cookie('accessToken', newAccessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        req.user = decoded;
        const user1=req.user;
        console.log("user1",user1)
        req.role = role;
        console.log('New access token generated and user from refresh token:', req.user);
        next();
      });
    } else {
      // Verify the JWT access token
      jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET!, (err: VerifyErrors | null, decoded: JwtPayload | string | undefined) => {
        if (err || !decoded) {
          console.error('Access token verification failed:', err?.message || 'No decoded data');
          return res.status(403).json({ message: 'Invalid access token' });
        }

        req.user = decoded;
        if (typeof decoded !== 'string') {
          req.role = decoded.role;
        }
        console.log('Decoded user from token:', req.user);
        next();
      });
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Middleware to check if the user has a specific role
export const checkRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.role) {
      return res.status(403).json({ message: 'Access denied. No role specified.' });
    }

    if (allowedRoles.includes(req.role)) {
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
  };
};