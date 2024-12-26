import mongoose,{Schema,Document, Types} from "mongoose";
import { Interface } from "readline";
import { Type } from "typescript";

export interface IUserInput {
    _id: Types.ObjectId;
    name: string;
    email: string;
    password: string;
    phone: string;
    gender:string;
    role:string;
    photo:string;
    isBlocked:boolean;
    isPremium:boolean;
    isVerified:boolean;
}


const userSchema :Schema=new Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    phone:{type:String},
    gender:{type:String},
    role:{type:String},
    photo:{type:String},
    isBlocked:{type:Boolean,default:false},
    isPremium:{type:Boolean,default:false},
    isVerified:{type:Boolean,default:false},
   

})


const User=mongoose.model<IUserInput>('User',userSchema);

export default User;
