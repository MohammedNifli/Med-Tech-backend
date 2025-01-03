import crypto from "crypto";
import generateOTP from "../utils/generateOTP.js";
import sendMail from "../config/mailer.js";
import { IOtpService } from "../Interfaces/otp/IOtpService.js";
import { IOtpRepository } from "../Interfaces/otp/IOtpRepository .js";
import { IUserRepo } from "../Interfaces/user/IUserRepo.js";
import bcrypt from "bcryptjs";

class OtpService implements IOtpService {
  private otpRepo: IOtpRepository;
  private userRepo: IUserRepo;

  constructor(otpRepo: IOtpRepository, userRepo: IUserRepo) {
    this.otpRepo = otpRepo;
    this.userRepo = userRepo;
  }

  private async hashOtp(otp: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(otp, salt);
  }

  public async sendOTP(email: string): Promise<string> {
    try {
      const otp = generateOTP();
      const otpHash = await this.hashOtp(otp);
      const newOTP = await this.otpRepo.sendOTP(email, otpHash);

      await sendMail(email, otp);
      return newOTP;
    } catch (error) {
      console.log(error);
      throw new Error("Error sending OTP");
    }
  }

  public async verifyOTP(
    email: string,
    otp: string
  ): Promise<{ success: boolean; message: string }> {
    try {
     
      if (!email)  return { success: false, message: "Email is required" };


     
      const otpData = await this.otpRepo.verifyOTP(email);

     
      if (!otpData || !otpData.otpHash) {
        return { success: false, message: "OTP not found or expired" };
      }

     
      const isOtpValid: boolean = await bcrypt.compare(otp, otpData.otpHash);

      if (isOtpValid) {
       
        const isUserVerified =await this.userRepo.userVerification(email, true);

        if (isUserVerified) {
          return {
            success: true,
            message: "OTP verified, account is now verified.",
          };
        } else {
          return {
            success: false,
            message: "Error updating user verification status.",
          };
        }
      } else {
        return { success: false, message: "Invalid OTP" }; 
      }
    } catch (error: any) {
  
      return { success: false, message: "Internal server error" };
    }
  }

  public async resendOTP(email: string): Promise<any> {
    try{
      if(!email){
          throw new Error("email is not found")
      }
      const otp= generateOTP();
      const hashOtp=await this.hashOtp(otp)
      const newOTP = await this.otpRepo.sendOTP(email, hashOtp);
      await sendMail(email,otp)
      return newOTP;


    }catch(error){
      
      throw Error('error occuring in resendOTP');
    }
  }

  public async docOTPService(email: string): Promise<string | null> {
    try {
      if (!email) {
        throw new Error("email is not found");
      }

      const otp = generateOTP();
      const otpHash = await this.hashOtp(otp);
      const docOTP = await this.otpRepo.docSendOTPRepo(email, otpHash);
      await sendMail(email, otp);
      return docOTP;
    } catch (error) {
      
      throw error; 
    } finally {
      return null; 
    }
  }

  
}

export default OtpService;
