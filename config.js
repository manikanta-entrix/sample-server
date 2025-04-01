import mongoose from "mongoose";

const connectDb = async (url) => {
    try {
        console.log("Attempting to connect to MongoDB...");
        mongoose.set('strictQuery', true);
        const conn = await mongoose.connect(url);
        console.log("MongoDB connected successfully");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
}

export default connectDb;
