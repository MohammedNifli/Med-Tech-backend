import Doctor from "../models/doctorModel.js";
import { DoctorInput } from "../models/doctorModel.js";
import { IDoctorRepo } from "../Interfaces/doctor/IDoctorRepo.js";
import mongoose from "mongoose";
import { isBlock } from "typescript";

class docRepo implements IDoctorRepo {
  public async findDoc(email: string): Promise<DoctorInput | null> {
    try {
      // Use dot notation to query nested fields
      const existingDoc = await Doctor.findOne({ "personalInfo.email": email });
      console.log("existingDoc", existingDoc);
      return existingDoc; // Return the found doctor or null if not found
    } catch (error) {
      console.error("Error finding the doctor by email:", error); // Log the error for debugging
      throw error; // Rethrow the error to be handled by the calling code
    }
  }

  public async createDoc(
    doc: Partial<DoctorInput>
  ): Promise<DoctorInput | undefined> {
    try {
      const Doc = new Doctor(doc);
      console.log("Hey kittyyyy", Doc);
      await Doc.save();
      return Doc;
    } catch (error) {
      console.error("Error saving the document:", error);
      throw error;
    }
  }

  public async findDoctorById(docId: string): Promise<DoctorInput | null> {
    try {
      const doctor = await Doctor.findById(docId);
      return doctor;
    } catch (error) {
      console.log(error);
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
      console.log(error);
      throw error;
    }
  }

  //adding the doctor documents into the db and change the status into pending;
  public async approval(docId: string, data: Partial<DoctorInput>) {
    try {
      // Prepare the update object with verificationStatus set to 'Pending'
      const updatedData = {
        ...data,
        accountStatus: {
          verificationStatus: "Pending",
        },
      };

      // Update the doctor's details
      const applyApproval = await Doctor.findByIdAndUpdate(
        docId,
        { $set: updatedData },
        { new: true } // Returns the updated document
      );

      if (!applyApproval) {
        throw new Error("Doctor not found or update failed");
      }

      return { applyApproval }; // Return the updated doctor document
    } catch (error: any) {
      console.log(error);
      throw error;
    }
  }

  //fetching unique  specilization from doctors collection
  public async fetchingSpecialization() {
    try {
      const uniqueSpecialization = await Doctor.distinct(
        "professionalInfo.specialization"
      );
      console.log("unique", uniqueSpecialization);

      return uniqueSpecialization;
    } catch (error) {
      console.error("Error fetching specializations:", error);
      throw new Error("An error occurred while fetching specializations");
    }
  }

  //filtering

  public async doctorsFiltering(filters: {
    consultationFee?: number;
    rating?: number;
    experience?: number;
    gender?: string;
    consultationMode?: string;
  }): Promise<any[]> {
    try {
      const query: any = {};

      // Consultation mode filter (online, offline, or both)
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

          // Ensure both consultation fees match the filter
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

      // Experience filter logic
      if (filters.experience !== undefined) {
        if (filters.experience === 0) {
          query["professionalInfo.experience"] = { $lt: 5 };
        } else {
          query["professionalInfo.experience"] = { $gte: filters.experience };
        }
      }

      // Rating filter
      if (filters.rating) {
        query.rating = { $gte: filters.rating };
      }

      // Gender filter
      if (filters.gender) {
        query["personalInfo.gender"] = filters.gender;
      }

      console.log("Query:", query);

      // Execute query and return filtered results
      const filteredDoctors = await Doctor.find(query).exec();
      console.log("Filtered Doctors:", filteredDoctors);
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
      console.log(error);
      throw new Error(error);
    }
  }

  public async showDoctorStatus(docId: string): Promise<any> {
    try {
      const doctorProfile = await Doctor.findOne({ _id: docId });
      if (!doctorProfile) {
        console.log("Doctor profile not found");
        return null;
      }
      const doctorVerificationsStatus =
        doctorProfile.accountStatus?.verificationStatus;

      if (!doctorVerificationsStatus) {
        console.log("Verification status not found");
        return null;
      }

      return doctorVerificationsStatus || null; // Return null if not found
    } catch (error) {
      console.log(error);
    }
  }

  public async approvingStatus(docId: string): Promise<any> {
    try {
      const approvedStatus = await Doctor.findOneAndUpdate(
        { _id: docId }, // Make sure to match by _id (or the correct field)
        {
          $set: { "accountStatus.verificationStatus": "verified" }, // Update the verification status to 'verified'
        },
        { new: true } // Return the updated document
      );

      return approvedStatus; // Optionally return the updated document
    } catch (error) {
      console.error(error); // Log the error
      throw new Error("Failed to update the approval status"); // Throw an error for handling elsewhere
    }
  }

  public async rejectingDocProfile(docId: string): Promise<any> {
    try {
      const rejectededStatus = await Doctor.findOneAndUpdate(
        { _id: docId }, // Make sure to match by _id (or the correct field)
        {
          $set: { "accountStatus.verificationStatus": "Rejected" }, // Update the verification status to 'verified'
        },
        { new: true } // Return the updated document
      );

      return rejectededStatus; // Optionally return the updated document
    } catch (error) {
      console.error(error); // Log the error
      throw new Error("Failed to update the approval status"); // Throw an error for handling elsewhere
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
      console.error("Error in doctorBlock repository:", error);
      throw error;
    }
  }

