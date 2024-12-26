import AppointmentModel, {
  IAppointment,
  IAppointmentData,
} from "../models/appointmentModel.js";
import mongoose, { ClientSession, Schema } from "mongoose";
import { IAppointmentRepo } from "../Interfaces/appointment/IAppointmentRepo.js";
import { all } from "axios";
import DoctorController from "../controllers/doctorController.js";
import { captureRejectionSymbol } from "node:events";

class AppointmentRepo implements IAppointmentRepo {
  // Method to create a new appointment
  public async createAppointment(
    appointmentData: IAppointment
  ): Promise<IAppointment> {
    try {
      const [newAppointment] = await AppointmentModel.create([appointmentData]);
      return newAppointment;
    } catch (error: any) {
      throw error;
    }
  }

  public async updatePatientId(
    appointmentId: string,
    patientId: string
  ): Promise<any> {
    try {
      const updatedAppointment = await AppointmentModel.findByIdAndUpdate(
        { _id: appointmentId },
        { patientId },
        { new: true } // Return the updated document
      );
      return updatedAppointment;
    } catch (error: any) {
      throw new Error(
        "Error updating appointment with patientId: " + error.message
      );
    }
  }

  public async findAppointment(
    doctorId: string,
    appointmentDate: Date,
    timeSlot: string
  ): Promise<any | null> {
    return await AppointmentModel.findOne({
      doctorId,
      appointmentDate,
      timeSlot,
    });
  }

  public async appointmentRetrievalWithPatient(
    appointmentId: string
  ): Promise<any> {
    try {
      const appointment = await AppointmentModel.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(appointmentId) },
        },
        {
          $lookup: {
            from: "patients",
            localField: "patientId",
            foreignField: "_id",
            as: "patientDetails",
          },
        },
        {
          $unwind: {
            path: "$patientDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
      ]);
      if (appointment.length === 0) {
        return null; // No appointment found
      }

