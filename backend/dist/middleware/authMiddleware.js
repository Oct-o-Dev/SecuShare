"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../models/userModel"));
const sendEmail_1 = require("../utils/sendEmail");
const router = (0, express_1.Router)();
// Register User + Send OTP
router.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await userModel_1.default.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: "User already exists" });
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
        const newUser = new userModel_1.default({ email, password: hashedPassword, otp, otpExpiry, verified: false });
        await newUser.save();
        await (0, sendEmail_1.sendEmail)(email, "Verify your account", `Your OTP is: ${otp}`);
        res.status(201).json({ message: "User registered. Check email for OTP." });
    }
    catch (err) {
        res.status(500).json({ error: "Registration failed" });
    }
});
// Verify OTP
router.post("/verify-otp", async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await userModel_1.default.findOne({ email });
        if (!user)
            return res.status(400).json({ message: "User not found" });
        if (user.verified)
            return res.status(400).json({ message: "Already verified" });
        if (user.otp !== otp ||
            !user.otpExpiry ||
            user.otpExpiry < new Date())
            return res.status(400).json({ message: "Invalid or expired OTP" });
        user.verified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ message: "Account verified", token });
    }
    catch (err) {
        res.status(500).json({ error: "OTP verification failed" });
    }
});
const protect = (req, res, next) => {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // attach user info (id, email, etc.)
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Not authorized, token failed" });
    }
};
exports.protect = protect;
