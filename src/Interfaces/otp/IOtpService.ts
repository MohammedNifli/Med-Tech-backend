export interface IOtpService {
  sendOTP(email: string): Promise<string>;
  verifyOTP(email: string, otp: string):Promise<{ success: boolean, message: string }>;
      resendOTP(email: string): Promise<any>;
  docOTPService(email: string): Promise<string | null>;

}