      return appointment[0];
    } catch (error) {
      console.error("Error fetching appointment from DB:", error);
      throw new Error("Error fetching appointment from database");
    }
  }

  public async paymentStatusChange(appointmentId: string): Promise<any> {
    try {
      const changedPaymentStatus = await AppointmentModel.findByIdAndUpdate(
        appointmentId,
        { status: "confirmed", paymentStatus: "paid" }, // fields to update
        { new: true } // option to return the updated document
      );

      console.log("Appointment status updated:", changedPaymentStatus);
      return changedPaymentStatus;
    } catch (error) {
      console.error("Error updating payment status:", error);
      throw error; // rethrow the error if you want the caller to handle it
    }
  }

  public async appointmentFetching(userId: string): Promise<any> {
    try {
      const appointments = await AppointmentModel.aggregate([
        {
          $match: { userId: new mongoose.Types.ObjectId(userId) },
        },
        {
          $lookup: {
            from: "doctors",
            localField: "doctorId",
            foreignField: "_id",
            as: "doctorDetails",
          },
        },
        {
          $unwind: {
            path: "$doctorDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
      ]);

      return appointments;
    } catch (error) {
      console.error("Error fetching appointments:", error);
      throw new Error("Could not fetch appointments");
    }
  }

  public async cancelAppointmentRepo(appointmentId: string): Promise<any> {
    try {
      // Find the appointment by ID and update the status
      const cancelled = await AppointmentModel.findByIdAndUpdate(
        appointmentId,
        { status: "cancelled" }, // Updating the status to "Cancelled"
        { new: true } // This returns the updated document
      );

      if (!cancelled) {
        throw new Error("Appointment cancellation failed");
      }

      return cancelled;
    } catch (error) {
      console.log(error);
      throw new Error("Error in the cancel appointment repository");
    }
  }

  public async fetchingOnlineAppointmentRepo(userId: string): Promise<any> {
    try {
      const fetchedOnlineAppointments = await AppointmentModel.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId), // Corrected here
            consultationMode: "online",
          },
        },
        {
          $lookup: {
            from: "doctors",
            localField: "doctorId",
            foreignField: "_id",
            as: "doctorDetails",
          },
        },
        {
          $unwind: {
            path: "$doctorDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
      ]);

      return fetchedOnlineAppointments;
    } catch (error) {
      console.error("Error fetching online appointments in repository:", error);
      throw new Error("Error fetching online appointments in the repository");
    }
  }

  public async fetchingOfflineAppointments(userId: string): Promise<any> {
    try {
      // Validate if the userId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID.");
      }

      const objectId = new mongoose.Types.ObjectId(userId);
      const appointments = await AppointmentModel.aggregate([
        {
          $match: {
            userId: objectId,
            consultationMode: "offline", // Filter appointments by offline mode
          },
        },
        {
          $lookup: {
            from: "doctors",
            localField: "doctorId",
            foreignField: "_id",
            as: "doctorDetails",
          },
        },
        {
          $unwind: {
            path: "$doctorDetails",
            preserveNullAndEmptyArrays: true, // To allow missing doctor details
          },
        },
      ]);
      console.log("Appointments from repository:", appointments);
      return appointments;
    } catch (error) {
      console.error("Error in repository layer:", error);
      throw new Error(
        "Error occurred while fetching offline appointments from the database."
      );
    }
  }

  public async appointmentListRepo(doctorId: string): Promise<any> {
    try {
        // Validate doctorId
        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            throw new Error("Invalid doctorId format");
        }

        // Aggregation query
        const appointmentLists = await AppointmentModel.aggregate([
            // Filter appointments for the specific doctor and valid statuses
            {
                $match: {
                    doctorId: new mongoose.Types.ObjectId(doctorId),
                    status: { $in: ["confirmed", "pending", "completed"] },
                },
            },
            // Sort appointments by date in descending order
            {
                $sort: { appointmentDate: -1 },
            },
            // Lookup patient details
            {
                $lookup: {
                    from: "patients", // Patient collection name
                    localField: "patientId", // Field in appointments
                    foreignField: "_id", // Field in patients
                    as: "patientDetails", // Alias for joined data
                },
            },
            {
                $unwind: {
                    path: "$patientDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            // Lookup prescription details
            {
                $lookup: {
                    from: "prescriptions", // Prescription collection name
                    localField: "_id", // Appointment ID
                    foreignField: "appointmentId", // Appointment ID in prescriptions
                    as: "prescriptionData", // Alias for joined data
                },
            },
            {
                $unwind: {
                    path: "$prescriptionData",
                    preserveNullAndEmptyArrays: true,
                },
            },
        ]);

        // Return the aggregated list
        return appointmentLists;
    } catch (error:any) {
        console.error("Error in appointmentListRepo:", error.message);
        throw new Error("An error occurred while fetching appointment lists.");
    }
}


  //fethcing total count of  completed appointments

  public async fetchTotalAppointmentsCount(): Promise<any> {
    try {
      const totalAppointmentCount = await AppointmentModel.find({
        status: "completed",
      }).countDocuments();
      console.log("total appointments", totalAppointmentCount);
      return totalAppointmentCount;
    } catch (error: any) {
      console.log(error);
      throw Error("error occured in the appointmentRepository", error);
    }
  }

  // public async fetchAppointmentDataForFraph():Promise<any>{
  //   try{
  //     const appointments = await AppointmentModel.find({
  //       status: { $in: ['confirmed', 'completed'] },
  //     });

  //     return appointments;

  //   }catch(error:any){
  //     throw new Error(error)
  //   }
  // }

  public async fetchYearlyAppointmentData(): Promise<any> {
    try {
      const data = await AppointmentModel.aggregate([
        {
          $match: { status: { $in: ["confirmed", "completed"] } },
        },
        {
          $project: {
            year: { $year: "$appointmentDate" },
            consultationMode: 1,
          },
        },
        {
          $group: {
            _id: "$year",
            onlineCount: {
              $sum: { $cond: [{ $eq: ["$consultationMode", "online"] }, 1, 0] },
            },
            offlineCount: {
              $sum: {
                $cond: [{ $eq: ["$consultationMode", "offline"] }, 1, 0],
              },
            },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      return data;
    } catch (error) {
      console.error("Error fetching yearly appointment data:", error);
      throw new Error("Error fetching yearly appointment data");
    }
  }

  public async fetchMonthlyAppointmentData(): Promise<any> {
    try {
      const data = await AppointmentModel.aggregate([
        {
          $match: { status: { $in: ["confirmed", "completed"] } },
        },
        {
          $project: {
            month: { $month: "$appointmentDate" },
            year: { $year: "$appointmentDate" },
            consultationMode: 1,
          },
        },
        {
          $group: {
            _id: { year: "$year", month: "$month" },
            onlineCount: {
              $sum: { $cond: [{ $eq: ["$consultationMode", "online"] }, 1, 0] },
            },
            offlineCount: {
              $sum: {
                $cond: [{ $eq: ["$consultationMode", "offline"] }, 1, 0],
              },
            },
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 },
        },
      ]);

      // Map month numbers to names
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const formattedData = data.map((item) => ({
        month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
        onlineCount: item.onlineCount,
        offlineCount: item.offlineCount,
      }));

      return formattedData;
    } catch (error) {
      console.error("Error fetching monthly appointment data:", error);
      throw new Error("Error fetching monthly appointment data");
    }
  }

  public async fetchDailyAppointmentData(): Promise<any> {
    try {
      const data = await AppointmentModel.aggregate([
        {
          $match: { status: { $in: ["confirmed", "completed"] } },
        },
        {
          $project: {
            date: {
              $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" },
            },
            consultationMode: 1,
          },
        },
        {
          $group: {
            _id: "$date",
            onlineCount: {
              $sum: { $cond: [{ $eq: ["$consultationMode", "online"] }, 1, 0] },
            },
            offlineCount: {
              $sum: {
                $cond: [{ $eq: ["$consultationMode", "offline"] }, 1, 0],
              },
            },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      return data;
    } catch (error) {
      console.error("Error fetching daily appointment data:", error);
      throw new Error("Error fetching daily appointment data");
    }
  }

  public async fetchingspecialisationStats(): Promise<any> {
    try {
      const data = await AppointmentModel.aggregate([
        {
          $match: {
            status: { $in: ["completed", "confirmed"] },
          },
        },
        {
          $lookup: {
            from: "doctors",
            localField: "doctorId",
            foreignField: "_id",
            as: "doctorDetails",
          },
        },
        {
          $unwind: "$doctorDetails",
        },
        {
          $group: {
            _id: "$doctorDetails.professionalInfo.specialization",
            totalAppointments: { $sum: 1 },
          },
        },
        {
          $sort: { totalAppointments: -1 },
        },
      ]);
      const totalAppointments = data.reduce(
        (sum, item) => sum + item.totalAppointments,
        0
      );

      // Add percentage to each specialization
      const formattedData = data.map((item) => ({
        specialization: item._id,
        totalAppointments: item.totalAppointments,
        percentage: (
          (item.totalAppointments / totalAppointments) *
          100
        ).toFixed(2), // Convert to percentage
      }));

      return formattedData;
    } catch (error: any) {
      console.log(error);
      throw Error(error);
    }
  }

  public async fetchAvailableDoctors(): Promise<any> {
    try {
      const todayDate = new Date().toISOString();
      const [date] = todayDate.split("T"); // Get only the date part
      console.log("Today's date:", date);

      const availableDoctors = await AppointmentModel.aggregate([
        {
          $addFields: {
            dateOnly: {
              $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" },
            },
          },
        },
        {
          $match: {
            dateOnly: date,
          },
        },
        {
          $lookup: {
            from: "doctors",
            localField: "doctorId",
            foreignField: "_id",
            as: "doctorDetails",
          },
        },
        {
          $unwind: "$doctorDetails",
        },
        {
          $project:{
            _id:1,
            doctorName:'$doctorDetails.personalInfo.name',
            specialization:'$doctorDetails.professionalInfo.specialization',
            Image:'$doctorDetails.personalInfo.profilePicture',

          }
        },
        {
          $limit:4
        }
      ]);
      console.log("available doctors", availableDoctors);

      return availableDoctors; // Return the results
    } catch (error: any) {
      console.error("Error in fetchAvailableDoctors:", error);
      throw new Error(`Error fetching available doctors: ${error.message}`);
    }
  }


  public async getSpecialisationPercentageRepo(): Promise<any> {
    try {
      const specialisationPercentage = await AppointmentModel.aggregate([
        // Match appointments with specific statuses
        {
          $match: {
            status: { $in: ['completed', 'confirmed'] },
          },
        },
        // Lookup doctor details
        {
          $lookup: {
            from: 'doctors',
            localField: 'doctorId',
            foreignField: '_id',
            as: 'doctorDetails',
          },
        },
        // Unwind doctor details
        {
          $unwind: '$doctorDetails',
        },
        // Group by specialization and count appointments
        {
          $group: {
            _id: '$doctorDetails.professionalInfo.specialization', // Group by specialization
            count: { $sum: 1 }, // Count appointments
          },
        },
        // Calculate total appointments for all specializations
        {
          $group: {
            _id: null, // Group to calculate the total count
            total: { $sum: '$count' }, // Sum up all specialization counts
            data: { $push: { specialization: '$_id', count: '$count' } }, // Push details for later processing
          },
        },
        // Calculate percentage for each specialization
        {
          $unwind: '$data',
        },
        {
          $project: {
            _id: 0, // Remove _id
            specialization: '$data.specialization',
            count: '$data.count',
            percentage: {
              $multiply: [{ $divide: ['$data.count', '$total'] }, 100], // Calculate percentage
            },
          },
        },
        // Sort by percentage in descending order
        {
          $sort: {
            percentage: -1,
          },
        },
      ]);
  
      console.log('Specialisation percentages:', specialisationPercentage);
      return specialisationPercentage;
    } catch (error: any) {
      throw new Error(`Error occurred in the getSpecialisationPercentageRepo: ${error.message}`);
    }
  }



  public async getAppointmentForDashboard(): Promise<any> {
    try {
      const data = await AppointmentModel.aggregate([
        {
          $match: {
            status: 'confirmed', // Filter confirmed appointments
          },
        },
        {
          $sort: {
            createdAt: -1, // Sort by `createdAt` in descending order (newest first)
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userDetails',
          },
        },
        {
          $unwind: '$userDetails',
        },
        {
          $limit: 5, // Take only the top 5 documents
        },
        {
          $project: {
            _id: 0, // Exclude the `_id` field
            userName: '$userDetails.name', // Include user name from `userDetails` 
            image:'$userDetails.photo',
            appointmentDate: {
              $dateToString: { format: '%Y-%m-%d', date: '$appointmentDate' }, 
            },
            timeSlot:1
             
          },
        },
      ]);
      

      console.log('appointments',data)
      return data
  
      return data;
    } catch (error: any) {
      throw new Error(`Error in getAppointmentForDashboard: ${error.message}`);
    }
  }
  

  public async fetchAllAppointmentRepo(): Promise<any> {
    try {
      const allAppointments = await AppointmentModel.aggregate([
        {
          $lookup: {
            from: 'doctors',
            localField: 'doctorId', // Ensure doctorId is the correct field in your AppointmentModel
            foreignField: '_id',
            as: 'doctorDetails', // The result will be stored in doctorDetails
          }
        },
        {
          $unwind: "$doctorDetails" // Unwind to flatten the array of doctorDetails
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId', // Ensure userId is the correct field in your AppointmentModel
            foreignField: '_id',
            as: 'userDetails', // The result will be stored in userDetails
          }
        },
        {
          $unwind: "$userDetails" // Unwind to flatten the array of userDetails
        },
        {
          $sort: {
            createdAt: -1 // Sort by creation date in descending order
          }
        },
        {
          $project: {
            'doctorDetails.personalInfo.name': 1, // Project doctor's name
            'doctorDetails.professionalInfo.specialization': 1, // Project doctor's specialization
            'userDetails.name': 1, // Project user's name
            'appointmentDate': {
              $dateToString: {
                format: "%Y-%m-%d", // Format the appointment date as yyyy-mm-dd
                date: "$appointmentDate" // The appointment date field to format
              }
            },
            'timeSlot': 1, // Project the time slot field if it exists in your AppointmentModel
            'consultationMode': 1, // Project the consultation mode (offline/online)
            'status': 1, // Project the appointment status
            createdAt: 1 // Keep the createdAt field to preserve the sorting
          }
        }
      ]);
      
       // Return the fetched and formatted appointments
      
      

      console.log('allAppointments',allAppointments)
  
      return allAppointments;
    } catch (error) {
      console.error(error);
      throw new Error("Error fetching appointments.");
    }
  }


  public async countAppointmentsForToday(doctorId: string): Promise<number | any> {
    try {
      // Get today's date in the format 'YYYY-MM-DD'
      const today = new Date().toISOString().split('T')[0];
  
      // Query MongoDB to find appointments for the doctor today
      const appointments = await AppointmentModel.countDocuments({
        doctorId: doctorId,
        appointmentDate: {
          $gte: new Date(today),  // Start of today
          $lt: new Date(new Date(today).setDate(new Date(today).getDate() + 1))  // End of today (next day's start)
        }
      });
      console.log("woooow",appointments)
  
      return appointments;  // Return the count of today's appointments
    } catch (error) {
      console.error(error);
      throw new Error('Error occurred while counting appointments for today');
    }
  }



  public async getTotalAppointmentsCount(doctorId: string): Promise<number> {
    try {
      const result = await AppointmentModel.aggregate([
        {
          $match: {
            doctorId: new mongoose.Types.ObjectId(doctorId),
            status: { $in: ['confirmed', 'completed'] },
          },
        },
        {
          $count: "totalAppointments", // Counts the matching documents
        },
      ]);
  
      return result.length > 0 ? result[0].totalAppointments : 0;
    } catch (error: any) {
      console.error("Error in getTotalAppointmentsCount:", error.message);
      throw new Error("Error occurred in fetching total appointments count");
    }
  }
  
  public async getTotalOnlineAppointmentsForDoctor(doctorId: string): Promise<number> {
    try {
      const result = await AppointmentModel.aggregate([
        {
          $match: {
            doctorId: new mongoose.Types.ObjectId(doctorId),
            status: 'completed',
            consultationMode: 'online', // Matches only online appointments
          },
        },
        {
          $count: "totalOnlineAppointments", // Counts the matching documents
        },
      ]);
      console.log('result',result)
  
      return result.length > 0 ? result[0].totalOnlineAppointments : 0;
    } catch (error: any) {
      console.error("Error in getTotalOnlineAppointmentsForDoctor:", error.message);
      throw new Error("Error occurred in fetching total online appointments count");
    }
  }
  
  
  public async getTotalOfflineAppointmentsForDoctor(doctorId: string): Promise<number> {
    try {
      const result = await AppointmentModel.aggregate([
        {
          $match: {
            doctorId: new mongoose.Types.ObjectId(doctorId),
            status: 'completed',
            consultationMode: 'offline', // Matches only offline appointments
          },
        },
        {
          $count: "totalOfflineAppointments", // Counts the matching documents
        },
      ]);
  
      return result.length > 0 ? result[0].totalOfflineAppointments : 0;
    } catch (error: any) {
      console.error("Error in getTotalOfflineAppointmentsForDoctor:", error.message);
      throw new Error("Error occurred in fetching total offline appointments count");
    }
  }


  public async getLatestAppointmentRepo(doctorId:string):Promise<any>{
    try{

      const appointments=await AppointmentModel.aggregate([{
       $match:{
        doctorId:new mongoose.Types.ObjectId(doctorId),
        status:'confirmed'

       }
      },

       {
        $lookup:{
          from:'patients',
          localField:'patientId',
          foreignField:'_id',
          as:'patientDetails'
        }
       },
       {
        $sort:{
          createdAt:-1
        }
       },{
        $limit:5
       }
        
      ])
      console.log('latest appointments',appointments)
      return appointments;

    }catch(error:any){
      throw Error('error occured in the getLatestAppointmentRepo ',error.message)
    }
  }

  public async getTotalPatientCountFromAppointments(doctorId:string):Promise<any>{
    try{
      const totalPatients=await AppointmentModel.find({doctorId:doctorId}).distinct('patientId').countDocuments();
      console.log('total pateints',totalPatients)
      return totalPatients

    }catch(error:any){
      throw new Error('error occured in the ',error.message)
    }

  }

  public async getAppointmentsAndPatients(doctorId: string, time: string): Promise<any> {
    try {
      let groupByFields = {};
      if (time === 'yearly') {
        groupByFields = { year: { $year: '$appointmentDate' } };
      } else if (time === 'monthly') {
        groupByFields = {
          year: { $year: '$appointmentDate' },
          month: { $month: '$appointmentDate' },
        };
      } else if (time === 'daily') {
        groupByFields = {
          year: { $year: '$appointmentDate' },
          month: { $month: '$appointmentDate' },
          day: { $dayOfMonth: '$appointmentDate' },
        };
      }

      const data = await AppointmentModel.aggregate([
        { $match: { doctorId:new mongoose.Types.ObjectId(doctorId) } },
        {
          $group: {
            _id: groupByFields,
            totalAppointments: { $sum: 1 },
            uniquePatients: { $addToSet: '$patientId' },
          },
        },
        {
          $project: {
            _id: 0,
            time: '$_id',
            totalAppointments: 1,
            totalPatients: { $size: '$uniquePatients' },
          },
        },
        { $sort: { 'time.year': -1, 'time.month': -1, 'time.day': -1 } }, // Sort results
      ]);
      console.log('data',data)
      return data;
    } catch (error: any) {
      throw new Error(`Error in AppointmentRepository: ${error.message}`);
    }
  }

  public async patientsCount(doctorId:string):Promise<any>{
    try {
      const patientCounts = await AppointmentModel.aggregate([
        {
          $match: {
            doctorId: new mongoose.Types.ObjectId(doctorId),
          },
        },
        {
          $group: {
            _id: null, // Group all matched documents
            uniquePatients: { $addToSet: '$patientId' }, // Collect unique patient IDs
          },
        },
        {
          $lookup: {
            from: 'patients', // Name of the patients collection
            localField: 'uniquePatients',
            foreignField: '_id',
            as: 'patientDetails',
          },
        },
        {
          $unwind: '$patientDetails', // Unwind the array of patient details
        },
        {
          $group: {
            _id: '$patientDetails.gender', // Group by gender
            count: { $sum: 1 }, // Count the number of patients for each gender
          },
        },
      ]);
  
      return patientCounts; // Returns an array of gender counts
    } catch (error: any) {
      throw new Error(`Error in appointmentRepo: ${error.message}`);
    }
  
}

public async markAsCompleted(appointmentId: string): Promise<any> {
  try {
    const updatedStatus = await AppointmentModel.findByIdAndUpdate(
      appointmentId,
      { status: "completed" }, // Update the status to 'completed'
      { new: true } // Return the updated document
    );

    return updatedStatus;
  } catch (error: any) {
    console.error("Error in markAsCompleted:", error.message);
    throw new Error(error.message || "Repository error occurred");
  }
}


}
export default AppointmentRepo;
