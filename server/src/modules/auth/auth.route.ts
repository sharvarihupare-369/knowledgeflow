import { Router } from "express";
import { createSignupRequest, verifyEmail, verifyOTP, createNewAccount, resendOTP, loginUser, userDetails } from "./auth.controller.js";
import { passwordValidation, validationMiddleware } from "../../middlewares/validation.middleware.js";
import { authenticator } from "../../middlewares/authenticator.middleware.js";

const router = Router();

router.post('/signuprequest', validationMiddleware, createSignupRequest);
router.get('/verify-email', verifyEmail);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/create-account', passwordValidation, createNewAccount);
router.post('/login', loginUser);
router.get('/user-details', authenticator, userDetails);

export default router;