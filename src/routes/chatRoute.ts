   
    import express from "express";
    import ChatController from "../controllers/chatController.js";
    import ChatRepo from "../repositories/chatRepository.js";


    import ChatService from "../services/chatService.js";

    const chatRoute=express.Router();

    const chatRepo=new ChatRepo();
    const chatService=new ChatService(chatRepo);
    const chatController=new ChatController(chatService);



    chatRoute.post('/create',chatController.createChat.bind(chatController));
    chatRoute.get('/chats',chatController.fetchChatsController.bind(chatController))
    chatRoute.get('/single-chat',chatController.fetchChatById.bind(chatController));
    chatRoute.post('/last-message',chatController.lastMessageUpdate.bind(chatController))



    
    

    export default chatRoute;