import { Router } from "express";
import { createSignupRequest, verifyEmail, verifyOTP, createNewAccount, resendOTP, loginUser } from "./auth.controller.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";

const router = Router();

router.post('/signuprequest', validationMiddleware, createSignupRequest);
router.get('/verify-email', verifyEmail);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/create-account', createNewAccount);
router.post('/login', loginUser);


export default router;