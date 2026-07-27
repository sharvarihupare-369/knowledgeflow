import type { createNewAccountProps, loginUserProps, signupRequestData, verifyOTPProps } from "../../types/auth.js";
import { ApiError } from "../../validations/api-error.js";
import * as registerUserRepository from './auth.repository.js'
import * as emailService from '../../services/email.service.js'
import crypto from "crypto";
import { generateOtp } from "../../utils/otp.js";
import bcrypt from 'bcrypt';
import slugify from "slugify";
import jwt from 'jsonwebtoken';

export const createSignupRequest = async (signupRequestData: signupRequestData) => {
    try {
        const user = await registerUserRepository.findUserByEmail(signupRequestData.email);
        if (user) {
            throw new ApiError(409, "User already exists with this email!");
        }
        const existsSignupRequest = await registerUserRepository.findUserBySignUpRequest(signupRequestData.email)
        if (existsSignupRequest) {
            throw new ApiError(409, "A verification request already exists for this email!");
        }
        const token = crypto.randomUUID();
        // const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        const otp = generateOtp();
        const otpHash = await bcrypt.hash(otp, 10);
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        const otpSentAt = new Date();
        const payload = { ...signupRequestData, verificationToken: token, verificationTokenExpiresAt: expiresAt, otpHash, otpExpiresAt, otpSentAt }
        const result = await registerUserRepository.createSignupRequest(payload);
        const frontendUrl = process.env.FRONTEND_URL;

        if (!frontendUrl) {
            throw new Error("FRONTEND_URL is not configured");
        };

        const verificationLink =
            `${frontendUrl}/api/auth/verify-email?token=${token}`;



        await emailService.sendVerificationEmailAndOTP({
            name: signupRequestData.name,
            email: signupRequestData.email,
            verificationLink: verificationLink,
            otp: otp
        })
        return {
            email: result.email
        };
    } catch (error) {
        console.error(error);

        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(500, "Internal server error");
    }
}

export const verifyEmail = async (token: string, email?: string) => {
    const existingSignupRequest = await registerUserRepository.findSignupRequestByToken(token);
    if (!existingSignupRequest) {
        throw new ApiError(404, "Invalid Verification Link!");
    }
    if (existingSignupRequest.verificationTokenExpiresAt < new Date()) {
        throw new ApiError(400, "Verification link has expired.");
    }
    if (existingSignupRequest.emailVerified || existingSignupRequest.otpVerified) {
        throw new ApiError(400, "Account already verified.");
    }

    // const otp = generateOtp();
    // const otpHash = await bcrypt.hash(otp, 10);
    // const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    // const otpSentAt = new Date();

    // const payload = {
    //     id: existingSignupRequest.id,
    //     emailVerified: true,
    //     otpHash,
    //     otpExpiresAt,
    //     otpSentAt
    // }
    const payload = {
        id: existingSignupRequest.id,
        emailVerified: true,
    }
    const result = await registerUserRepository.updateSignupRequestAfterEmailVerification(payload);
    // await emailService.sendOtpEmail({ email: existingSignupRequest.email, name: existingSignupRequest.name, otp })
    return {
        email: existingSignupRequest.email
    }
}

export const verifyOTP = async (payload: verifyOTPProps) => {
    const { email, otp } = payload;
    const existsSignupRequest = await registerUserRepository.findUserBySignUpRequest(email);
    if (!existsSignupRequest) {
        throw new ApiError(404, "Verification request does not exists!");
    }
    // if (!existsSignupRequest.emailVerified) {
    //     throw new ApiError(400, "Please verify your email first.");
    // }
    if (existsSignupRequest.emailVerified || existsSignupRequest.otpVerified) {
        throw new ApiError(400, "Account already verified.");
    }
    if (!existsSignupRequest.otpHash || !existsSignupRequest.otpExpiresAt) {
        throw new ApiError(400, "OTP has not been generated.");
    }
    // if (existsSignupRequest?.otpExpiresAt < new Date(Date.now())) {
    //     throw new ApiError(400, "OTP expired.");
    // }
    if (existsSignupRequest.otpExpiresAt < new Date()) {
        throw new ApiError(400, "OTP has expired.");
    }
    const isOtpValid = await bcrypt.compare(otp, existsSignupRequest.otpHash)
    if (!isOtpValid) {
        const updatedSignupRequest = await registerUserRepository.incrementOtpAttempts(existsSignupRequest.id);
        const remainingAttempts = 3 - updatedSignupRequest.otpAttempts;
        if (updatedSignupRequest.otpAttempts >= 3) {
            await registerUserRepository.invalidateOtp(
                existsSignupRequest.id
            );

            throw new ApiError(
                400,
                "Maximum OTP attempts exceeded. Please request a new OTP."
            );
        }

        throw new ApiError(
            400,
            `Invalid OTP. ${remainingAttempts} attempt(s) remaining.`
        );
    }

    const res = await registerUserRepository.updateSignupRequestAfterOTPVerification(existsSignupRequest.id)
    return {
        email: existsSignupRequest.email,
    };
}

export const resendOTP = async (email: string) => {
    const existingSignupRequest = await registerUserRepository.findUserBySignUpRequest(email);
    if (!existingSignupRequest) {
        throw new ApiError(404, "Verification request does not exists!");
    }
    if (existingSignupRequest.emailVerified || existingSignupRequest.otpVerified) {
        throw new ApiError(400, "Account already verified. Please proceed to create an account.");
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const otpSentAt = new Date();

    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) throw new Error("FRONTEND_URL is not configured");
    const verificationLink = `${frontendUrl}/api/auth/verify-email?token=${existingSignupRequest.verificationToken}`;

    await registerUserRepository.updateSignupRequestOTP(existingSignupRequest.id, otpHash, otpExpiresAt, otpSentAt);
    await emailService.sendVerificationEmailAndOTP({
        email: existingSignupRequest.email,
        name: existingSignupRequest.name,
        otp,
        verificationLink
    });
    return {
        email: existingSignupRequest.email
    }
}

export const createNewAccount = async (payload: createNewAccountProps) => {
    const { email, password, confirmPassword } = payload;

    const existsSignupRequest = await registerUserRepository.findUserBySignUpRequest(email);
    if (!existsSignupRequest) {
        throw new ApiError(404, "Verification request does not exists!");
    }
    if (!existsSignupRequest.emailVerified && !existsSignupRequest.otpVerified) {
        throw new ApiError(400, "Please verify your email or OTP first.");
    }

    if (password !== confirmPassword) {
        throw new ApiError(400, "Both password should match each other.");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const slug = slugify(
        existsSignupRequest.companyName,
        {
            lower: true,
            strict: true,
        }
    );
    const result =
        await registerUserRepository.createAccountTransaction({
            existsSignupRequest,
            passwordHash,
            slug,
        });

    return result;

}

export const loginUser = async (payload: loginUserProps) => {
    const { email, password } = payload;
    const existingUser = await registerUserRepository.findUserByEmail(email);
    if (!existingUser) {
        throw new ApiError(404, "User does not exists. Please signup first!");
    }

    if (!email || !password) {
        throw new ApiError(400, "All fields are required and must be text!");
    }

    const comparePassword = await bcrypt.compare(password, existingUser.passwordHash)

    if (!comparePassword) {
        throw new ApiError(400, "Invalid Credentials!")
    }

    const token = await jwt.sign({ id: existingUser.id, email: existingUser.email }, process.env.SECRET_KEY as string, { expiresIn: '1d' });
    return {
        token,
        email: existingUser.email,
        name: existingUser.name
    }

}