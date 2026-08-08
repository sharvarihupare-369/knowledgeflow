import * as yup from 'yup';

export const signupSchema = yup.object({
  body: yup.object({
    name: yup.string().required('Name is required'),
    email: yup.string().email('Must be a valid email').required('Email is required'),
    companyName: yup.string().required('Company name is required'),
  }),
});

export const verifyOtpSchema = yup.object({
  body: yup.object({
    email: yup.string().email().required('Email is required'),
    otp: yup.string().required('OTP is required'),
  }),
});

export const resendOtpSchema = yup.object({
  body: yup.object({
    email: yup.string().email().required('Email is required'),
  }),
});

export const createAccountSchema = yup.object({
  body: yup.object({
    email: yup.string().email().required('Email is required'),
    password: yup
      .string()
      .min(8, 'Password should be minimum 8 characters long.')
      .matches(/[A-Z]/, 'Password should contain at least one uppercase character.')
      .matches(/[0-9]/, 'Password should contain at least one number.')
      .required('Password is required'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], 'Passwords must match')
      .required('Confirm password is required'),
  }),
});

export const loginSchema = yup.object({
  body: yup.object({
    email: yup.string().email().required('Email is required'),
    password: yup.string().required('Password is required'),
  }),
});
