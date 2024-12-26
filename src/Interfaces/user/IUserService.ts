import { IUserInput } from "../../models/userModel.js";

export interface IUserService {
  // Registers a new user
  register(
    name: string,
    email: string,
    password: string,
    phone: string
  ): Promise<IUserInput>;

  // Logs in a user
  login(email: string, password: string): Promise<{
    user: IUserInput;
    accessToken: string;
    refreshToken: string;
  }>;

  // Logs in a user via Google OAuth
  googleLogin(token: string): Promise<{
    newUser: IUserInput;
    Access_Token: string;
    Refresh_Token: string;
  }>;

  // Logs out a user by removing the refresh token
  logout(refreshToken: string): Promise<void>;

  // Fetches the profile of a user by userId
  getProfile(userId: string): Promise<IUserInput | null>;

  // Updates the profile of a user
  updateUserProfile(userId: string, profileData: any): Promise<IUserInput | null>;
  // changePasswordService(userId:string,currentPass:string,newPass:string):Promise<any>
  userChangePasswordService(userId: string, currentPassword: string, newPassword: string, confirmPassword: string): Promise<string>
  changeUserPremium(userId:string):Promise<any>
  checkUserPremiuStatus(userId:string):Promise<any>
  getAllAvailableDoctors():Promise<any>
}
