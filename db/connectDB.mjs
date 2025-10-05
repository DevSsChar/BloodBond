import mongoose from "mongoose";
import dotenv from 'dotenv';
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, ".."); // project root
dotenv.config({ path: path.join(rootDir, ".env.local") }); // primary
dotenv.config({ path: path.join(rootDir, ".env") });

let isConnected = false; // Track connection status

const connectDB = async () => {
    if (isConnected) {
        console.log("Using existing database connection");
        return;
    }

    try {
        console.log(process.env.MONGODB_URI);
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            connectTimeoutMS: 60000,
        });

        isConnected = true; // Mark as connected
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("Database connection failed:", error.message);
        throw new Error("Database connection error"); // Do not exit process
    }
};
connectDB()
export default connectDB;
