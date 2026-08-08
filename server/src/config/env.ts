import * as yup from 'yup';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = yup.object({
  PORT: yup.number().default(8080),
  EMAIL_USER: yup.string().required('EMAIL_USER is required'),
  EMAIL_PASS: yup.string().required('EMAIL_PASS is required'),
  FRONTEND_URL: yup
    .string()
    .matches(/^https?:\/\//, 'Must be a valid URL')
    .default('http://localhost:3000'),
  APP_NAME: yup.string().default('KnowledgeFlow AI'),
  SECRET_KEY: yup.string().required('SECRET_KEY is required'),
  QDRANT_URL: yup
    .string()
    .matches(/^https?:\/\//, 'Must be a valid URL')
    .required('QDRANT_URL is required'),
  DATABASE_URL: yup.string().required('DATABASE_URL is required'),
  BACKEND_URL: yup
    .string()
    .matches(/^https?:\/\//, 'Must be a valid URL')
    .optional(),
});

export const env = envSchema.validateSync(process.env, { abortEarly: false, stripUnknown: true });
