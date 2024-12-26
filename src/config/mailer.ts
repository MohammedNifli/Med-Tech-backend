import nodemailer from 'nodemailer';

const transporter= nodemailer.createTransport({
    service:process.env.EMAIL_SERVICE,
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
    }
})


export const sendOTPemail= async(to:string,otp:string):Promise<void>=>{
    const mailOptions={
        from:process.env.EMAIL_USER,
        to:to,
        subject:"Your OTP Code",
        text:`your OTP code is ${otp} its only valid for 30 second`
    }
    try{
        await transporter.sendMail(mailOptions);
        console.log('otp sent to the email successfully')
    }catch(error){
        console.log(error)
    }
}

export default sendOTPemail;