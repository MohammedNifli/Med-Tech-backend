

import { Document, Schema, model } from "mongoose";





interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

interface PersonalInfo {
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  profilePicture?: string;
  dateOfBirth?: Date;
  email:string;
  password:string
  phone: string;
 
  address: Address;
}


interface Qualification {
  degree: string;
  institution: string;
  year: number;
}

interface Certificate {
  title: string;
  file: string; 
}
interface LicenseFile {
  title: string;
  file: string; 
}

interface ProfessionalInfo {
  specialization: string;
  qualifications: Qualification[];
  experience?: number;
  licenseNumber: string;
  licenseFile:LicenseFile[];
  certificates:Certificate[];
  languages: string[];
}


interface Clinic {
  name: string;
  address: string;
  contactNumber: string;
    
}

interface PracticeInfo {
  clinics: Clinic[];
  consultationModes: {
    online: boolean;
    offline: boolean;
    
  };
}


interface FinancialInfo {
  consultationFees: {
    online?: number;
    offline?: number;
  };
}



interface AccountStatus {
  isActive: boolean;
  verificationStatus: 'Pending' | 'Verified' | 'Rejected';
}


interface Authentication {
  password: string;
}

export interface DoctorInput extends Document {
  password: string;
  personalInfo: PersonalInfo;
  professionalInfo: ProfessionalInfo;
  practiceInfo: PracticeInfo;
  financialInfo: FinancialInfo;
  
  
  accountStatus: AccountStatus;
  authentication: Authentication;
  isBlocked:boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Schema Definition
const doctorSchema: Schema = new Schema(
  {
    personalInfo: {
      name: { type: String, required: true },
      gender: { type: String,  enum: ['Male', 'Female', 'Other'] },
      profilePicture: { type: String },
      dateOfBirth: { type: Date },
      email: { type: String, required: true, unique: true },
      password:{type:String,required:true},
      phone: { type: String, required: true },
    
      address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
        postalCode: { type: String },
      },
    },
    professionalInfo: {
      specialization: { type: String },
      qualifications: [
        {
          degree: { type: String },
          institution: { type: String },
          year: { type: Number },
        },
      ],
      experience: { type:Number,default:0},
      licenseNumber: { type: String, unique: false },
      licenseFile:[
        {
          title:{type:String},
          file:{type:String}

      }

      ] , 
      certificates: [
        {
          title: { type: String },
          file: { type: String }, 
        },
      ],
      languages: [{ type: String }],
    },
    
    practiceInfo: {
      clinics: [
        {
          name: { type: String },
          address: { type: String },
          contactNumber: { type: String },
        },
      ],
      consultationModes: {
        online: { type: Boolean, default: false },
        offline: { type: Boolean, default: false },
       
      },
    },
    financialInfo: {
      consultationFees: {
        online: { type: Number },
        offline: { type: Number },
      },
    },
    
    
    accountStatus: {
      isActive: { type: Boolean, default: true }, 
      verificationStatus: {
        type: String,
        enum: ['Pending', 'Verified', 'Rejected','Not Applied'],
        default: 'Not Applied',
      },
    },
    
    isBlocked:{type:Boolean,default:false},
  },
  
  { timestamps: true }
);


const DoctorModel = model<DoctorInput>('Doctor', doctorSchema);

export default DoctorModel;
