import { IUserRepo } from "../Interfaces/user/IUserRepo.js";
import User, { IUserInput } from "../models/userModel.js";
import bcrypt from "bcryptjs";
import DoctorModel from "../models/doctorModel.js";
import { PremiumStatus ,IUser} from "../types/user.types.js";

class UserRepositories implements IUserRepo {
 
  public async findByEmail(email: string): Promise<IUserInput | null> {
    return User.findOne({ email });
  }

  public async createUser(user: Partial<IUserInput>): Promise<IUserInput> {
    try {
      const newUser = new User(user);
      return await newUser.save();
    } catch (error) {
      console.error(`Error creating newUser: ${error}`);
      throw new Error("Database Error");
    }
  }

  public async userVerification(
    email: string,
    isVerified: boolean
  ): Promise<boolean> {
    try {
      const userStatus = await User.findOneAndUpdate(
        { email: email },
        { $set: { isVerified: isVerified } },
        { new: true }
      );

      if (!userStatus)  return false;
      return true;
     
    } catch (error: any) {
     
      return false;
    }
  }

  public async getProfile(userId: string): Promise<IUserInput | null> {
    try {
      const userProfile = await User.findById(userId);
      if (!userProfile) {
        return null;
      }
      return userProfile as IUserInput;
    } catch (error) {
     
      return null;
    }
  }

  public async updateUserProfile(
    userId: string,
    profileData: any
  ): Promise<IUserInput> {
    try {
      const updatedProfile = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            name: profileData.name,
            email: profileData.email,
            phone: profileData.phone,
            gender: profileData.gender,
            photo: profileData.photo,
          },
        },
        { new: true }
      );
      return updatedProfile as IUserInput;
    } catch (error) {
      
      throw error;
    }
  }

  public async fetchAllUsers() {
    try {
      return await User.find({ isVerified: true });
    } catch (error: any) {
      
      throw new Error(error.message);
    }
  }

  public async blockUser(userId: string): Promise<any> {
    try {
      const updatedUserAccess = await User.findByIdAndUpdate(
        userId,
        { $set: { isBlocked: true } },
        { new: true }
      );
      return updatedUserAccess;
    } catch (error: any) {
     
      throw new Error(error.message);
    }
  }

  public async unBlockUser(userId: string): Promise<any> {
    try {
      const unBlockedUser = await User.findByIdAndUpdate(
        userId,
        { $set: { isBlocked: false } },
        { new: true }
      );

      if (!unBlockedUser) {
        throw new Error("User not found");
      }

    
      return unBlockedUser;
    } catch (error: any) {
      
      throw new Error(error.message);
    }
  }

  public async passwordChanging(
    userId: string,
    newPass: string
  ): Promise<boolean> {
    try {
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId },
        { $set: { password: newPass } },
        { new: true }
      );

      if (updatedUser) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      
      return false;
    }
  }

  public async searchUser(data: string): Promise<IUser[]> {
    try {
      const regex = new RegExp(data, "i");
      const users = await User.find({
        $or: [
          { name: { $regex: regex } },
          { email: { $regex: regex } },
          { phone: { $regex: regex } },
        ],
      }).exec();
      return users as IUser [];
    } catch (error) {
      
      throw new Error("Error in user repository");
    }
  }

  public async checkCurrentPassword(
    userId: string,
    currentPassword: string
  ): Promise<boolean> {
    try {
      const user = await User.findOne({ _id: userId });
      if (!user) return false;

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      return isMatch;
    } catch (error) {
      
      return false;
    }
  }

  public async updateUserPassword(
    userId: string,
    hashedPassword: string
  ): Promise<any> {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { password: hashedPassword },
        { new: true }
      );

      return updatedUser;
    } catch (error) {
      
      throw new Error("An error occurred while updating the password.");
    }
  }

  public async changeUserPremiumsStatus(userId: string): Promise<IUser> {
    try {
      const changedStatus = await User.findOneAndUpdate(
        { _id: userId },
        { $set: { isPremium: true } },
        { new: true, upsert: false }
      );

      if (!changedStatus) {
        throw new Error(`User with ID ${userId} not found`);
      }

     
      return changedStatus;
    } catch (error: any) {
      
      throw new Error(`Failed to change premium status: ${error.message}`);
    }
  }

  public async getPremiumStatus(userId: string): Promise<PremiumStatus> {
    try {
      const status = await User.findById(userId, "isPremium");
      if (!status) {
        throw new Error("User not found");
      }
      return { isPremium: status.isPremium };
    } catch (error: any) {
      throw new Error(`Error fetching premium status: ${error.message}`);
    }
  }

  public async getAllAvailableDoctors(): Promise<any> {
    try {
      const availableDoctors = await DoctorModel.find({
        "accountStatus.verificationStatus": "verified",
      });
      return availableDoctors;
    } catch (error: any) {
     
      throw new Error(
        "Error occurred in the repository while fetching doctors"
      );
    }
  }
}

export default UserRepositories;