  public async unBlockDoctor(docId: string): Promise<any> {
    try {
        const unBlockDoctor = await Doctor.findByIdAndUpdate(
            { _id: docId },
            { $set: { isBlocked: false } },
            { new: true }  // Return the updated document
        );

        return unBlockDoctor;
    } catch (error) {
        console.error("Error in unBlockDoctor repository:", error);
        throw error;  // Rethrow the error to be handled by the service layer
    }
}

public async adminSearchDoctorData(data: string): Promise<any> {
  try {
      const regex = new RegExp(data, 'i'); // Case-insensitive regex

      // Create filter for nested fields in `personalInfo`
      const filter = {
          $or: [
              { 'personalInfo.name': { $regex: regex } },
              { 'personalInfo.email': { $regex: regex } },
              { 'personalInfo.phone': { $regex: regex } }
          ]
      };

      const doctors = await Doctor.find(filter).exec();
      return doctors;
  } catch (error) {
      console.error(error);
      throw new Error('Error in doctor repository');
  }
}


public async changePasswordRepo(docId: string, newPass: string): Promise<boolean> {
  try {
    const updateResult = await Doctor.updateOne(
      { _id: docId },
      { $set: { 'personalInfo.password': newPass } }
    );
    return updateResult.modifiedCount > 0;
  } catch (error) {
    console.error(error);
    throw new Error("Database error while updating password");
  }
}


public async profilePhotoUpdating(docId: string, picPath: string): Promise<any> {
  try {
    const updatedProfile = await Doctor.findByIdAndUpdate(
      { _id: docId },
      { 'personalInfo.profilePicture': picPath },
      { new: true } // Return the updated document
    );
    return updatedProfile;
  } catch (error:any) {
    console.error(error);
    throw new Error('Error updating profile picture: ' + error.message);
  }
}


public async doctorFiltering(filter: string): Promise<any> {
  try {
      let query: any = {}; // Initialize an empty query object

      // Construct the query based on the filter
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
              // No filter, fetch all doctors
              break;
      }

      // Fetch the filtered doctors from the database
      const filteredDoctors = await Doctor.find(query).exec();
      return filteredDoctors;

  } catch (error) {
      console.log('Error filtering doctors:', error);
      throw error; // Rethrow the error for handling in the service layer
  }
}

public async fetchTotalDoctorsCount(): Promise<number> {
  try {
      // Query for verified doctors
      const totalDoctors = await Doctor.find({ 'accountStatus.verificationStatus': 'verified' }).countDocuments();
      return totalDoctors;
  } catch (error) {
      // Log the error for debugging
      console.error('Error occurred in fetchTotalDoctorsCount repository:', error);
      // Throw a new error with context-specific message
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


public async fetchTotalFemaleDoctorsAvailable():Promise<any>{
  try{

    const data=await Doctor.find({'personalInfo.gender':"Female"}).countDocuments()
    return data

    

  }catch(error:any){
    throw new Error(error)
    console.log(error)
  }
}

public async fetchOtherGender():Promise<any>{
  try{
    const OtherGender=await Doctor.find({'personalInfo.gender':'Other'}).countDocuments()
    console.log("otherGender",OtherGender)
    return OtherGender;

  }catch(error:any){
    throw Error(error.message)
  }
}


public async SearchDoctorData(
  specialization?: string,
  location?: string
): Promise<any> {
  try {
    // Create a dynamic query object
    const matchQuery: any = {
      'accountStatus.verificationStatus': 'verified', // Ensure only verified doctors are fetched
    };

    if (specialization) {
      matchQuery['professionalInfo.specialization'] = {
        $regex: specialization,
        $options: 'i', // Case-insensitive search
      };
    }

    if (location) {
      matchQuery['personalInfo.address.city'] = {
        $regex: location,
        $options: 'i', // Case-insensitive search
      };
    }

    // Construct the aggregation pipeline
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
          preserveNullAndEmptyArrays: true, // Include doctors without feedback
        },
      },
      {
        $group: {
          _id: '$_id', // Group by doctor ID
          doctor: { $first: '$$ROOT' }, // Retain all doctor fields
          averageRating: { $avg: '$feedback.rating' }, // Calculate average rating
        },
      },
      {
        $addFields: {
          'doctor.averageRating': { $ifNull: ['$averageRating', 0] }, // Add averageRating to doctor, default to 0
        },
      },
      {
        $replaceRoot: {
          newRoot: '$doctor', // Flatten the structure
        },
      },
    ];

    // Execute the query
    const doctors = await Doctor.aggregate(pipeline);

    return doctors;
  } catch (error: any) {
    console.error('Error in SearchDoctorData:', error.message || error);
    throw new Error('Error occurred in the SearchDoctorData repository');
  }
}




}
export default docRepo;
