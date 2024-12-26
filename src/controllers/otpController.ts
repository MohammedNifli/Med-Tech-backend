import { Response, Request } from "express";
import { IOtpService } from "../Interfaces/otp/IOtpService.js";
import { HttpStatusCode } from "../enums/httpStatusCodes.js";
import { json } from "stream/consumers";
import { Roles } from "../config/rolesConfig.js";

class OtpController {
    private otpService: IOtpService;

    constructor(otpService: IOtpService) {
        this.otpService = otpService;
    }


    public async sendOTp(req:Request,res:Response){
        try{
           
            const {email}=req.body;
            console.log("email is not getting in otp controller")
           
            const OTP=await this.otpService.sendOTP(email);
            return res.status(HttpStatusCode.CREATED).json({message:"otp created succesfully completed"})

        }catch(error){
            console.log(error)
        }

    }

    public async verifyOTP(req: Request, res: Response): Promise<void> {
        const { otp, email } = req.body;
        console.log("email is not foound in verify otp controller   ",email)
    
        // Ensure both email and OTP are provided
        if (!email || !otp) {
            res.status(HttpStatusCode.BAD_REQUEST).json({ message: "Email and OTP are required." });
            return;
        }
    
        try {
            const { success, message } = await this.otpService.verifyOTP(email, otp);
    
            if (success) {
                res.status(HttpStatusCode.OK).json({ message });
            } else {
                res.status(HttpStatusCode.BAD_REQUEST).json({ message }); // Send the appropriate error message
            }
        } catch (error) {
            console.error(error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
        }
    }
    
    

    public async resendOTP(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;
            await this.otpService.sendOTP(email);  // `otp` isn't needed, just send a new one
            res.status(200).json({ message: "OTP resent successfully." });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error resending OTP." });
        }
    }

    public async docSendOTP(req:Request,res:Response){
        try{
            const {email}=req.body;
            if(!email){
                return 
            }
            const docOTP=await this.otpService.docOTPService(email)
            res.status(HttpStatusCode.CREATED).json({messge:docOTP})

            
        }catch(error){
            console.log(error)
        }

    }

    public async verifyDocOTP(req:Request,res:Response){
        try{
            const {email,otp}=req.body;
            if(!email){
                throw new Error('email is not found')
            }

            const otpVerify=await this.otpService.verifyOTP(email,otp)
            return res.status(HttpStatusCode.OK).json({message:'otpverified successfull',otpVerify})



        }catch(error){
            console.log(error)
        } 
        

    }

    
}

export default OtpController;
