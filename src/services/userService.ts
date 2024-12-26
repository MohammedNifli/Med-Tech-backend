import userRepo from "../repositories/userRepo.js";
import bcrypt from 'bcryptjs';
import accessToken from '../utils/accessToken.js'
import refreshToken from "../utils/refreshToken.js";
import generateOTP from "../utils/generateOTP.js";
import mailer from '../config/mailer.js'
import RefreshToken from "../models/refreshToken.js";
import authRepo from '../repositories/authRepository.js'

import verifyToken from "../utils/verifyGoogle.js";
import generatePassword from "../utils/generatePassword.js";

import  { IUserInput } from '../models/userModel.js'

import { OAuth2Client } from "google-auth-library";
import { IUserService } from "../Interfaces/user/IUserService.js";
import { IUserRepo } from "../Interfaces/user/IUserRepo.js";
import { HttpStatusCode } from "axios";

class AuthService implements IUserService {
  private userRepo:IUserRepo;
  constructor(userRepo:IUserRepo){
    this.userRepo=userRepo
  }
                                                                                                                                                                                                              
    public async register(name: string, email: string, password: string, phone: string): Promise<IUserInput> {
        try {
            // Check if the user already exists
            const existingUser = await this.userRepo.findByEmail(email);
            if (existingUser) {
                console.log("existingUser", existingUser);
                throw new Error("User already exists");
            }
    
            // Validate input credentials
            if (!name || !email || !password || !phone ) {
                throw new Error("All credentials must be provided");
            }
    
            // Hash the password before saving
            const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

        

            
            // Create a new user with the hashed password
            const newUser = await this.userRepo.createUser({ name, email, password: hashedPassword, phone});
          

    
            return newUser;
    
        } catch (error) {
            console.error("Error in register method:", error);
            throw error; // Re-throw the error for further handling
        }
    }

    public async login(email: string, password: string):Promise<any>{
        const user = await this.userRepo.findByEmail(email);
  
        console.log("user",user?._id)
      
      
        if (!user) {
            throw new Error("User not found");
        }
  
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid password");
        }
        if(!user.isVerified){
          throw new Error('user is not verfied')
        }
        const Access_Token = accessToken(user._id.toString(),'user');
  
        const Refresh_Token=await refreshToken(user._id.toString(),'user')
        console.log("refreshaakki",Refresh_Token)
        
  
        // Return the user and the generated token
        return {user,accessToken:Access_Token,refreshToken:Refresh_Token} ;
  

    }

    //Gooogle login service 

    public async googleLogin(token: string):Promise<{ newUser: IUserInput; Access_Token: string; Refresh_Token: string }>{
        try {
          const client = new OAuth2Client(process.env.CLIENT_ID, process.env.CLIENT_SECRET);
          const payload = await verifyToken(token, client);
    
          const { name, email } = payload;
          const password = generatePassword();
          const phone = ''; // Default empty phone if not provided
    
          console.log("Generated password:", password);
    
          // Check if the user already exists
          let user = await this.userRepo.findByEmail(email);
          if (!user) {
            // Create new user if not found
            user = await this.userRepo.createUser({ name, email, password, phone });
          } 
    
          // Generate tokens
          const Access_Token =  accessToken(user._id.toString(), "user");
          const Refresh_Token = await refreshToken(user._id.toString(), "user");
    
          return { newUser: user, Access_Token, Refresh_Token };
        } catch (error: any) {
          console.error("Error in Google login service:", error.message);
          throw new Error('Google Login Failed: ' + error.message);
        }
      }

    //logout function
    public async logout(refreshToken: string): Promise<void> {
        try {
          // Remove the refresh token from the database
          await authRepo.removeToken(refreshToken);
        } catch (error) {
          console.error('Error during logout:', error);
          throw new Error('Failed to remove token');
        }
      }

      //fetching user profile
      public async getProfile(userId: string): Promise<IUserInput | null> {
        try {
          const fetchProfile = await this.userRepo.getProfile(userId);
          if(!fetchProfile){
            return null;
          }
          
          return fetchProfile as IUserInput;
        } catch (error) {
          console.log(error);
          throw new Error("failed remove token"); // Re-throw the error for further handling
          
        }
      }

      public async updateUserProfile(userId:string,profileData:any):Promise<IUserInput | null>{
        try {
          // Validate if the userId is provided
          if (!userId) {
            throw new Error("UserId is not provided");
          }
      
          // Call the repository method to update the user profile
          const updatedProfile = await this.userRepo.updateUserProfile(userId, profileData);
          
          return updatedProfile ;
        } catch (error:any) {
          console.error("Error in service while updating profile:", error);
          throw error;
        }

      }

      

    //update password service 

    public async userChangePasswordService(userId: string, currentPassword: string, newPassword: string, confirmPassword: string): Promise<string> {
      try {
        // Step 1: Verify current password
        const isCurrentPasswordCorrect = await this.userRepo.checkCurrentPassword(userId, currentPassword);
        if (!isCurrentPasswordCorrect) {
          return "Current password is incorrect.";
        }
    
        // Step 2: Ensure new password and confirm password match
        if (newPassword !== confirmPassword) {
          return "New password and confirm password do not match.";
        }
    
        // Step 3: Hash and update the new password in the database
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await this.userRepo.updateUserPassword(userId, hashedNewPassword);
    
        return "Password updated successfully.";
        
      } catch (error) {
        console.log("Error in userChangePasswordService:", error);
        throw new Error("An error occurred while changing the password.");
      }
    }

    public async changeUserPremium(userId:string):Promise<any>{
      try{
        if(!userId){
          throw new Error('user Id is missing')
        }
          const changedStatus=await this.userRepo.changeUserPremiumsStatus(userId);
          return changedStatus

      }catch(error:any){
        throw new Error(error.message)
      }
    }

    public async checkUserPremiuStatus(userId:string):Promise<any>{
      try{

        const premiumStatus=await  this.userRepo.getPremiumStatus(userId);
        return premiumStatus

      }catch(error:any){
        throw Error(error.message)
      }
    }


    public async getAllAvailableDoctors(): Promise<any> {
      try {
        const availableDoctors = await this.userRepo.getAllAvailableDoctorsRepo();
        return availableDoctors;
      } catch (error: any) {
        console.error('Error in service layer:', error.message);
        throw new Error('Error occurred in the service layer while fetching doctors');
      }
    }
}

export default  AuthService;
