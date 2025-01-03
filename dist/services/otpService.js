import generateOTP from "../utils/generateOTP.js";
import sendMail from "../config/mailer.js";
import bcrypt from "bcryptjs";
class OtpService {
    otpRepo;
    userRepo;
    constructor(otpRepo, userRepo) {
        this.otpRepo = otpRepo;
        this.userRepo = userRepo;
    }
    async hashOtp(otp) {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(otp, salt);
    }
    async sendOTP(email) {
        try {
            const otp = generateOTP();
            const otpHash = await this.hashOtp(otp);
            const newOTP = await this.otpRepo.sendOTP(email, otpHash);
            await sendMail(email, otp);
            return newOTP;
        }
        catch (error) {
            console.log(error);
            throw new Error("Error sending OTP");
        }
    }
    async verifyOTP(email, otp) {
        try {
            if (!email)
                return { success: false, message: "Email is required" };
            const otpData = await this.otpRepo.verifyOTP(email);
            if (!otpData || !otpData.otpHash) {
                return { success: false, message: "OTP not found or expired" };
            }
            const isOtpValid = await bcrypt.compare(otp, otpData.otpHash);
            if (isOtpValid) {
                const isUserVerified = await this.userRepo.userVerification(email, true);
                if (isUserVerified) {
                    return {
                        success: true,
                        message: "OTP verified, account is now verified.",
                    };
                }
                else {
                    return {
                        success: false,
                        message: "Error updating user verification status.",
                    };
                }
            }
            else {
                return { success: false, message: "Invalid OTP" };
            }
        }
        catch (error) {
            return { success: false, message: "Internal server error" };
        }
    }
    async resendOTP(email) {
        try {
            if (!email) {
                throw new Error("email is not found");
            }
            const otp = generateOTP();
            const hashOtp = await this.hashOtp(otp);
            const newOTP = await this.otpRepo.sendOTP(email, hashOtp);
            await sendMail(email, otp);
            return newOTP;
        }
        catch (error) {
            throw Error('error occuring in resendOTP');
        }
    }
    async docOTPService(email) {
        try {
            if (!email) {
                throw new Error("email is not found");
            }
            const otp = generateOTP();
            const otpHash = await this.hashOtp(otp);
            const docOTP = await this.otpRepo.docSendOTPRepo(email, otpHash);
            await sendMail(email, otp);
            return docOTP;
        }
        catch (error) {
            throw error;
        }
        finally {
            return null;
        }
    }
}
export default OtpService;
