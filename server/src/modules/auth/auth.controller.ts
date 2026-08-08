import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { env } from "../../config/env.js";
import * as registerUserService from './auth.service.js'
import { ApiError } from "../../validations/api-error.js";

export const createSignupRequest = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await registerUserService.createSignupRequest(req.body);
    res.status(200).json({
        success: true,
        message: "Verification email sent successfully."
    });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.query.token as string;
        const result = await registerUserService.verifyEmail(token);
        
        const frontendUrl = env.FRONTEND_URL;
        res.redirect(`${frontendUrl}/create-account?email=${encodeURIComponent(result.email)}`);
    } catch (error: unknown) {
        console.error(error);
        const frontendUrl = env.FRONTEND_URL;
        let errorMessage = "Error while verifying email";
        if (error instanceof ApiError) {
            errorMessage = error.message;
        }
        res.redirect(`${frontendUrl}/signup?error=${encodeURIComponent(errorMessage)}`);
    }
});

export const verifyOTP = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await registerUserService.verifyOTP(req.body)
    res.status(200).json({
        success: true,
        message: "OTP Verified Successfully."
    });
});

export const resendOTP = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    if (!email) {
        throw new ApiError(400, "Email is required.");
    }
    await registerUserService.resendOTP(email);
    res.status(200).json({
        success: true,
        message: "A new OTP has been sent to your email."
    });
});

export const createNewAccount = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await registerUserService.createNewAccount(req.body)
    if (result && 'isPending' in result && result.isPending) {
        res.status(200).json({
            success: true,
            message: result.message
        });
        return;
    }
    res.status(201).json({
        success: true,
        message: "New Account Created Successfully."
    });
});

export const loginUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await registerUserService.loginUser(req.body);
    res.status(200).json({
        success: true,
        message: "User LoggedIn Successfully.",
        data: result
    });
});

export const userDetails = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized");
    }
    const userId = req.user.id;
    const result = await registerUserService.userDetails(userId);
    res.status(200).json({
        success: true,
        message: "User LoggedIn Successfully.",
        data: result
    });
});

export const logoutUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // In a stateless JWT setup, logout is primarily handled client-side by deleting the token.
    // If you add a token blacklist or refresh tokens later, handle it here.
    res.status(200).json({
        success: true,
        message: "User logged out successfully."
    });
});

export const acceptInvite = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { token, name, password } = req.body;
    if (!token || !name || !password) {
        throw new ApiError(400, "Token, name and password are required.");
    }
    
    const result = await registerUserService.acceptInvite(token, name, password);
    
    res.status(201).json({
        success: true,
        message: "Invite accepted and account created successfully.",
        data: result
    });
});
