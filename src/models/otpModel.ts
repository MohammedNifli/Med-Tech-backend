    import { time } from 'console';
    import mongoose, {Document,model,mongo,Schema} from 'mongoose';

   export interface IOtp extends Document{
        email:string,
        otpHash:string,
        expirationTime:Date,
        createdAt:Date
    }

    const otpSchema:Schema=new Schema({
        email:{type:String,required:true},
        otpHash:{type:String,required:true},
        expirationTime: {
            type: Date,
            required: true,
            default: () => new Date(Date.now() + 15 * 1000), 
          },
        createdAt:{
            type:Date,
            default:Date.now,
        }


    })

    const otpModel=model<IOtp>('Otp',otpSchema)

    export default otpModel