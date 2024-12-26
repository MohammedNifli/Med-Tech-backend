import MessageController from "../controllers/messageController.js";
import ChatMessageService from "../services/chatMessageService.js";
import MessageRepo from '../repositories/messageRepo.js'
import express from 'express';

const messageRoute=express.Router()


const messageRepo=new MessageRepo();
const chatMessageService=new ChatMessageService(messageRepo);

const messageController=new MessageController(chatMessageService);

messageRoute.post('/add',messageController.createMessage.bind(messageController));
messageRoute.get('/last-message',messageController.fetchLatestMessage.bind(messageController))
messageRoute.get('/conversations',messageController.loadChatMessages.bind(messageController))


export default messageRoute;

