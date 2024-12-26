import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();
const mongoURI = process.env.MONGO_URI || "";
const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            ssl: true,
            sslValidate: false,
            serverSelectionTimeoutMS: 30000, // 30 seconds for connection establishment
            socketTimeoutMS: 60000,
        };
        console.log('MongoDB connected successfully');
    }
    catch (error) {
        console.error("Error connecting to Mongodb:", error);
    }
};
export default connectDB;
