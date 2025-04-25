//import { rateLimit } from "express-rate-limit";
import nodemailer from "nodemailer";
import { appConfig } from "./consts";

// export const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   limit: 100, // Limit each IP to 100 requests per window (here, per 15 minutes).
//   standardHeaders: "draft-8", // draft-6: RateLimit-* headers; draft-7 & draft-8: combined RateLimit header
//   legacyHeaders: false, // Disable the X-RateLimit-* headers.
//   // store: ... , // Redis, Memcached, etc. See below.
// });



// export const createGenereteSku = ()=>{
//   const length = 10;
//   const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
//   let result = "";
//   for (let i = 0; i < length; i++) {
//     const randomIndex = Math.floor(Math.random() * characters.length);
//     result += characters[randomIndex];
//   }
//   return result
// }

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
