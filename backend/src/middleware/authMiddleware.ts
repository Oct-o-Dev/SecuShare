import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import  User  from "../models/userModel";
import { sendEmail } from "../utils/sendEmail";
import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  user?: any;
}

interface JwtPayload {
  id: string;
}

const router = Router();

// Register User + Send OTP
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const newUser = new User({ email, password: hashedPassword, otp, otpExpiry, verified: false });
    await newUser.save();

    await sendEmail(email, "Verify your account", `Your OTP is: ${otp}`);

    res.status(201).json({ message: "User registered. Check email for OTP." });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.verified) return res.status(400).json({ message: "Already verified" });
    if (
      user.otp !== otp ||
      !user.otpExpiry ||
      user.otpExpiry < new Date()
    )
      return res.status(400).json({ message: "Invalid or expired OTP" });

    user.verified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: "1h" });

    res.json({ message: "Account verified", token });
  } catch (err) {
    res.status(500).json({ error: "OTP verification failed" });
  }
});

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded; // attach user info (id, email, etc.)
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};
