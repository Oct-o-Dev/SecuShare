"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
// Looking to send emails in production? Check out our Email API/SMTP product!
var transport = nodemailer_1.default.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "d5e641fa11cb40",
        pass: "623ea536d69b85"
    }
});
const sendEmail = async (to, subject, text) => {
    await transport.sendMail({
        from: '"SecuShare" <no-reply@secushare.com>',
        to,
        subject,
        text,
    });
};
exports.sendEmail = sendEmail;
