import mongoose, { Document, Schema } from 'mongoose'
interface ITransaction {
  amount: number;
  transactionType: 'deposit' | 'withdrawal' | 'payment' | 'refund';
  date: Date;
  referenceId?: mongoose.Types.ObjectId; 
}

export interface IWallet extends Document {
  doctorId: mongoose.Types.ObjectId; 
  balance: number;                    
  transactions: ITransaction[];      
  createdAt: Date;                    
  updatedAt: Date;                    
}




const walletSchema = new Schema<IWallet>(
    {
      doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor', 
        required: true,
      },
      balance: {
        type: Number,
        default: 0,
      },
      transactions: [
        {
          amount: {
            type: Number,
            required: true,
          },
          transactionType: {
            type: String,
            enum: ['credited', 'debited', 'payment', 'refund'],
            required: true,
          },
          date: {
            type: Date,
            default: Date.now,
          },
          referenceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment',
            required: false,
          },
        },
      ],
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true, 
    }
  );
  

  walletSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
  });
  
  
  const Wallet = mongoose.model<IWallet>('Doctor-Wallet', walletSchema);
  
  export default Wallet;
  