import express from "express";
import FeedbackService from "../services/feedbackService.js";
import FeedbackRepository from "../repositories/feedbackRepo.js";
import FeedbackController from "../controllers/feedbackController.js";
const feedbackRoute = express.Router();
const feedbackRepository = new FeedbackRepository();
const feedbackService = new FeedbackService(feedbackRepository);
const feedbackController = new FeedbackController(feedbackService);
// routes
feedbackRoute.post('/add', feedbackController.addFeedbackAndRating.bind(feedbackController));
feedbackRoute.get('/feed-rating', feedbackController.fetchFeedbackAndRating.bind(feedbackController));
export default feedbackRoute;
