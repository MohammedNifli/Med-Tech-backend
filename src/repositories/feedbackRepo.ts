import FeedbackModel, { FeedbackType } from "../models/feedbackModel.js";

import { IfeedbackRepository } from "../Interfaces/feedback/IfeedbackRepo.js";

class FeedbackRepository implements IfeedbackRepository {
  public async addFeedbackAndRating(
    feedbackData: FeedbackType
  ): Promise<FeedbackType | undefined> {
    try {
      const addedData = new FeedbackModel(feedbackData);
      const addedFeedbackAndRating = await addedData.save();
      return addedFeedbackAndRating;
    } catch (error) {
      console.error("Error in addFeedbackAndRating repository:", error);
      return undefined;
    }
  }

  public async fetchingFeedbackAndRating(
    userId: string,
    doctorId: string,
    patientId: string
  ): Promise<FeedbackType | undefined> {
    try {
      const data = await FeedbackModel.findOne({
        userId: userId,
        doctorId: doctorId,
        patientId: patientId,
      });

      if (!data) {
        console.log("No data found for appointmentId:");
        return undefined;
      }

      return data;
    } catch (error) {
      console.error("Error fetching feedback from DB:", error);
      return undefined;
    }
  }

  public async fetchTopRatedDoctors(): Promise<any> {
    try {
      const topRatedDoctors = await FeedbackModel.aggregate([
        {
          $match: {
            rating: { $gte: 4 },
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
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $project: {
            _id: 1,
            feedback: 1,
            rating: 1,
            doctorId: 1,
            doctorName: "$doctorDetails.personalInfo.name",
            specialisation: "$doctorDetails.professionalInfo.specialization",
            Image: "$doctorDetails.personalInfo.profilePicture",
          },
        },
        {
          $sort: { rating: -1 },
        },
        {
          $limit: 4,
        },
      ]);

      
      return topRatedDoctors;
    } catch (error: any) {
      console.log(error);
      throw new Error(
        "Error occurred in the fetchTopRatedDoctors repository layer"
      );
    }
  }
}

export default FeedbackRepository;
