import { Request, Response } from "express";
import { FeedbackType } from "../models/feedbackModel.js";

import { IfeedbackService } from "../Interfaces/feedback/IfeedbackService.js";
import { HttpStatusCode } from "../enums/httpStatusCodes.js";

import { IfeedbackController } from "../Interfaces/feedback/IfeedbackController.js";

class FeedbackController implements IfeedbackController {
  private feedbackService: IfeedbackService;
  constructor(feedbackService: IfeedbackService) {
    this.feedbackService = feedbackService;
  }

  public async addFeedbackAndRating(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { userId, patientId, doctorId, feedback, rating } = req.body;


      const feedbackData: FeedbackType = {
        userId,
        doctorId,
        patientId,
        feedback,
        rating,
      };

      const existingFeedback =
        await this.feedbackService.fetchedFeedbackAndRatingService(
          userId,
          doctorId,
          patientId
        );
      if (existingFeedback) {
        return res.status(HttpStatusCode.CONFLICT).json({
          message: "Feedback for this consultation already exists",
        });
      }

      const addedFeedbackAndRating =
        await this.feedbackService.addFeedbackAndRatingService(feedbackData);

      return res.status(HttpStatusCode.CREATED).json({
        message: "Feedback and rating added successfully",
        data: addedFeedbackAndRating,
      });
    } catch (error) {
      
      return res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Server error occurred in add feedback section" });
    }
  }

  public async fetchFeedbackAndRating(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const doctorId = req.query.doctorId as string;
      const userId = req.query.userId as string;
      const patientId = req.query.patientId as string;

      if (!doctorId || !userId || !patientId) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          message:
            "doctorId, userId, and patientId are required query parameters",
        });
      }

      const fetchedFeedbackAndRating =
        await this.feedbackService.fetchedFeedbackAndRatingService(
          userId,
          doctorId,
          patientId
        );
   

      if (!fetchedFeedbackAndRating) {
        return res.status(HttpStatusCode.NOT_FOUND).json({
          message: "Data not found",
        });
      }

      return res.status(HttpStatusCode.OK).json({
        message: "Data fetched successfully",
        fetchedFeedbackAndRating,
      });
    } catch (error) {
  
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: "Server error occurred in fetchFeedbackAndRating",
      });
    }
  }
}

export default FeedbackController;
