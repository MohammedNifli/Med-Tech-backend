import otpModel from '../models/otpModel.js';
class OtpRepository {
    async sendOTP(email, otpHash) {
        try {
            const otp = new otpModel({ email, otpHash });
            const otp_doc = await otp.save();
            return 'OTP saved successfully';
        }
        catch (error) {
            console.log(error);
            throw new Error('Database Error');
        }
    }
    async verifyOTP(email) {
        try {
            const result = await otpModel.findOne({ email: email });
            if (!result) {
                console.log(`No OTP found for email: ${email}`);
            }
            return result;
        }
        catch (error) {
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
    async docSendOTPRepo(email, otpHash) {
        try {
            const otp = new otpModel({ email, otpHash });
            const doc_otp = await otp.save();
            return 'doctor otp svaed succesfully completed';
        }
        catch (error) {
            throw error;
        }
    }
}
export default OtpRepository;
