import Doctor from "../models/doctorModel.js";
import { DoctorInput } from "../models/doctorModel.js";
import { IDoctorRepo } from "../Interfaces/doctor/IDoctorRepo.js";
import { IDoctor } from "../types/doctor.types.js";


class docRepo implements IDoctorRepo {
  public async findDoc(email: string): Promise<DoctorInput | null> {
    try {
    
      const existingDoc = await Doctor.findOne({ "personalInfo.email": email });
      
      return existingDoc; 
    } catch (error) {
      console.error("Error finding the doctor by email:", error); 
      throw error; 
    }
  }

  public async createDoc(doc: Partial<DoctorInput>): Promise<DoctorInput | undefined> {
    if (!doc) {
      throw new Error("Invalid doctor data provided.");
    }
  
    try {
      const Doc = new Doctor(doc);
      await Doc.save();
      return Doc;
    } catch (error: unknown) {
      console.error("Error saving the document:", error);
      throw new Error("Error occurred while saving the doctor data.");
    }
  }
  

  public async findDoctorById(docId: string): Promise<DoctorInput | null> {
    try {
      const doctor = await Doctor.findById(docId);
      return doctor;
    } catch (error) {
      
      throw error;
    }
  }

  // Update Doctor Profile
  public async updateProfile(docId: string, updateData: Partial<DoctorInput>) {
    try {
      const updatedProfile = await Doctor.findByIdAndUpdate(docId, updateData, {
        new: true,
        runValidators: true,
      });
      return updatedProfile;
    } catch (error) {
  
      throw error;
    }
  }


  public async approval(docId: string, data: Partial<DoctorInput>) {
    try {
    
      const updatedData = {
        ...data,
        accountStatus: {
          verificationStatus: "Pending",
        },
      };

      
      const applyApproval = await Doctor.findByIdAndUpdate(
        docId,
        { $set: updatedData },
        { new: true } 
      );

      if (!applyApproval) {
        throw new Error("Doctor not found or update failed");
      }

      return { applyApproval }; 
    } catch (error: any) {
      
      throw error;
    }
  }

  
  public async getDistinctSpecializations() {
    try {
      const uniqueSpecialization = await Doctor.distinct(
        "professionalInfo.specialization"
      );
      

      return uniqueSpecialization;
    } catch (error) {
      console.error("Error fetching specializations:", error);
      throw new Error("An error occurred while fetching specializations");
    }
  }

  
  public async doctorsFiltering(filters: {
    consultationFee?: number;
    rating?: number;
    experience?: number;
    gender?: string;
    consultationMode?: string;
  }): Promise<any[]> {
    try {
      const query: any = {};

      
      if (filters.consultationMode) {
        if (filters.consultationMode === "online") {
          query["practiceInfo.consultationModes.online"] = true;
          if (filters.consultationFee) {
            query["financialInfo.consultationFees.online"] =
              filters.consultationFee;
          }
        } else if (filters.consultationMode === "offline") {
          query["practiceInfo.consultationModes.offline"] = true;
          if (filters.consultationFee) {
            query["financialInfo.consultationFees.offline"] =
              filters.consultationFee;
          }
        } else if (filters.consultationMode === "both") {
          2;
          query["$and"] = [
            { "practiceInfo.consultationModes.online": true },
            { "practiceInfo.consultationModes.offline": true },
          ];

    
          if (filters.consultationFee) {
            query["$or"] = [
              {
                "financialInfo.consultationFees.online":
                  filters.consultationFee,
              },
              {
                "financialInfo.consultationFees.offline":
                  filters.consultationFee,
              },
            ];
          }
        }
      }

    
      if (filters.experience !== undefined) {
        if (filters.experience === 0) {
          query["professionalInfo.experience"] = { $lt: 5 };
        } else {
          query["professionalInfo.experience"] = { $gte: filters.experience };
        }
      }

    
      if (filters.rating) {
        query.rating = { $gte: filters.rating };
      }

    
      if (filters.gender) {
        query["personalInfo.gender"] = filters.gender;
      }

      

      
      const filteredDoctors = await Doctor.find(query).exec();
      
      return filteredDoctors;
    } catch (error) {
      console.error("Error in doctorsFiltering repository:", error);
      throw error;
    }
  }

  public async fetchingDoctors() {
    try {
      const fetchedDoctors = await Doctor.find();
      return fetchedDoctors;
    } catch (error: any) {
    
      throw new Error(error);
    }
  }

  public async showDoctorStatus(docId: string): Promise<any> {
    try {
      if (docId) {
        const doctorProfile = await Doctor.findOne({ _id: docId });
        
        if (doctorProfile) {
          const doctorVerificationsStatus = doctorProfile.accountStatus?.verificationStatus;
  
          if (doctorVerificationsStatus) {
            return doctorVerificationsStatus;
          }
        }
        return null;
      }
  
      throw new Error("Doctor ID is not provided");
    } catch (error) {
      console.log(error);
      throw new Error("An error occurred while fetching doctor status from repository");
    }
  }
  

  public async approvingStatus(docId: string): Promise<any> {
    try {
      const approvedStatus = await Doctor.findOneAndUpdate(
        { _id: docId }, 
        {
          $set: { "accountStatus.verificationStatus": "verified" }, 
        },
        { new: true } 
      );

      return approvedStatus; 
    } catch (error) {
      
      throw new Error("Failed to update the approval status");
    }
  }

