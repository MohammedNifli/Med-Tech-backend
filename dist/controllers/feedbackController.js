import { HttpStatusCode } from "../enums/httpStatusCodes.js";
class FeedbackController {
    feedbackService;
    constructor(feedbackService) {
        this.feedbackService = feedbackService;
    }
    async addFeedbackAndRating(req, res) {
        try {
            const { userId, patientId, doctorId, feedback, rating } = req.body;
            const feedbackData = {
                userId,
                doctorId,
                patientId,
                feedback,
                rating,
            };
            const existingFeedback = await this.feedbackService.fetchedFeedbackAndRatingService(userId, doctorId, patientId);
            if (existingFeedback) {
                return res.status(HttpStatusCode.CONFLICT).json({
                    message: "Feedback for this consultation already exists",
                });
            }
            const addedFeedbackAndRating = await this.feedbackService.addFeedbackAndRatingService(feedbackData);
            return res.status(HttpStatusCode.CREATED).json({
                message: "Feedback and rating added successfully",
                data: addedFeedbackAndRating,
            });
        }
        catch (error) {
            return res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({ message: "Server error occurred in add feedback section" });
        }
    }
    async fetchFeedbackAndRating(req, res) {
        try {
            const doctorId = req.query.doctorId;
            const userId = req.query.userId;
            const patientId = req.query.patientId;
            if (!doctorId || !userId || !patientId) {
                return res.status(HttpStatusCode.BAD_REQUEST).json({
                    message: "doctorId, userId, and patientId are required query parameters",
                });
            }
            const fetchedFeedbackAndRating = await this.feedbackService.fetchedFeedbackAndRatingService(userId, doctorId, patientId);
            if (!fetchedFeedbackAndRating) {
                return res.status(HttpStatusCode.NOT_FOUND).json({
                    message: "Data not found",
                });
            }
            return res.status(HttpStatusCode.OK).json({
                message: "Data fetched successfully",
                fetchedFeedbackAndRating,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                message: "Server error occurred in fetchFeedbackAndRating",
            });
        }
    }
}
export default FeedbackController;
