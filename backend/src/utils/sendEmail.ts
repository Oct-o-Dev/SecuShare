import nodemailer from "nodemailer";

// Looking to send emails in production? Check out our Email API/SMTP product!
var transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "d5e641fa11cb40",
    pass: "623ea536d69b85"
  }
});


export const sendEmail = async (to: string, subject: string, text: string) => {
  await transport.sendMail({
    from: '"SecuShare" <no-reply@secushare.com>',
    to,
    subject,
    text,
  });
};
