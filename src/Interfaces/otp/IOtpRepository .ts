import {IOtp} from '../../models/otpModel.js'

export interface IOtpRepository {
        sendOTP(email: string, otpHash: string): Promise<string>;
        verifyOTP(email: string): Promise<IOtp | null>;
     
      
        docSendOTPRepo(email:string,otpHash:string):Promise<string>
    
    }
    