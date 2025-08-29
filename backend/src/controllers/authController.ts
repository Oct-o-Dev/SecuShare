import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User, { IUser } from "../models/userModel";
import { generateToken } from "../utils/generateToken";

// Register
export const registerUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // check if user exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      id: newUser._id,
      email: newUser.email,
      token: generateToken((newUser._id as any).toString()),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Login
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

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
