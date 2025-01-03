import otpModel from '../models/otpModel.js';
import { IOtpRepository } from '../Interfaces/otp/IOtpRepository .js';
import { IOtp } from '../models/otpModel.js';



class OtpRepository implements IOtpRepository {
    
    
    public async sendOTP(email: string, otpHash: string): Promise<string> {
        try {
            const otp = new otpModel({ email, otpHash });
            const otp_doc=await otp.save();
           

            return 'OTP saved successfully';
        } catch (error) {
            console.log(error);
            throw new Error('Database Error');
        }
    }

    public async verifyOTP(email: string): Promise<IOtp | null> {
        try {
            const result = await otpModel.findOne({ email: email });
            
            if (!result) {
                console.log(`No OTP found for email: ${email}`);
            }
    
            return result;
        } catch (error:any) {
            console.error(`Error in otpRepo.verifyOTP: ${error.message}`);
            return null;
        }
    }

    
    
    
    

    // public resendOTP(email: string):Promise<void>{
    //     try{



    //     }catch(error){
    //         console.log(error)
    //     }
        
    // }
    public async docSendOTPRepo(email:string,otpHash:string):Promise<string>{
        try{
            const otp = new otpModel({ email, otpHash });
            const doc_otp=await otp.save();
            return 'doctor otp svaed succesfully completed'

        }catch(error:any){
            throw error;
        }

    }
}

export default OtpRepository;
