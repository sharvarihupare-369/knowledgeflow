import type { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const authenticator = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // const token = req.headers?.authorization?.split(" ")[1];
        // if (!token) {
        //     res.status(400).json({ success: false, message: "Please provide token in headers." })
        // }

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authorization token is required.",
            });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token as string, env.SECRET_KEY) as unknown as {
            id: string;
            email: string;
        };
        req.user = {
            id: decoded.id,
            email: decoded.email
        }
        next();

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }

}