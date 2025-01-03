import { IPatientRepo } from "../Interfaces/patient/IPatientRepo.js";
import PatientModel from "../models/patientModel.js";
import { IPatient } from "../types/patient.types.js";

class PatientRepo implements IPatientRepo {
  public async createPatient(patientData: any): Promise<IPatient> {
    try {
      const patient = new PatientModel(patientData);
      return await patient.save();
    } catch (error) {
      console.log("Error saving patient:", error);
      throw error;
    }
  }
  public async fetchingPatient(patientId: string): Promise<IPatient | null> {
    try {
      const patient = await PatientModel.findById(patientId);
      return patient;
    } catch (error) {
      throw error;
    }
  }

  public async fetchTotalPatientCount(): Promise<number> {
    try {
      const patientCount = await PatientModel.find().countDocuments();
      return patientCount;
    } catch (error) {
      throw error;
    }
  }

  public async getYearlyPatientDataForDash(): Promise<any> {
    try {
      const result = await PatientModel.aggregate([
        {
          $match: {
            gender: { $in: ["Male", "Female", "Other"] },
            createdAt: { $exists: true },
          },
        },
        {
          $project: {
            year: { $year: "$createdAt" },
            gender: 1,
          },
        },
        {
          $group: {
            _id: { year: "$year", gender: "$gender" },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            year: "$_id.year",
            gender: "$_id.gender",
            count: 1,
          },
        },
        {
          $group: {
            _id: "$year",
            male: {
              $sum: { $cond: [{ $eq: ["$gender", "Male"] }, "$count", 0] },
            },
            female: {
              $sum: { $cond: [{ $eq: ["$gender", "Female"] }, "$count", 0] },
            },
            other: {
              $sum: { $cond: [{ $eq: ["$gender", "Other"] }, "$count", 0] },
            },
          },
        },
        {
          $project: {
            _id: 1,
            year: 1,
            male: 1,
            female: 1,
            other: 1,
          },
        },
      ]);
      return result;
    } catch (error) {
     
      throw error;
    }
  }

  public async getMonthlyPatientDataForDash(): Promise<any> {
    try {
      const result = await PatientModel.aggregate([
        {
          $match: {
            gender: { $in: ["Male", "Female", "Other"] },
            createdAt: { $exists: true },
          },
        },
        {
          $project: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            gender: 1,
          },
        },
        {
          $group: {
            _id: { year: "$year", month: "$month" },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            year: "$_id.year",
            month: "$_id.month",
            gender: 1,
            count: 1,
          },
        },
        {
          $group: {
            _id: { year: "$year", month: "$month" },
            male: {
              $sum: { $cond: [{ $eq: ["$gender", "Male"] }, "$count", 0] },
            },
            female: {
              $sum: { $cond: [{ $eq: ["$gender", "Female"] }, "$count", 0] },
            },
            other: {
              $sum: { $cond: [{ $eq: ["$gender", "Other"] }, "$count", 0] },
            },
          },
        },
        {
          $project: {
            _id: 1,
            year: 1,
            month: 1,
            male: 1,
            female: 1,
            other: 1,
          },
        },
      ]);
      return result;
    } catch (error) {
  
      throw error;
    }
  }

  public async getDailyPatientDataForDash(): Promise<any> {
    try {
      const result = await PatientModel.aggregate([
        {
          $match: {
            gender: { $in: ["Male", "Female", "Other"] },
            createdAt: { $exists: true },
          },
        },
        {
          $project: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
            gender: 1,
          },
        },
        {
          $group: {
            _id: { year: "$year", month: "$month", day: "$day" },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            year: "$_id.year",
            month: "$_id.month",
            day: "$_id.day",
            count: 1,
          },
        },
        {
          $group: {
            _id: { year: "$year", month: "$month", day: "$day" },
            male: {
              $sum: { $cond: [{ $eq: ["$gender", "Male"] }, "$count", 0] },
            },
            female: {
              $sum: { $cond: [{ $eq: ["$gender", "Female"] }, "$count", 0] },
            },
            other: {
              $sum: { $cond: [{ $eq: ["$gender", "Other"] }, "$count", 0] },
            },
          },
        },
        {
          $project: {
            _id: 0,
            year: "$_id.year",
            month: "$_id.month",
            day: "$_id.day",
            male: 1,
            female: 1,
            other: 1,
          },
        },
      ]);
      return result;
    } catch (error) {
      
      throw error;
    }
  }

  public async fetchingPatientsFordash(): Promise<IPatient[]> {
    try {
      const patients = await PatientModel.find()
        .sort({ createdAt: -1 })
        .limit(5);
      return patients;
    } catch (error: any) {
      throw Error(error.message);

    }
  }

  public async fetchAllPatientDetails(): Promise<IPatient[]> {
    try {
      const patientDetails = await PatientModel.find().sort({ createdAt: -1 });
      return patientDetails;
    } catch (error: any) {
      throw Error(error.message);
    }
  }
}

export default PatientRepo;
