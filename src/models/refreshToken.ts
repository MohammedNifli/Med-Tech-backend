import mongoose,{ Schema,Document } from "mongoose";

// Define the interface for the refresh token document
export interface IRefreshToken extends Document{
    token:string;
    userId:any;
    createdAt:Date;
    expiresAt:Date

}
 
// Define the refresh token schema
const refreshTokenSchema: Schema<IRefreshToken> = new Schema({
    token: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  });

  const RefreshToken=mongoose.model<IRefreshToken>('RefreshToken',refreshTokenSchema)
   export default RefreshToken;
 