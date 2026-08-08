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

export const findUserById = async (id: string) => {
    const query = prisma.user.findUnique({
        where: {
            id,
        },
        include: {
            memberships: {
                include: {
                    organisation: true,
                }
            }
        }
    })
    return query;
}

export const createSignupRequest = async (payload: createSignupRequestPayload) => {
    return await prisma.signupRequest.create({
        data: {
            name: payload.name,
            email: payload.email,
            companyName: payload.companyName,
            verificationToken: payload.verificationToken,
            verificationTokenExpiresAt: payload.verificationTokenExpiresAt,
            otpHash: payload.otpHash,
            otpExpiresAt: payload.otpExpiresAt,
            otpSentAt: payload.otpSentAt,
        }
    })
}

export const updateSignupRequest = async (id: string, payload: createSignupRequestPayload) => {
    return await prisma.signupRequest.update({
        where: { id },
        data: {
            name: payload.name,
            companyName: payload.companyName,
            verificationToken: payload.verificationToken,
            verificationTokenExpiresAt: payload.verificationTokenExpiresAt,
            otpHash: payload.otpHash,
            otpExpiresAt: payload.otpExpiresAt,
            otpSentAt: payload.otpSentAt,
            otpAttempts: 0,
            otpVerified: false,
            emailVerified: false,
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
    existsSignupRequest: import('@prisma/client').SignupRequest;
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
                domain: existsSignupRequest.email.split("@")[1] || "",
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

export const createMemberAccountTransaction = async ({
    email,
    name,
    passwordHash,
    orgId, // They must be tied to an existing org
    // inviteId (if you have an invite table to clean up)
}: {
    email: string;
    name: string;
    passwordHash: string;
    orgId: string;
}) => {
    return prisma.$transaction(async (tx) => {
        // 1. Create the invited user
        const user = await tx.user.create({
            data: {
                name,
                email,
                passwordHash,
            }
        });

        // 2. Add them to the existing organisation as a MEMBER
        await tx.userOrganisationMembership.create({
            data: {
                userId: user.id,
                orgId: orgId,
                role: MembershipRole.MEMBER, // Set role to MEMBER
                status: MembershipStatus.ACTIVE,
            }
        });

        // 3. (Optional) Delete the invite request/token here 
        // await tx.inviteRequest.delete({ ... });

        return user;
    })
}

export const findOrganisationByName = async (name: string) => {
    return prisma.organisation.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } },
    });
};

export const createJoinRequest = async ({
    existsSignupRequest,
    passwordHash,
    organisationId
}: {
    existsSignupRequest: import('@prisma/client').SignupRequest;
    passwordHash: string;
    organisationId: string;
}) => {
    return prisma.$transaction(async (tx) => {
        const joinRequest = await tx.joinRequest.create({
            data: {
                name: existsSignupRequest.name,
                email: existsSignupRequest.email,
                passwordHash,
                organisationId,
            }
        });

        await tx.signupRequest.delete({
            where: {
                id: existsSignupRequest.id,
            }
        });

        return joinRequest;
    });
};

export const findJoinRequestByEmail = async (email: string) => {
    return prisma.joinRequest.findUnique({
        where: { email },
        include: { organisation: true }
    });
};

export const findInviteByToken = async (token: string) => {
    return prisma.invitation.findUnique({
        where: { token }
    });
};

export const acceptInviteTransaction = async ({
    inviteId,
    email,
    name,
    passwordHash,
    organisationId,
    collectionIds
}: {
    inviteId: string;
    email: string;
    name: string;
    passwordHash: string;
    organisationId: string;
    collectionIds: string[];
}) => {
    return prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                name,
                email,
                passwordHash,
                ...(collectionIds.length > 0 && {
                    collectionAccess: {
                        connect: collectionIds.map(id => ({ id }))
                    }
                })
            }
        });

        await tx.userOrganisationMembership.create({
            data: {
                userId: user.id,
                orgId: organisationId,
                role: MembershipRole.MEMBER,
                status: MembershipStatus.ACTIVE,
            }
        });

        const invite = await tx.invitation.update({
            where: { id: inviteId },
            data: { status: 'ACCEPTED' }
        });

        return { user, invite };
    });
};
