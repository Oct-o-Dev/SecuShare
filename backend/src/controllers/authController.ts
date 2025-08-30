import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User, { IUser } from "../models/userModel";
import { generateToken } from "../utils/generateToken";
import { sendEmail } from "../utils/sendEmail";

// Register
export const registerUser = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

    const newUser = await User.create({
      email,
      password,
      otp,
      otpExpiry,
      verified: false,
    });

    // Send OTP via email
    await sendEmail(email, "Verify your SecuShare account", `Your OTP is: ${otp}`);

    res.status(201).json({ message: "User registered. Please verify OTP sent to email." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Login
// Login
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // ✅ check verification here
    if (!user.verified) {
      return res.status(400).json({ message: "Please verify your email before logging in." });
    }

    res.json({
      id: user._id,
      email: user.email,
      token: generateToken((user._id as any).toString()),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


// Profile
export const getProfile = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.id;

  try {
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
export const verifyOtp = async (req: any, res: any) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.otp !== otp || user.otpExpiry! < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.verified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: "Account verified successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
