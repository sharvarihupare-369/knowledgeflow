import type { NextFunction, Request, Response } from "express";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export const validationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, company_name } = req.body
        if (
            !name || typeof name !== 'string' ||
            !email || typeof email !== 'string' ||
            !company_name || typeof company_name !== 'string'
        ) {
            res.status(400).json({ success: false, message: "All fields are required and must be text!" })
            return;
        }

        if (!EMAIL_REGEX.test(email)) {
            res.status(400).json({
                success: false,
                message: 'Please provide a valid email address.'
            })
            return
        }
        const trimmedName = name.trim();
        const trimmedEmail = email.trim();
        const trimmedCompany = company_name.trim();

        if (trimmedName.length < 2 || trimmedName.length > 50) {
            res.status(400).json({ success: false, message: "Name must be between 2 and 50 characters." })
            return;
        }

        if (trimmedCompany.length === 0 || trimmedCompany.length > 100) {
            res.status(400).json({ success: false, message: "Company name is required and cannot exceed 100 characters." })
            return;
        }

        if (!EMAIL_REGEX.test(trimmedEmail)) {
            res.status(400).json({ success: false, message: 'Please provide a valid email address.' })
            return
        }
        req.body = { name: trimmedName, email: trimmedEmail, company_name: trimmedCompany };

        next()
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}