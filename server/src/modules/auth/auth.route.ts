import { Router } from "express";
import { createSignupRequest, verifyEmail, verifyOTP, createNewAccount, resendOTP, loginUser, userDetails, logoutUser } from "./auth.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.middleware.js";
import { signupSchema, verifyOtpSchema, resendOtpSchema, createAccountSchema, loginSchema } from "../../validations/auth.schema.js";
import { authenticator } from "../../middlewares/authenticator.middleware.js";

const router = Router();

router.post('/signuprequest', validateRequest(signupSchema), createSignupRequest);
router.get('/verify-email', verifyEmail);
router.post('/verify-otp', validateRequest(verifyOtpSchema), verifyOTP);
router.post('/resend-otp', validateRequest(resendOtpSchema), resendOTP);
router.post('/create-account', validateRequest(createAccountSchema), createNewAccount);
router.post('/login', validateRequest(loginSchema), loginUser);
router.get('/user-details', authenticator, userDetails);
router.post('/logout', authenticator, logoutUser);

export default router;