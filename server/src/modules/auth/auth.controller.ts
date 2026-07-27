import type { Request, Response } from "express";
import * as registerUserService from './auth.service.js'
import { ApiError } from "../../validations/api-error.js";

export const createSignupRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await registerUserService.createSignupRequest(req.body);
        res.status(200).json({
            success: true,
            message: "Verification email sent successfully."
        })

    } catch (error: unknown) {
        console.error(error);
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message
            })
            return
        }
        res.status(500).json({ success: false, message: "Internal server error" })
    }
}

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        // const { email } = req.body;
        const token = req.query.token as string;
        const result = await registerUserService.verifyEmail(token);
        res.status(200).json({
            success: true,
            message: "Email verified successfully."
        })
    } catch (error: unknown) {
        console.error(error);
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message
            })
            return
        }
        res.status(500).json({ success: false, message: "Error while verifying email" })
    }
}

export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await registerUserService.verifyOTP(req.body)
        res.status(200).json({
            success: true,
            message: "OTP Verified Successfully."
        })
    } catch (error) {
        console.error(error);
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message
            })
            return
        }
        res.status(500).json({ success: false, message: "Error while verifying OTP" })
    }
}


export const resendOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ success: false, message: "Email is required." });
            return;
        }
        await registerUserService.resendOTP(email);
        res.status(200).json({
            success: true,
            message: "A new OTP has been sent to your email."
        })
    } catch (error: unknown) {
        console.error(error);
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message
            })
            return
        }
        res.status(500).json({ success: false, message: "Error while resending OTP" })
    }
}

export const createNewAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await registerUserService.createNewAccount(req.body)
        res.status(201).json({
            success: true,
            message: "New Account Created Successfully."
        })
    } catch (error) {
        console.error(error);
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message
            })
            return
        }
        res.status(500).json({ success: false, message: "Error while creating account." })
    }
}

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await registerUserService.loginUser(req.body);
        res.status(200).json({
            success: true,
            message: "User LoggedIn Successfully.",
            data: result
        })
    } catch (error) {
        console.error(error);
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message
            })
            return
        }
        res.status(500).json({ success: false, message: "Error while creating account." })
    }
}

