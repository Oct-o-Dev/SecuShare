"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtp = exports.getProfile = exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userModel_1 = __importDefault(require("../models/userModel"));
const generateToken_1 = require("../utils/generateToken");
const sendEmail_1 = require("../utils/sendEmail");
// Register
const registerUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await userModel_1.default.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: "User already exists" });
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry
        const newUser = await userModel_1.default.create({
            email,
            password,
            otp,
            otpExpiry,
            verified: false,
        });
        // Send OTP via email
        await (0, sendEmail_1.sendEmail)(email, "Verify your SecuShare account", `Your OTP is: ${otp}`);
        res.status(201).json({ message: "User registered. Please verify OTP sent to email." });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.registerUser = registerUser;
// Login
// Login
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel_1.default.findOne({ email });
        if (!user)
            return res.status(400).json({ message: "Invalid credentials" });
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: "Invalid credentials" });
        // ✅ check verification here
        if (!user.verified) {
            return res.status(400).json({ message: "Please verify your email before logging in." });
        }
        res.json({
            id: user._id,
            email: user.email,
            token: (0, generateToken_1.generateToken)(user._id.toString()),
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.loginUser = loginUser;
// Profile
const getProfile = async (req, res) => {
    // @ts-ignore
    const userId = req.user.id;
    try {
        const user = await userModel_1.default.findById(userId).select("-password");
        if (!user)
            return res.status(404).json({ message: "User not found" });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.getProfile = getProfile;
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await userModel_1.default.findOne({ email });
        if (!user)
            return res.status(400).json({ message: "User not found" });
        if (user.otp !== otp || user.otpExpiry < new Date()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }
        user.verified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();
        res.json({ message: "Account verified successfully!" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.verifyOtp = verifyOtp;
