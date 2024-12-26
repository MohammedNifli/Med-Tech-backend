import mongoose, { Document, Schema } from 'mongoose';

interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  appointmentId: mongoose.Types.ObjectId;
  
  date: Date;
  amount: number;
  onlineAmount:number;
  offlineAmount:number;
  goPremiumForChat:number;
  status: string; // 'pending', 'completed', or 'failed'

}

const PaymentSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  appointmentId:{
    type:String,
    required:true,
    ref:"Appointment"
  }
  ,
 
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  amount: {
    type: Number,
    required: true,
  },
  onlineAmount:{
    type:Number,
    
    
  },
  offlineAmount:{
    type:String,

  },
  goPremiumForChat:{
    type:String

  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed'],
  },
});

const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;
