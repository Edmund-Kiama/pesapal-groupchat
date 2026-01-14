import nodemailer from "nodemailer";
import {
  EMAIL_FROM,
  EMAIL_FROM_NAME,
  EMAIL_HOST,
  EMAIL_PASSWORD,
  EMAIL_PORT,
  EMAIL_USERNAME,
} from "../config/env.js";

const sendEmail = async ({ to, subject, message, html }) => {
  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: EMAIL_PORT == 465,
    auth: {
      user: EMAIL_USERNAME,
      pass: EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    to,
    subject,
    text: message, 
    html,          
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
