export interface signupRequestData {
    name: string;
    email: string;
    companyName: string;
}

export interface createSignupRequestPayload {
    name: string;
    email: string;
    companyName: string;
    verificationToken: string;
    verificationTokenExpiresAt: Date;
    otpHash: string;
    otpExpiresAt: Date;
    otpSentAt: Date;
}

export interface UpdateSignupRequestPayload {
    id: string;
    emailVerified: boolean;
    // otpHash: string;
    // otpExpiresAt: Date;
    // otpSentAt: Date;
}

export interface sendVerificationEmailInterface {
    name: string;
    email: string;
    verificationLink: string;
}

export interface VerificationEmailTemplateProps {
    name: string;
    verificationLink: string;
}


export interface SendOtpEmailPayload {
    name: string;
    otp: string;
    email: string;
}

export interface SendOtpAndVerifyLinkEmailPayload {
    name: string;
    otp: string;
    email: string;
    verificationLink: string;
}

export interface verifyOTPProps {
    otp: string;
    email: string;
}

export interface createNewAccountProps {
    email: string;
    password: string;
    confirmPassword: string;
}

export interface loginUserProps {
    email: string;
    password: string;
}