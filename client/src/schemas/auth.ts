import * as yup from "yup";

export const signupSchema = yup.object({
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  email: yup
    .string()
    .required("Email is required")
    .email("Must be a valid email"),
  company_name: yup
    .string()
    .required("Company name is required")
    .max(100, "Company name cannot exceed 100 characters"),
});

export const loginSchema = yup.object({
  email: yup
    .string()
    .required("Email is required")
    .email("Must be a valid email"),
  password: yup.string().required("Password is required"),
});

export const verifyOtpSchema = yup.object({
  otp: yup
    .string()
    .required("OTP is required")
    .min(6, "OTP must be at least 6 characters"),
});

export const createAccountSchema = yup.object({
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),
});
