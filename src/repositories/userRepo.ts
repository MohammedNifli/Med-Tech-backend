import { IUserRepo } from "../Interfaces/user/IUserRepo.js";
import User, { IUserInput } from "../models/userModel.js";
import bcrypt from 'bcryptjs'
import DoctorModel from "../models/doctorModel.js";



class UserRepositories implements IUserRepo {
 

  // Find user by email
  public async findByEmail(email: string): Promise<IUserInput | null> {
    return User.findOne({ email });
  }

  // Create a new user
  public async createUser(user: Partial<IUserInput>): Promise<IUserInput> {
    try {
      const newUser = new User(user);
      return await newUser.save();
    } catch (error) {
      console.error(`Error creating newUser: ${error}`);
      throw new Error("Database Error");
    }
  }

  // Update user verification status
  public async userVerification(email: string, isVerified: boolean): Promise<boolean> {
    try {
        // Find the user by email and update the isVerified field
        const userStatus = await User.findOneAndUpdate(
            { email: email },
            { $set: { isVerified: isVerified } },
            { new: true } // Return the updated document
        );

        // Check if the user was found and updated
        if (userStatus) {
            console.log(`User with email ${email} successfully verified.`);
            return true;
        } else {
            console.error(`User with email ${email} not found or verification status update failed.`);
            return false;
        }
    } catch (error: any) {
        // Log the error and return false
        console.error(`Error in userVerification: ${error.message}`);
        return false; // Return false if an error occurs
    }
}

  // Get user profile by ID
  public async getProfile(userId: string): Promise<IUserInput | null> {
    try {
      const userProfile = await User.findById(userId);
      if (!userProfile) {
        return null;
      }
      return userProfile as IUserInput;
    } catch (error) {
      console.error("Error fetching user profile", error);
      return null;
    }
  }

  // Update user profile
  public async updateUserProfile(userId: string, profileData: any): Promise<IUserInput> {
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
        { new: true } // Return the updated document
      );
      return updatedProfile as IUserInput;
    } catch (error) {
      console.error("Error in repository while updating profile:", error);
      throw error;
    }
  }

  // Fetch all verified users
  public async fetchAllUsers() {
    try {
      return await User.find({ isVerified: true });
    } catch (error: any) {
      console.error("Error fetching users from DB", error);
      throw new Error(error.message);
    }
  }

  // Block a user by ID
  public async blockUser(userId: string): Promise<any> {
    try {
      const updatedUserAccess = await User.findByIdAndUpdate(
        userId,
        { $set: { isBlocked: true } },
        { new: true } // Return the updated document
      );
      return updatedUserAccess;
    } catch (error: any) {
      console.error("Error in blocking user:", error);
      throw new Error(error.message);
    }
  }

  // Unblock a user by ID
  public async unBlockUser(userId: string): Promise<any> {
    try {
      const unBlockedUser = await User.findByIdAndUpdate(
        userId,
        { $set: { isBlocked: false } },
        { new: true } // Return the updated document
      );
      
      if (!unBlockedUser) {
        throw new Error('User not found');
      }

      console.log('User unblocked successfully:', unBlockedUser);
      return unBlockedUser;
    } catch (error: any) {
      console.error('Error in unblocking user:', error);
      throw new Error(error.message);
    }
  }

  public async passwordChanging(userId: string, newPass: string): Promise<boolean> {
    try {
        // Update the password in the database
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId },
            { $set: { password: newPass } },
            { new: true } // Returns the updated document
        );

        // If updatedUser is not null, the password was successfully updated
        if (updatedUser) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error("Error in passwordChanging:", error);
        return false;
    }
}

public async searchUser(data: string): Promise<any> {
  try {
      // Use a regex to match name, email, or phone number
      const regex = new RegExp(data, 'i'); // 'i' for case-insensitive matching
      const users = await User.find({
          $or: [
              { name: { $regex: regex } },
              { email: { $regex: regex } },
              { phone: { $regex: regex } }
          ]
      }).exec();
      return users; // Return the array of matching users
  } catch (error) {
      console.error(error);
      throw new Error('Error in user repository');
  }
}

public async checkCurrentPassword(userId: string, currentPassword: string): Promise<boolean> {
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) return false; // If the user doesn't exist

    // Assuming you're using bcrypt for password hashing
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    return isMatch;
    
  } catch (error) {
    console.log("Error checking current password:", error);
    return false;
  }
}

public async updateUserPassword(userId: string, hashedPassword: string): Promise<any> {
  try {
    // Update the user password with the hashed password
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    );

    return updatedUser;
  } catch (error) {
    console.log("Error updating user password:", error);
    throw new Error("An error occurred while updating the password.");
  }
}


public async changeUserPremiumsStatus(userId: string): Promise<any> {
  try {
    // Using `findOneAndUpdate` to update the user and return the modified document
    const changedStatus = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { isPremium: true } }, // Ensure only `isPremium` field is updated
      { new: true, upsert: false } // `new: true` returns the updated document, `upsert: false` prevents creating a new one
    );

    if (!changedStatus) {
      throw new Error(`User with ID ${userId} not found`);
    }

    console.log("changedStatus", changedStatus);
    return changedStatus;
  } catch (error: any) {
    console.error("Error changing premium status:", error);
    throw new Error(`Failed to change premium status: ${error.message}`);
  }
}

public async getPremiumStatus(userId: string): Promise<any> {
  try {
    const status = await User.findById(userId, 'isPremium');
    if (!status) {
      throw new Error('User not found');
    }
    return { isPremium: status.isPremium };
  } catch (error: any) {
    throw new Error(`Error fetching premium status: ${error.message}`);
  }
}


public async getAllAvailableDoctorsRepo(): Promise<any> {
  try {
    const availableDoctors = await DoctorModel.find({
      'accountStatus.verificationStatus': "verified",
    });
    return availableDoctors;
  } catch (error: any) {
    console.error('Error in repository layer:', error.message);
    throw new Error('Error occurred in the repository while fetching doctors');
  }
}


}

export default UserRepositories;
