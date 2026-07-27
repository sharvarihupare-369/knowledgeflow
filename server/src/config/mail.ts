import nodemailer from 'nodemailer';
import dotnev from 'dotenv'
dotnev.config();

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})