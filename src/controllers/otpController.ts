import { Response, Request } from "express";
import { IOtpService } from "../Interfaces/otp/IOtpService.js";
import { HttpStatusCode } from "../enums/httpStatusCodes.js";
import { IOtpController } from "../Interfaces/otp/IOtpController.js";

class OtpController implements IOtpController {
  private otpService: IOtpService;

  constructor(otpService: IOtpService) {
    this.otpService = otpService;
  }

  public async sendOTp(req: Request, res: Response):Promise<Response> {
    try {
      const { email } = req.body;
    

      const OTP = await this.otpService.sendOTP(email);
      return res
        .status(HttpStatusCode.CREATED)
        .json({ message: "otp created succesfully completed" });
    } catch (error) {
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"An error occured in sending otp"})
    }
  }

  public async verifyOTP(req: Request, res: Response): Promise<void> {
    const { otp, email } = req.body;


    if (!email || !otp) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Email and OTP are required." });
      return;
    }

    try {
      const { success, message } = await this.otpService.verifyOTP(email, otp);

      if (success) {
        res.status(HttpStatusCode.OK).json({ message });
      } else {
        res.status(HttpStatusCode.BAD_REQUEST).json({ message });
      }
    } catch (error) {
    
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error." });
    }
  }

  public async resendOTP(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      await this.otpService.sendOTP(email);
      res.status(HttpStatusCode.OK).json({ message: "OTP resent successfully." });
    } catch (error) {
      
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Error resending OTP." });
    }
  }

  public async docSendOTP(req: Request, res: Response):Promise<Response> {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({message:"email is  required"});
      }
      const docOTP = await this.otpService.docOTPService(email);
     return   res.status(HttpStatusCode.CREATED).json({ messge: docOTP });
    } catch (error) {

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"'An error occurred while sending the OTP for doctor registration. Please check the provided contact details or try again later."})
      
    }
  }

  public async verifyDocOTP(req: Request, res: Response) :Promise<Response>{
    try {
      const { email, otp } = req.body;
      if (!email) {
        throw new Error("email is not found");
      }

      const otpVerify = await this.otpService.verifyOTP(email, otp);
      return res
        .status(HttpStatusCode.OK)
        .json({ message: "otpverified successfull", otpVerify });
    } catch (error) {
      return res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  }
}

export default OtpController;
