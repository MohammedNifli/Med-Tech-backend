import { FeedbackType } from "../../models/feedbackModel.js"


export interface IfeedbackRepository{
    addFeedbackAndRating(feedbackData: FeedbackType): Promise<FeedbackType | undefined> ;
    fetchingFeedbackAndRating(userId:string,doctorId:string,patientId:string): Promise<FeedbackType | undefined>
    fetchTopRatedDoctors():Promise<any>

}