import { FeedbackType } from "../../models/feedbackModel.js";

export interface IfeedbackService{

    addFeedbackAndRatingService(feedbackData: FeedbackType): Promise<FeedbackType | undefined> ;
    fetchedFeedbackAndRatingService(userId: string,doctorId:string,patientId:string): Promise<FeedbackType | undefined>

}