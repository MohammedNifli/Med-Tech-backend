class FeedbackService {
    feedbackRepository;
    constructor(feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }
    async addFeedbackAndRatingService(feedbackData) {
        try {
            const addedFeedbackAndRating = await this.feedbackRepository.addFeedbackAndRating(feedbackData);
            return addedFeedbackAndRating;
        }
        catch (error) {
            console.error('Error adding feedback in service:', error);
            return undefined;
        }
    }
    async fetchedFeedbackAndRatingService(userId, doctorId, patientId) {
        try {
            const fetchedData = await this.feedbackRepository.fetchingFeedbackAndRating(userId, doctorId, patientId);
            if (!fetchedData)
                return undefined;
            return fetchedData;
        }
        catch (error) {
            console.error("Error in service layer:", error);
            return undefined;
        }
    }
}
export default FeedbackService;
