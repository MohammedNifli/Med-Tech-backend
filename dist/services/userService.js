import bcrypt from "bcryptjs";
import accessToken from "../utils/accessToken.js";
import refreshToken from "../utils/refreshToken.js";
import authRepo from "../repositories/authRepository.js";
import verifyToken from "../utils/verifyGoogle.js";
import generatePassword from "../utils/generatePassword.js";
import { OAuth2Client } from "google-auth-library";
class AuthService {
    userRepo;
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async register(name, email, password, phone) {
        try {
            if (name && email && password && phone) {
                const existingUser = await this.userRepo.findByEmail(email);
                if (!existingUser) {
                    const hashedPassword = await bcrypt.hash(password, 10);
                    return await this.userRepo.createUser({
                        name,
                        email,
                        password: hashedPassword,
                        phone,
                    });
                }
                console.log("existingUser", existingUser);
                throw new Error("User already exists");
            }
            throw new Error("All credentials must be provided");
        }
        catch (error) {
            console.error("Error in register method:", error);
            throw error;
        }
    }
    async login(email, password) {
        const user = await this.userRepo.findByEmail(email);
        if (!user) {
            throw new Error("User not found");
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid password");
        }
        if (!user.isVerified) {
            throw new Error("user is not verfied");
        }
        const Access_Token = accessToken(user._id.toString(), "user");
        const Refresh_Token = await refreshToken(user._id.toString(), "user");
        return { user, accessToken: Access_Token, refreshToken: Refresh_Token };
    }
    async googleLogin(token) {
        try {
            const client = new OAuth2Client(process.env.CLIENT_ID, process.env.CLIENT_SECRET);
            const payload = await verifyToken(token, client);
            const { name, email } = payload;
            const password = generatePassword();
            const phone = "";
            console.log("Generated password:", password);
            let user = await this.userRepo.findByEmail(email);
            if (!user) {
                user = await this.userRepo.createUser({ name, email, password, phone });
            }
            const Access_Token = accessToken(user._id.toString(), "user");
            const Refresh_Token = await refreshToken(user._id.toString(), "user");
            return { newUser: user, Access_Token, Refresh_Token };
        }
        catch (error) {
            console.error("Error in Google login service:", error.message);
            throw new Error("Google Login Failed: " + error.message);
        }
    }
    async logout(refreshToken) {
        try {
            await authRepo.removeToken(refreshToken);
        }
        catch (error) {
            console.error("Error during logout:", error);
            throw new Error("Failed to remove token");
        }
    }
    async getProfile(userId) {
        try {
            const fetchProfile = await this.userRepo.getProfile(userId);
            if (!fetchProfile)
                return null;
            return fetchProfile;
        }
        catch (error) {
            console.log(error);
            throw new Error("failed remove token");
        }
    }
    async updateUserProfile(userId, profileData) {
        try {
            if (!userId)
                throw new Error("UserId is not provided");
            const updatedProfile = await this.userRepo.updateUserProfile(userId, profileData);
            return updatedProfile;
        }
        catch (error) {
            console.error("Error in service while updating profile:", error);
            throw error;
        }
    }
    async changePassword(userId, currentPassword, newPassword, confirmPassword) {
        try {
            const isCurrentPasswordCorrect = await this.userRepo.checkCurrentPassword(userId, currentPassword);
            if (!isCurrentPasswordCorrect)
                return "Current password is incorrect.";
            if (newPassword !== confirmPassword)
                return "New password and confirm password do not match.";
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            await this.userRepo.updateUserPassword(userId, hashedNewPassword);
            return "Password updated successfully.";
        }
        catch (error) {
            throw new Error("An error occurred while changing the password.");
        }
    }
    async changeUserPremium(userId) {
        try {
            if (!userId)
                throw new Error("user Id is missing");
            const changedStatus = await this.userRepo.changeUserPremiumsStatus(userId);
            return changedStatus;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async checkUserPremiuStatus(userId) {
        try {
            if (!userId)
                throw new Error('user Id is missing');
            const premiumStatus = await this.userRepo.getPremiumStatus(userId);
            return premiumStatus;
        }
        catch (error) {
            throw Error(error.message);
        }
    }
    async getAllAvailableDoctors() {
        try {
            const availableDoctors = await this.userRepo.getAllAvailableDoctors();
            return availableDoctors;
        }
        catch (error) {
            throw new Error("Error occurred in the service layer while fetching doctors");
        }
    }
}
export default AuthService;
