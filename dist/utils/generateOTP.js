import crypto from 'crypto';
const generateOTP = () => {
    const otp = crypto.randomInt(1000, 9999).toString();
    return otp;
};
export default generateOTP;
