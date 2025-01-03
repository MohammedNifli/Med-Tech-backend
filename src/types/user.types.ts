import { Types } from "mongoose";

export interface IUser {
    _id: Types.ObjectId;
    name: string;
    email: string;
    password: string;
    phone: string;
    gender: string;
    role: string;
    photo: string;
    isBlocked: boolean;
    isPremium: boolean;
    isVerified: boolean;
  }
  

  export interface PremiumStatus{
    isPremium:boolean;
  }
  
  export interface PremiumStatusResponse {
    message: string;
    premiumStatus: boolean;
  }
  

