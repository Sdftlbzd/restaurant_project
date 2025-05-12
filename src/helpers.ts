import { rateLimit } from "express-rate-limit";
import nodemailer from "nodemailer";
import { appConfig } from "./consts";

export const orderLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 dəqiqə
  limit: 10, // 10 sorğu icazəlidir
  message: {
    error: "Too many orders. Please wait a minute before trying again.",
  },
  standardHeaders: "draft-8",
  legacyHeaders: false,
})


export const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: appConfig.EMAIL,
    pass: appConfig.EMAIL_PASSWORD,
  },
});
