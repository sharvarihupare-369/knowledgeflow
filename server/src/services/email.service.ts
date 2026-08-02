import { env } from "../config/env.js";
import { transporter } from "../config/mail.js";
import { otpEmailTemplate } from "../templates/otp-email.js";
import { verificationEmailTemplate } from "../templates/verification-email.js";
import { verifylinkAndOTPTemplate } from "../templates/verify-email-otp.js";
import type { SendOtpAndVerifyLinkEmailPayload, SendOtpEmailPayload, sendVerificationEmailInterface } from "../types/auth.js";


export const sendVerificationEmail = async ({ email, name, verificationLink }: sendVerificationEmailInterface) => {
    const html = verificationEmailTemplate({ name, verificationLink })
    const info = await transporter.sendMail({
        from: env.EMAIL_USER,
        to: email,
        subject: "Verify your email",
        html
    })
    return info;
}



export const sendOtpEmail = async ({ email, name, otp }: SendOtpEmailPayload) => {
    const html = otpEmailTemplate({ name, otp })
    const info = await transporter.sendMail({
        from: env.EMAIL_USER,
        to: email,
        subject: "Your Verification Code",
        html
    })
    return info;
}

// sendPasswordResetEmail(...)

export const sendVerificationEmailAndOTP = async ({ email, name, verificationLink, otp }: SendOtpAndVerifyLinkEmailPayload) => {
    const html = verifylinkAndOTPTemplate({ name, verificationLink, otp });
    const info = await transporter.sendMail({
        from: env.EMAIL_USER,
        to: email,
        subject: "Verify your email",
        html
    })
    return info;
} 