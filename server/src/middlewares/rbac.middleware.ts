import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export const authorizeRole = (allowedRoles: ('ADMIN' | 'MEMBER')[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user || !req.user.id) {
                res.status(401).json({ success: false, message: "Unauthorized." });
                return;
            }

            // Get the user's primary organisation membership
            const membership = await prisma.userOrganisationMembership.findFirst({
                where: { userId: req.user.id }
            });

            if (!membership) {
                res.status(403).json({ success: false, message: "User does not belong to any organization." });
                return;
            }

            // Check if the user's role is within the allowed roles
            if (!allowedRoles.includes(membership.role)) {
                res.status(403).json({ 
                    success: false, 
                    message: `Access denied. You do not have the required role to perform this action.` 
                });
                return;
            }

            // User is authorized
            next();
        } catch (error) {
            console.error("RBAC Middleware Error:", error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    };
};
