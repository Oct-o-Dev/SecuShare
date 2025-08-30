import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import connectDB from "./config/db";
import fileRoutes from './routes/fileRoutes';

dotenv.config();

console.log("--- Checking Environment Variables ---");
console.log("Loaded Access Key ID:", process.env.AWS_ACCESS_KEY_ID);
console.log("Loaded Secret Access Key:", process.env.AWS_SECRET_ACCESS_KEY); // <-- Add this
console.log("------------------------------------");

connectDB();


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use('/api/files', fileRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
