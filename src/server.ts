import express from "express";
import { Request, Response } from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRouter from "./routes/userRoute.js";
import docRouter from "./routes/doctorRoute.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import refreshRoute from "./routes/refreshRouter.js";
import otpRoute from "./routes/otpRoute.js";
import adminRoute from "./routes/adminRoute.js";
import patientRoute from "./routes/patientRoute.js";
import appointmentRoute from "./routes/appointmentRoute.js";
import feedbackRoute from "./routes/feedbackRoute.js";
import walletRoute from "./routes/walletRoute.js";
import paymentRoute from "./routes/paymentRoute.js";
import chatRoute from "./routes/chatRoute.js";
import messageRoute from "./routes/messageRoute.js";
import docWalletRoute from "./routes/doctorWalletRoute.js";
import prescriptionRoute from "./routes/prescriptionRoute.js";


import { Server } from 'socket.io';
import {createServer} from 'http'




dotenv.config();


connectDB();

const app = express();

const server = createServer(app);
const io=new Server(server,{
  cors:{
    origin:"*"
  }
})


// Use cookie-parser middleware to parse cookies from the request
app.use(cookieParser());

// CORS options for allowing cookies and specifying allowed origins
const corsOptions = {
  origin: "http://localhost:5173", 
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], 
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Use CORS middleware
app.use(cors(corsOptions));

// Middleware for parsing JSON and URL-encoded data
app.use("/appointment/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define routes
app.use("/user", authRouter);
app.use("/doctor", docRouter);
app.use("/auth", refreshRoute);
app.use("/otp", otpRoute);
app.use("/admin", adminRoute);
app.use("/patient", patientRoute);
app.use("/appointment", appointmentRoute);
app.use("/feedback", feedbackRoute);
app.use("/wallet", walletRoute);
app.use("/payment", paymentRoute);
app.use("/chat", chatRoute);
app.use("/message", messageRoute);
app.use('/doc-wallet',docWalletRoute);
app.use('/prescription',prescriptionRoute)


// Default route for testing
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

// Sample login route for testing
app.get("/log", (req: Request, res: Response) => {
  res.send("Login please");
});





let users: { [key: string]: string } = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Register user on connection
  socket.on('register', (userId) => {
    users[userId] = socket.id; // Map userId to socket.id
    console.log(`User ${userId} registered with socket ID: ${socket.id}`);
  });

  // Join a specific chat room
  socket.on('join_chat', (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  // Handle new message and deliver to recipient
  socket.on('send_message', ({ senderId, recipientId, content }) => {
    const recipientSocketId = users[recipientId];
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('message_received', {
        senderId,
        content,
        timestamp: new Date(),
      });
    } else {
      console.log('Recipient not connected');
    }
  });

  // Cleanup on disconnect
  socket.on('disconnect', () => {
    for (const [userId, socketId] of Object.entries(users)) {
      if (socketId === socket.id) {
        delete users[userId];
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});






// Start the server
const port = process.env.PORT || 4444;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


