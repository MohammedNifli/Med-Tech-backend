import { IfeedbackRepository } from "../Interfaces/feedback/IfeedbackRepo.js";
import { FeedbackType } from "../models/feedbackModel.js";
import { IfeedbackService } from "../Interfaces/feedback/IfeedbackService.js";

class FeedbackService implements IfeedbackService{
    private feedbackRepository:IfeedbackRepository;
    constructor(feedbackRepository:IfeedbackRepository){
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
    
            if (!fetchedData) return undefined; 
    
            return fetchedData;
    
        } catch (error) {
            console.error("Error in service layer:", error);
            return undefined;
        }
    }
}

export default FeedbackService;