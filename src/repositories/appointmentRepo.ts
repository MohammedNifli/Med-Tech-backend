import AppointmentModel, { IAppointment } from "../models/appointmentModel.js";
import mongoose, { ClientSession, Schema } from "mongoose";
import { IAppointmentRepo } from "../Interfaces/appointment/IAppointmentRepo.js";
import { IPaymentStatus } from "../types/appointment.types.js";

class AppointmentRepo implements IAppointmentRepo {
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
  ): Promise<IAppointment | null> {
    try {
      const updatedAppointment = await AppointmentModel.findByIdAndUpdate(
        { _id: appointmentId },
        { patientId },
        { new: true }
      );

      if (!updatedAppointment)
        throw new Error("No appointment found with the provided ID.");

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
  ): Promise<IAppointment | null> {
    const appointment = await AppointmentModel.findOne({
      doctorId,
      appointmentDate,
      timeSlot,
    });

    if (!appointment) {
      return null;
    }

    return appointment;
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
        return null;
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
        { status: "confirmed", paymentStatus: "paid" },
        { new: true }
      );
  
      if (!changedPaymentStatus) {
        throw new Error("Appointment not found");
      }
  
      
      return changedPaymentStatus;
    } catch (error) {
      console.error("Error updating payment status:", error);
      throw error;
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

  public async cancelAppointment(appointmentId: string): Promise<IAppointment> {
    try {
      const cancelled = await AppointmentModel.findByIdAndUpdate(
        appointmentId,
        { status: "cancelled" },
        { new: true }
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

  public async fetchingOnlineAppointmentRepo(userId: string): Promise<IAppointment[]> {
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

  public async fetchingOfflineAppointments(userId: string): Promise<IAppointment[]> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID.");
      }

      const objectId = new mongoose.Types.ObjectId(userId);
      const appointments = await AppointmentModel.aggregate([
        {
          $match: {
            userId: objectId,
            consultationMode: "offline",
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
      if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        throw new Error("Invalid doctorId format");
      }

      const appointmentLists = await AppointmentModel.aggregate([
        {
          $match: {
            doctorId: new mongoose.Types.ObjectId(doctorId),
            status: { $in: ["confirmed", "pending", "completed"] },
          },
        },

        {
          $sort: { appointmentDate: -1 },
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

        {
          $lookup: {
            from: "prescriptions",
            localField: "_id",
            foreignField: "appointmentId",
            as: "prescriptionData",
          },
        },
        {
          $unwind: {
            path: "$prescriptionData",
            preserveNullAndEmptyArrays: true,
          },
        },
      ]);

      return appointmentLists;
    } catch (error: any) {
      console.error("Error in appointmentListRepo:", error.message);
      throw new Error("An error occurred while fetching appointment lists.");
    }
  }

  public async fetchTotalAppointmentsCount(): Promise<number> {
    try {
      const totalAppointmentCount = await AppointmentModel.find({
        status: "completed",
      }).countDocuments();
      
      return totalAppointmentCount;
    } catch (error: any) {
    
      throw Error("error occured in the appointmentRepository", error);
    }
  }

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

      const formattedData = data.map((item) => ({
        specialization: item._id,
        totalAppointments: item.totalAppointments,
        percentage: (
          (item.totalAppointments / totalAppointments) *
          100
        ).toFixed(2),
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
      const [date] = todayDate.split("T");
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
          $project: {
            _id: 1,
            doctorName: "$doctorDetails.personalInfo.name",
            specialization: "$doctorDetails.professionalInfo.specialization",
            Image: "$doctorDetails.personalInfo.profilePicture",
          },
        },
        {
          $limit: 4,
        },
      ]);
      console.log("available doctors", availableDoctors);

      return availableDoctors;
    } catch (error: any) {
      console.error("Error in fetchAvailableDoctors:", error);
      throw new Error(`Error fetching available doctors: ${error.message}`);
    }
  }

  public async getSpecialisationPercentageRepo(): Promise<any> {
    try {
      const specialisationPercentage = await AppointmentModel.aggregate([
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
            count: { $sum: 1 },
          },
        },

        {
          $group: {
            _id: null,
            total: { $sum: "$count" },
            data: { $push: { specialization: "$_id", count: "$count" } },
          },
        },

        {
          $unwind: "$data",
        },
        {
          $project: {
            _id: 0,
            specialization: "$data.specialization",
            count: "$data.count",
            percentage: {
              $multiply: [{ $divide: ["$data.count", "$total"] }, 100],
            },
          },
        },

        {
          $sort: {
            percentage: -1,
          },
        },
      ]);

      console.log("Specialisation percentages:", specialisationPercentage);
      return specialisationPercentage;
    } catch (error: any) {
      throw new Error(
        `Error occurred in the getSpecialisationPercentageRepo: ${error.message}`
      );
    }
  }

  public async getAppointmentForDashboard(): Promise<any> {
    try {
      const data = await AppointmentModel.aggregate([
        {
          $match: {
            status: "confirmed",
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: "$userDetails",
        },
        {
          $limit: 5,
        },
        {
          $project: {
            _id: 0, // Exclude the `_id` field
            userName: "$userDetails.name",
            image: "$userDetails.photo",
            appointmentDate: {
              $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" },
            },
            timeSlot: 1,
          },
        },
      ]);

      console.log("appointments", data);
      return data;

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
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: "$userDetails",
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $project: {
            "doctorDetails.personalInfo.name": 1,
            "doctorDetails.professionalInfo.specialization": 1,
            "userDetails.name": 1,
            appointmentDate: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$appointmentDate",
              },
            },
            timeSlot: 1,
            consultationMode: 1,
            status: 1,
            createdAt: 1,
          },
        },
      ]);

      console.log("allAppointments", allAppointments);

      return allAppointments;
    } catch (error) {
      console.error(error);
      throw new Error("Error fetching appointments.");
    }
  }

  public async countAppointmentsForToday(
    doctorId: string
  ): Promise<number | any> {
    try {
      const today = new Date().toISOString().split("T")[0];

      const appointments = await AppointmentModel.countDocuments({
        doctorId: doctorId,
        appointmentDate: {
          $gte: new Date(today),
          $lt: new Date(new Date(today).setDate(new Date(today).getDate() + 1)),
        },
      });
      console.log("woooow", appointments);

      return appointments;
    } catch (error) {
      console.error(error);
      throw new Error("Error occurred while counting appointments for today");
    }
  }

  public async getTotalAppointmentsCount(doctorId: string): Promise<number> {
    try {
      const result = await AppointmentModel.aggregate([
        {
          $match: {
            doctorId: new mongoose.Types.ObjectId(doctorId),
            status: { $in: ["confirmed", "completed"] },
          },
        },
        {
          $count: "totalAppointments",
        },
      ]);

      return result.length > 0 ? result[0].totalAppointments : 0;
    } catch (error: any) {
      console.error("Error in getTotalAppointmentsCount:", error.message);
      throw new Error("Error occurred in fetching total appointments count");
    }
  }

  public async getTotalOnlineAppointmentsForDoctor(
    doctorId: string
  ): Promise<number> {
    try {
      const result = await AppointmentModel.aggregate([
        {
          $match: {
            doctorId: new mongoose.Types.ObjectId(doctorId),
            status: "completed",
            consultationMode: "online",
          },
        },
        {
          $count: "totalOnlineAppointments",
        },
      ]);
      console.log("result", result);

      return result.length > 0 ? result[0].totalOnlineAppointments : 0;
    } catch (error: any) {
      console.error(
        "Error in getTotalOnlineAppointmentsForDoctor:",
        error.message
      );
      throw new Error(
        "Error occurred in fetching total online appointments count"
      );
    }
  }

  public async getTotalOfflineAppointmentsForDoctor(
    doctorId: string
  ): Promise<number> {
    try {
      const result = await AppointmentModel.aggregate([
        {
          $match: {
            doctorId: new mongoose.Types.ObjectId(doctorId),
            status: "completed",
            consultationMode: "offline",
          },
        },
        {
          $count: "totalOfflineAppointments",
        },
      ]);

      return result.length > 0 ? result[0].totalOfflineAppointments : 0;
    } catch (error: any) {
      console.error(
        "Error in getTotalOfflineAppointmentsForDoctor:",
        error.message
      );
      throw new Error(
        "Error occurred in fetching total offline appointments count"
      );
    }
  }

  public async getLatestAppointmentRepo(doctorId: string): Promise<any> {
    try {
      const appointments = await AppointmentModel.aggregate([
        {
          $match: {
            doctorId: new mongoose.Types.ObjectId(doctorId),
            status: "confirmed",
          },
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
          $sort: {
            createdAt: -1,
          },
        },
        {
          $limit: 5,
        },
      ]);
      console.log("latest appointments", appointments);
      return appointments;
    } catch (error: any) {
      throw Error(
        "error occured in the getLatestAppointmentRepo ",
        error.message
      );
    }
  }

  public async getTotalPatientCountFromAppointments(
    doctorId: string
  ): Promise<any> {
    try {
      const totalPatients = await AppointmentModel.find({ doctorId: doctorId })
        .distinct("patientId")
        .countDocuments();
      
      return totalPatients;
    } catch (error: any) {
      throw new Error("error occured in the ", error.message);
    }
  }

  public async getAppointmentsAndPatients(
    doctorId: string,
    time: string
  ): Promise<any> {
    try {
      let groupByFields = {};
      if (time === "yearly") {
        groupByFields = { year: { $year: "$appointmentDate" } };
      } else if (time === "monthly") {
        groupByFields = {
          year: { $year: "$appointmentDate" },
          month: { $month: "$appointmentDate" },
        };
      } else if (time === "daily") {
        groupByFields = {
          year: { $year: "$appointmentDate" },
          month: { $month: "$appointmentDate" },
          day: { $dayOfMonth: "$appointmentDate" },
        };
      }

      const data = await AppointmentModel.aggregate([
        { $match: { doctorId: new mongoose.Types.ObjectId(doctorId) } },
        {
          $group: {
            _id: groupByFields,
            totalAppointments: { $sum: 1 },
            uniquePatients: { $addToSet: "$patientId" },
          },
        },
        {
          $project: {
            _id: 0,
            time: "$_id",
            totalAppointments: 1,
            totalPatients: { $size: "$uniquePatients" },
          },
        },
        { $sort: { "time.year": -1, "time.month": -1, "time.day": -1 } },
      ]);
    
      return data;
    } catch (error: any) {
      throw new Error(`Error in AppointmentRepository: ${error.message}`);
    }
  }

  public async patientsCount(doctorId: string): Promise<number |any> {
    try {
      const patientCounts = await AppointmentModel.aggregate([
        {
          $match: {
            doctorId: new mongoose.Types.ObjectId(doctorId),
          },
        },
        {
          $group: {
            _id: null,
            uniquePatients: { $addToSet: "$patientId" },
          },
        },
        {
          $lookup: {
            from: "patients",
            localField: "uniquePatients",
            foreignField: "_id",
            as: "patientDetails",
          },
        },
        {
          $unwind: "$patientDetails",
        },
        {
          $group: {
            _id: "$patientDetails.gender", 
            count: { $sum: 1 },
          },
        },
      ]);

      return patientCounts;
    } catch (error: any) {
      throw new Error(`Error in appointmentRepo: ${error.message}`);
    }
  }

  public async markAsCompleted(appointmentId: string): Promise<IAppointment> {
    try {
      const updatedStatus = await AppointmentModel.findByIdAndUpdate(
        appointmentId,
        { status: "completed" },
        { new: true }
      );
      
    if (!updatedStatus) {
      throw new Error("Appointment not found");
    }

      return updatedStatus;
    } catch (error: any) {
      console.error("Error in markAsCompleted:", error.message);
      throw new Error(error.message || "Repository error occurred");
    }
  }
}
export default AppointmentRepo;
