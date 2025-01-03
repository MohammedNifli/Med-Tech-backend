import { IUserInput } from "../../models/userModel.js";
import { IUser } from "../../types/user.types.js";

export interface IUserRepo {
  
  findByEmail(email: string): Promise<IUserInput | null>;

  
  createUser(user: Partial<IUserInput>): Promise<IUserInput>;

  
  userVerification(email: string, isVerified: boolean): Promise<boolean>;

  
  getProfile(userId: string): Promise<IUserInput | null>;

  
  updateUserProfile(userId: string, profileData: any): Promise<IUserInput | null>;

  
  fetchAllUsers(): Promise<IUserInput[]>;

  
  blockUser(userId: string): Promise<any>;

 
  unBlockUser(userId: string): Promise<any>;
  
  passwordChanging(userId:string,newPass:string):Promise<any>
   searchUser(data: string): Promise<any>
   checkCurrentPassword(userId: string, currentPassword: string): Promise<boolean>
   updateUserPassword(userId: string, newPassword: string): Promise<any> 
   changeUserPremiumsStatus(userId:string):Promise<IUser>
   getPremiumStatus(userId: string): Promise<any>
   getAllAvailableDoctors():Promise<any>
}
