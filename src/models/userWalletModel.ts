import mongoose, { Document, Schema } from 'mongoose';

// Define the types for the wallet schema
interface ITransaction {
  amount: number;
  transactionType: 'deposit' | 'withdrawal' | 'payment' | 'refund';
  date: Date;
  referenceId?: mongoose.Types.ObjectId; // Reference to an appointment or transaction
}

interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;  // Reference to the User model
  balance: number;                    // Current balance of the wallet
  transactions: ITransaction[];       // Array of transactions
  createdAt: Date;                    // Date when wallet was created
  updatedAt: Date;                    // Date when wallet was last updated
}

// Create the Wallet schema
const walletSchema = new Schema<IWallet>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Refers to the User collection
      required: true,
    },
    balance: {
      type: Number,
      default: 0, // Initial balance is 0
    },
    transactions: [
      {
        amount: {
          type: Number,
          required: true,
        },
        transactionType: {
          type: String,
          enum: ['deposit', 'withdrawal', 'payment', 'refund'],
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        referenceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Appointment', // You can change this if you need a different reference
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
    timestamps: true, // Automatically handle createdAt and updatedAt
  }
);

// Update `updatedAt` field before saving
walletSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create the Wallet model
const Wallet = mongoose.model<IWallet>('Wallet', walletSchema);

export default Wallet;
