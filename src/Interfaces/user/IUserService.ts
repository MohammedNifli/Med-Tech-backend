import { IUserInput } from "../../models/userModel.js";
import { IUser } from "../../types/user.types.js";

export interface IUserService {
  
  register(
    name: string,
    email: string,
    password: string,
    phone: string
  ): Promise<IUserInput>;

  
  login(email: string, password: string): Promise<{
    user: IUserInput;
    accessToken: string;
    refreshToken: string;
  }>;

 
  googleLogin(token: string): Promise<{
    newUser: IUserInput;
    Access_Token: string;
    Refresh_Token: string;
  }>;

  
  logout(refreshToken: string): Promise<void>;

  
  getProfile(userId: string): Promise<IUserInput | null>;

  
  updateUserProfile(userId: string, profileData: any): Promise<IUserInput | null>;
 
  changePassword(userId: string, currentPassword: string, newPassword: string, confirmPassword: string): Promise<string>
  changeUserPremium(userId:string):Promise<IUser>
  checkUserPremiuStatus(userId:string):Promise<any>
  getAllAvailableDoctors():Promise<any>
}
