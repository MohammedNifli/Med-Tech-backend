import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import DoctorModel from "../models/doctorModel.js";
class UserRepositories {
    async findByEmail(email) {
        return User.findOne({ email });
    }
    async createUser(user) {
        try {
            const newUser = new User(user);
            return await newUser.save();
        }
        catch (error) {
            console.error(`Error creating newUser: ${error}`);
            throw new Error("Database Error");
        }
    }
    async userVerification(email, isVerified) {
        try {
            const userStatus = await User.findOneAndUpdate({ email: email }, { $set: { isVerified: isVerified } }, { new: true });
            if (!userStatus)
                return false;
            return true;
        }
        catch (error) {
            return false;
        }
    }
    async getProfile(userId) {
        try {
            const userProfile = await User.findById(userId);
            if (!userProfile) {
                return null;
            }
            return userProfile;
        }
        catch (error) {
            return null;
        }
    }
    async updateUserProfile(userId, profileData) {
        try {
            const updatedProfile = await User.findByIdAndUpdate(userId, {
                $set: {
                    name: profileData.name,
                    email: profileData.email,
                    phone: profileData.phone,
                    gender: profileData.gender,
                    photo: profileData.photo,
                },
            }, { new: true });
            return updatedProfile;
        }
        catch (error) {
            throw error;
        }
    }
    async fetchAllUsers() {
        try {
            return await User.find({ isVerified: true });
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async blockUser(userId) {
        try {
            const updatedUserAccess = await User.findByIdAndUpdate(userId, { $set: { isBlocked: true } }, { new: true });
            return updatedUserAccess;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async unBlockUser(userId) {
        try {
            const unBlockedUser = await User.findByIdAndUpdate(userId, { $set: { isBlocked: false } }, { new: true });
            if (!unBlockedUser) {
                throw new Error("User not found");
            }
            return unBlockedUser;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async passwordChanging(userId, newPass) {
        try {
            const updatedUser = await User.findOneAndUpdate({ _id: userId }, { $set: { password: newPass } }, { new: true });
            if (updatedUser) {
                return true;
            }
            else {
                return false;
            }
        }
        catch (error) {
            return false;
        }
    }
    async searchUser(data) {
        try {
            const regex = new RegExp(data, "i");
            const users = await User.find({
                $or: [
                    { name: { $regex: regex } },
                    { email: { $regex: regex } },
                    { phone: { $regex: regex } },
                ],
            }).exec();
            return users;
        }
        catch (error) {
            throw new Error("Error in user repository");
        }
    }
    async checkCurrentPassword(userId, currentPassword) {
        try {
            const user = await User.findOne({ _id: userId });
            if (!user)
                return false;
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            return isMatch;
        }
        catch (error) {
            return false;
        }
    }
    async updateUserPassword(userId, hashedPassword) {
        try {
            const updatedUser = await User.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true });
            return updatedUser;
        }
        catch (error) {
            throw new Error("An error occurred while updating the password.");
        }
    }
    async changeUserPremiumsStatus(userId) {
        try {
            const changedStatus = await User.findOneAndUpdate({ _id: userId }, { $set: { isPremium: true } }, { new: true, upsert: false });
            if (!changedStatus) {
                throw new Error(`User with ID ${userId} not found`);
            }
            return changedStatus;
        }
        catch (error) {
            throw new Error(`Failed to change premium status: ${error.message}`);
        }
    }
    async getPremiumStatus(userId) {
        try {
            const status = await User.findById(userId, "isPremium");
            if (!status) {
                throw new Error("User not found");
            }
            return { isPremium: status.isPremium };
        }
        catch (error) {
            throw new Error(`Error fetching premium status: ${error.message}`);
        }
    }
    async getAllAvailableDoctors() {
        try {
            const availableDoctors = await DoctorModel.find({
                "accountStatus.verificationStatus": "verified",
            });
            return availableDoctors;
        }
        catch (error) {
            throw new Error("Error occurred in the repository while fetching doctors");
        }
    }
}
export default UserRepositories;
