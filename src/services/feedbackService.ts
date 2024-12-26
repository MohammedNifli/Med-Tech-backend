import { ifeedbackRepository } from "../Interfaces/feedback/IfeedbackRepo.js";
import { FeedbackType } from "../models/feedbackModel.js";

class FeedbackService{
    private feedbackRepository:ifeedbackRepository;
    constructor(feedbackRepository:ifeedbackRepository){
        this.feedbackRepository=feedbackRepository
    }

    public async addFeedbackAndRatingService(feedbackData: FeedbackType): Promise<FeedbackType | undefined> {
        try {
            const addedFeedbackAndRating = await this.feedbackRepository.addFeedbackAndRating(feedbackData);
            return addedFeedbackAndRating;
        } catch (error) {
            console.error('Error adding feedback in service:', error);
            return undefined;
        }
    }
    
    
    

      public async fetchedFeedbackAndRatingService(userId: string,doctorId:string,patientId:string): Promise<FeedbackType | undefined> {
        try {
            const fetchedData = await this.feedbackRepository.fetchingFeedbackAndRating(userId,doctorId,patientId);
    
            if (!fetchedData) {
               
                return undefined; // Optional: return null or handle this differently if needed
            }
    
            return fetchedData;
    
        } catch (error) {
            console.error("Error in service layer:", error);
            return undefined;
        }
    }
}

export default FeedbackService;