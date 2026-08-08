import { prisma } from '../../config/prisma.js';
import { MembershipRole, MembershipStatus } from '@prisma/client';

export const findJoinRequestsByOrganisation = async (organisationId: string) => {
  return prisma.joinRequest.findMany({
    where: { organisationId },
    include: { organisation: true },
    orderBy: { createdAt: 'desc' },
  });
};

export const findJoinRequestById = async (id: string) => {
  return prisma.joinRequest.findUnique({
    where: { id },
    include: { organisation: true },
  });
};

export const approveJoinRequestTransaction = async (joinRequestId: string, collectionIds: string[] = []) => {
  return prisma.$transaction(async (tx) => {
    const joinRequest = await tx.joinRequest.findUnique({
      where: { id: joinRequestId },
    });

    if (!joinRequest) {
      throw new Error('Join request not found');
    }

    const user = await tx.user.create({
      data: {
        name: joinRequest.name,
        email: joinRequest.email,
        passwordHash: joinRequest.passwordHash,
        collectionAccess: {
          connect: collectionIds.map((id) => ({ id })),
        },
      },
    });

    await tx.userOrganisationMembership.create({
      data: {
        userId: user.id,
        orgId: joinRequest.organisationId,
        role: MembershipRole.MEMBER,
        status: MembershipStatus.ACTIVE,
      },
    });

    await tx.joinRequest.delete({
      where: { id: joinRequestId },
    });

    return { user, joinRequest };
  });
};

export const rejectJoinRequest = async (id: string) => {
  return prisma.joinRequest.update({
    where: { id },
    data: { status: 'INACTIVE' },
  });
};

export const getUnifiedUsers = async (organisationId: string) => {
  const [joinRequests, members] = await Promise.all([
    prisma.joinRequest.findMany({
      where: { organisationId },
      include: { organisation: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.userOrganisationMembership.findMany({
      where: { orgId: organisationId },
      include: { user: { include: { collectionAccess: true } }, organisation: true },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const unified = [
    ...joinRequests.map((jr) => ({
      type: 'REQUEST',
      id: jr.id, // This is joinRequestId
      name: jr.name,
      email: jr.email,
      organisation: jr.organisation,
      status: jr.status,
      createdAt: jr.createdAt,
      collectionIds: [],
    })),
    ...members.map((m) => ({
      type: 'MEMBER',
      id: m.userId, // This is userId
      name: m.user.name,
      email: m.user.email,
      organisation: m.organisation,
      status: m.status,
      createdAt: m.createdAt,
      collectionIds: m.user.collectionAccess.map((c) => c.id),
    })),
  ];

  // Sort combined array by descending createdAt
  unified.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return unified;
};

export const updateUserMembershipStatus = async (userId: string, orgId: string, status: MembershipStatus) => {
  return prisma.userOrganisationMembership.update({
    where: { userId_orgId: { userId, orgId } },
    data: { status },
  });
};

export const findInvitesByOrganisation = async (organisationId: string) => {
  return prisma.invitation.findMany({
    where: { organisationId },
    include: { inviter: true },
    orderBy: { createdAt: 'desc' },
  });
};

export const findInviteById = async (id: string) => {
  return prisma.invitation.findUnique({
    where: { id },
  });
};

export const createInvite = async (data: {
  email: string;
  organisationId: string;
  inviterId: string;
  token: string;
  expiresAt: Date;
  collectionIds: string[];
}) => {
  return prisma.invitation.create({
    data,
  });
};

export const updateInviteStatus = async (id: string, status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED') => {
  return prisma.invitation.update({
    where: { id },
    data: { status },
  });
};

export const findOrganisationById = async (id: string) => {
  return prisma.organisation.findUnique({
    where: { id },
  });
};

export const findUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
  });
};
