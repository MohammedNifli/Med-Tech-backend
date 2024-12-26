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
      // Check if the email is provided
      if (!email) {
        return { success: false, message: "Email is required" };
      }

      // Fetch OTP data from the repository
      const otpData = await this.otpRepo.verifyOTP(email);

      // Check if OTP data is available
      if (!otpData || !otpData.otpHash) {
        return { success: false, message: "OTP not found or expired" };
      }

      // Compare the provided OTP with the hashed OTP from the database
      const isOtpValid: boolean = await bcrypt.compare(otp, otpData.otpHash);

      if (isOtpValid) {
        // If OTP is valid, update user verification status
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
        return { success: false, message: "Invalid OTP" }; // If OTP doesn't match
      }
    } catch (error: any) {
      console.error("Error in verifyOTP:", error);
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
      console.log(error)
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
      console.log(error);
      throw error; // Re-throw the error instead of just logging it
    } finally {
      return null; // Add this line to satisfy the linter
    }
  }

  // public async verifyDocOtp(email:string){
  //     try{
  //         if(!email){
  //             throw new Error('email is not found')
  //         }
  //         const doc_OtpVerify=await this.otpRepo.verifyOTP(email)

  //     }catch(error){
  //         console.log(error)
  //     }
  // }
}

export default OtpService;
