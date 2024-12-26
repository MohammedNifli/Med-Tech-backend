import { IUserInput } from "../../models/userModel.js";

export interface IUserRepo {
  // Finds a user by their email address
  findByEmail(email: string): Promise<IUserInput | null>;

  // Creates a new user
  createUser(user: Partial<IUserInput>): Promise<IUserInput>;

  // Updates the verification status of a user by email
  userVerification(email: string, isVerified: boolean): Promise<boolean>;

  // Fetches a user's profile by their userId
  getProfile(userId: string): Promise<IUserInput | null>;

  // Updates a user's profile by their userId
  updateUserProfile(userId: string, profileData: any): Promise<IUserInput | null>;

  // Fetches all verified users
  fetchAllUsers(): Promise<IUserInput[]>;

  // Blocks a user by their userId
  blockUser(userId: string): Promise<any>;

  // Unblocks a user by their userId
  unBlockUser(userId: string): Promise<any>;
  // userVerification(email:string):Promise<any>
  passwordChanging(userId:string,newPass:string):Promise<any>
   searchUser(data: string): Promise<any>
   checkCurrentPassword(userId: string, currentPassword: string): Promise<boolean>
   updateUserPassword(userId: string, newPassword: string): Promise<any> 
   changeUserPremiumsStatus(userId:string):Promise<any>
   getPremiumStatus(userId: string): Promise<any>
   getAllAvailableDoctorsRepo():Promise<any>
}
