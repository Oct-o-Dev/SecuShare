import express from "express";
import { registerUser, loginUser, getProfile, verifyOtp } from "../controllers/authController";
import User from "../models/userModel";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-otp", verifyOtp);
router.post("/login", loginUser);
router.get("/profile", protect, getProfile);

export default router;
