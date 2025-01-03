import User from '../models/userModel.js';
import Doctor from '../models/doctorModel.js';
import { HttpStatusCode } from '../enums/httpStatusCodes.js';
const checkBlocked = async (req, res, next) => {
    try {
        const userId = req.user?.Id;
        const role = req.user?.role;
        console.log('checkBlock middleware role', role);
        console.log('current user id', userId);
        if (!userId || !role) {
            return res.status(401).json({ message: 'User is not authenticated.' });
        }
        let user;
        if (role === 'doctor') {
            user = await Doctor.findById(userId);
            console.log("doctor user", user);
        }
        else if (role === 'user') {
            user = await User.findById(userId);
        }
        else if (role === 'admin') {
            return next(); // Skip the block check for admin
        }
        else {
            return res.status(HttpStatusCode.FORBIDDEN).json({ message: 'Invalid role.' });
        }
        if (user?.isBlocked == true) {
            return res.status(HttpStatusCode.FORBIDDEN).json({ message: 'Your account is blocked. Please contact support.' });
        }
        next();
    }
    catch (error) {
        console.error('Error checking user block status:', error);
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Error checking user status' });
    }
};
export default checkBlocked;
