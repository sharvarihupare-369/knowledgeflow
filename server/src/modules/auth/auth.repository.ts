import { prisma } from "../../config/prisma.js";
import type { createSignupRequestPayload, UpdateSignupRequestPayload } from "../../types/auth.js";
import {
    MembershipRole,
    MembershipStatus,
} from "@prisma/client";

export const findUserBySignUpRequest = async (email: string) => {
    const query = prisma.signupRequest.findUnique({
        where: {
            email,
        }
    })
    return query;
}

export const findUserByEmail = async (email: string) => {
    const query = prisma.user.findUnique({
        where: {
            email,
        }
    })
    return query;
}

export const createSignupRequest = async (payload: createSignupRequestPayload) => {
    return await prisma.signupRequest.create({
        data: {
            name: payload.name,
            email: payload.email,
            companyName: payload.company_name,
            verificationToken: payload.verificationToken,
            verificationTokenExpiresAt: payload.verificationTokenExpiresAt,
            otpHash: payload.otpHash,
            otpExpiresAt: payload.otpExpiresAt,
            otpSentAt: payload.otpSentAt,
        }
    })
}

export const findSignupRequestByToken = async (token: string) => {
    return await prisma.signupRequest.findUnique({
        where: {
            verificationToken: token
        }
    })
}

export const updateSignupRequestAfterEmailVerification = async (payload: UpdateSignupRequestPayload) => {
    return await prisma.signupRequest.update({
        where: {
            id: payload.id,
        },
        data: {
            emailVerified: payload.emailVerified,
            // otpHash: payload.otpHash,
            // otpExpiresAt: payload.otpExpiresAt,
            // otpSentAt: payload.otpSentAt,
        }
    })
}

export const updateSignupRequestOTP = async (id: string, otpHash: string, otpExpiresAt: Date, otpSentAt: Date) => {
    return prisma.signupRequest.update({
        where: { id },
        data: {
            otpHash,
            otpExpiresAt,
            otpSentAt,
            otpAttempts: 0,
        }
    });
};

export const updateSignupRequestAfterOTPVerification = async (id: string) => {
    return await prisma.signupRequest.update({
        where: {
            id: id,
        },
        data: {
            otpVerified: true,
            otpAttempts: 0,
        }
    })
}
export const incrementOtpAttempts = async (id: string) => {
    return prisma.signupRequest.update({
        where: {
            id,
        },
        data: {
            otpAttempts: {
                increment: 1,
            },
        },
    });
};

export const invalidateOtp = async (id: string) => {
    return prisma.signupRequest.update({
        where: {
            id,
        },
        data: {
            otpHash: null,
            otpExpiresAt: null,
            otpSentAt: null,
            otpAttempts: 0,
        },
    });
};

export const createAccountTransaction = async ({
    existsSignupRequest,
    passwordHash,
    slug,
}: {
    existsSignupRequest: any;
    passwordHash: string;
    slug: string;
}) => {
    return prisma.$transaction(async (tx) => {
        console.log("Creating user...");
        const user = await tx.user.create({
            data: {
                name: existsSignupRequest.name,
                email: existsSignupRequest.email,
                passwordHash,
            }
        });
        console.log("User created");
        const organisation = await tx.organisation.create({
            data: {
                name: existsSignupRequest.companyName,
                slug,
                domain: existsSignupRequest.email.split("@")[1],
                ownerId: user.id,
            }
        });
        console.log("Organisation created");
        await tx.userOrganisationMembership.create({
            data: {
                userId: user.id,
                orgId: organisation.id,
                role: MembershipRole.ADMIN,
                status: MembershipStatus.ACTIVE,
            }
        });
        console.log("Membership created");
        await tx.signupRequest.delete({
            where: {
                id: existsSignupRequest.id,
            },
        });
        console.log("Signup request deleted");
        return {
            user,
            organisation,
        };
    })
}