  public async rejectingDocProfile(docId: string): Promise<IDoctor> {
    try {
      const rejectededStatus = await Doctor.findOneAndUpdate(
        { _id: docId }, 
        {
          $set: { "accountStatus.verificationStatus": "Rejected" }, 
        },
        { new: true } 
      );
      
    if (!rejectededStatus) {
      throw new Error("Doctor not found or update failed");
    }

      return rejectededStatus; 
    } catch (error) {
      
      throw new Error("Failed to update the approval status"); 
    }
  }

  public async doctorBlock(docId: string): Promise<any> {
    try {
      const blockDoctor = await Doctor.findByIdAndUpdate(
        { _id: docId },
        { $set: { isBlocked: true } },
        { new: true }
      );

      return blockDoctor;
    } catch (error) {
      
      throw error;
    }
  }

  public async unBlockDoctor(docId: string): Promise<any> {
    try {
        const unBlockDoctor = await Doctor.findByIdAndUpdate(
            { _id: docId },
            { $set: { isBlocked: false } },
            { new: true }  
        );

        return unBlockDoctor;
    } catch (error) {
        
        throw error;  
    }
}

public async adminSearchDoctorData(data: string): Promise<IDoctor[]> {
  try {
      const regex = new RegExp(data, 'i'); 

      
      const filter = {
          $or: [
              { 'personalInfo.name': { $regex: regex } },
              { 'personalInfo.email': { $regex: regex } },
              { 'personalInfo.phone': { $regex: regex } }
          ]
      };

      const doctors = await Doctor.find(filter).exec() as IDoctor[];
      return doctors;
  } catch (error) {
      
      throw new Error('Error in doctor repository');
  }
}


public async changePassword(docId: string, newPass: string): Promise<boolean> {
  try {
    const updateResult = await Doctor.updateOne(
      { _id: docId },
      { $set: { 'personalInfo.password': newPass } }
    );
    return updateResult.modifiedCount > 0;
  } catch (error) {
  
    throw new Error("Database error while updating password");
  }
}


public async updateProfileImage(docId: string, picPath: string): Promise<IDoctor> {
  try {
    const updatedProfile = await Doctor.findByIdAndUpdate(
      { _id: docId },
      { 'personalInfo.profilePicture': picPath },
      { new: true } 
    );

    if (!updatedProfile) {
      throw new Error('No doctor found with the given ID');
    }
    return updatedProfile;
  } catch (error:any) {
    console.error(error);
    throw new Error('Error updating profile picture: ' + error.message);
  }
}


public async doctorFiltering(filter: string): Promise<IDoctor[]> {
  try {
      let query: any = {}; 

    
      switch (filter) {
          case 'pending':
              query['accountStatus.accountVerification'] = 'pending';
              break;
          case 'verified':
              query['accountStatus.accountVerification'] = 'verified';
              break;
          case 'rejected':
              query['accountStatus.accountVerification'] = 'rejected';
              break;
          case 'blocked':
              query['isBlocked'] = true;
              break;
          case 'unblocked':
              query['isBlocked'] = false;
              break;
          case 'all':
          default:
              
              break;
      }

      
      const filteredDoctors = await Doctor.find(query).exec();
      return filteredDoctors;

  } catch (error) {
     
      throw error; 
  }
}

public async fetchTotalDoctorsCount(): Promise<number> {
  try {
      
      const totalDoctors = await Doctor.find({ 'accountStatus.verificationStatus': 'verified' }).countDocuments();
      return totalDoctors;
  } catch (error) {
      
      console.error('Error occurred in fetchTotalDoctorsCount repository:', error);
    
      throw new Error('Failed to fetch total doctors count');
  }
}


public async fetchTotalMaleDoctorsAvailable():Promise<any>{
  try{

    const data=await Doctor.find({'personalInfo.gender':"Male"}).countDocuments()
    return data

    

  }catch(error:any){
    throw new Error(error)
    console.log(error)
  }
}


public async fetchTotalFemaleDoctorsAvailable():Promise<number>{
  try{

    const data=await Doctor.find({'personalInfo.gender':"Female"}).countDocuments() 
    return data

    

  }catch(error:any){
    throw new Error(error)
    console.log(error)
  }
}

public async fetchOtherGender():Promise<number>{
  try{
    const OtherGender=await Doctor.find({'personalInfo.gender':'Other'}).countDocuments()
    
    return OtherGender;

  }catch(error:any){
    throw Error(error.message)
  }
}


public async SearchDoctorData(
  specialization?: string,
  location?: string
): Promise<IDoctor[]> {
  try {
    
    const matchQuery: any = {
      'accountStatus.verificationStatus': 'verified', 
    };

    if (specialization) {
      matchQuery['professionalInfo.specialization'] = {
        $regex: specialization,
        $options: 'i', 
      };
    }

    if (location) {
      matchQuery['personalInfo.address.city'] = {
        $regex: location,
        $options: 'i', 
      };
    }


    const pipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from: 'feedbacks',
          localField: '_id',
          foreignField: 'doctorId',
          as: 'feedback',
        },
      },
      {
        $unwind: {
          path: '$feedback',
          preserveNullAndEmptyArrays: true, 
        },
      },
      {
        $group: {
          _id: '$_id', 
          doctor: { $first: '$$ROOT' }, 
          averageRating: { $avg: '$feedback.rating' }, 
        },
      },
      {
        $addFields: {
          'doctor.averageRating': { $ifNull: ['$averageRating', 0] }, 
        },
      },
      {
        $replaceRoot: {
          newRoot: '$doctor', 
        },
      },
    ];

    
    const doctors = await Doctor.aggregate(pipeline);

    return doctors;
  } catch (error: any) {
    
    throw new Error('Error occurred in the SearchDoctorData repository');
  }
}




}
export default docRepo;
