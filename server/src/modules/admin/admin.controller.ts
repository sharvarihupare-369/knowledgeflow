import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { ApiError } from '../../validations/api-error.js';
import * as adminService from './admin.service.js';
import { prisma } from '../../config/prisma.js';

const getAdminOrgId = async (userId: string) => {
  const membership = await prisma.userOrganisationMembership.findFirst({
    where: { userId, status: 'ACTIVE' },
  });
  if (!membership) {
    throw new ApiError(403, 'User is not active in any organisation.');
  }
  return membership.orgId;
};

export const getUnifiedUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new ApiError(401, 'Unauthorized');

  const orgId = await getAdminOrgId(req.user.id);
  const users = await adminService.getUnifiedUsers(orgId);

  res.status(200).json({
    success: true,
    data: users,
  });
});

export const approveJoinRequest = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new ApiError(401, 'Unauthorized');

  const joinRequestId = req.params.id as string;
  if (!joinRequestId) throw new ApiError(400, 'Join request ID is required.');

  const { collectionIds } = req.body;

  const orgId = await getAdminOrgId(req.user.id);
  const user = await adminService.approveJoinRequest(joinRequestId, orgId, collectionIds || []);

  res.status(200).json({
    success: true,
    message: 'Join request approved successfully.',
    data: {
      userId: user.id,
      name: user.name,
      email: user.email,
    },
  });
});

export const rejectJoinRequest = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new ApiError(401, 'Unauthorized');

  const joinRequestId = req.params.id as string;
  if (!joinRequestId) throw new ApiError(400, 'Join request ID is required.');

  const orgId = await getAdminOrgId(req.user.id);
  await adminService.rejectJoinRequest(joinRequestId, orgId);

  res.status(200).json({
    success: true,
    message: 'Join request rejected successfully.',
  });
});

export const deactivateUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new ApiError(401, 'Unauthorized');

  const userId = req.params.id as string;
  if (!userId) throw new ApiError(400, 'User ID is required.');

  const orgId = await getAdminOrgId(req.user.id);
  await adminService.deactivateUser(userId, orgId);

  res.status(200).json({
    success: true,
    message: 'User deactivated successfully.',
  });
});

export const reactivateUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new ApiError(401, 'Unauthorized');

  const userId = req.params.id as string;
  if (!userId) throw new ApiError(400, 'User ID is required.');

  const orgId = await getAdminOrgId(req.user.id);
  await adminService.reactivateUser(userId, orgId);

  res.status(200).json({
    success: true,
    message: 'User reactivated successfully.',
  });
});

export const getInvites = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new ApiError(401, 'Unauthorized');

  const orgId = await getAdminOrgId(req.user.id);
  const invites = await adminService.getInvites(orgId);

  res.status(200).json({
    success: true,
    data: invites,
  });
});

export const createInvites = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new ApiError(401, 'Unauthorized');

  const { emails, collectionIds } = req.body;
  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    throw new ApiError(400, 'Please provide at least one email.');
  }

  const orgId = await getAdminOrgId(req.user.id);
  const invites = await adminService.createInvites(emails, collectionIds || [], orgId, req.user.id);

  res.status(201).json({
    success: true,
    message: 'Invitations sent successfully.',
    data: invites,
  });
});

export const revokeInvite = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new ApiError(401, 'Unauthorized');

  const inviteId = req.params.id as string;
  if (!inviteId) throw new ApiError(400, 'Invite ID is required.');

  const orgId = await getAdminOrgId(req.user.id);
  await adminService.revokeInvite(inviteId, orgId);

  res.status(200).json({
    success: true,
    message: 'Invitation revoked successfully.',
  });
});

export const resendInvite = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new ApiError(401, 'Unauthorized');

  const inviteId = req.params.id as string;
  if (!inviteId) throw new ApiError(400, 'Invite ID is required.');

  const orgId = await getAdminOrgId(req.user.id);
  await adminService.resendInvite(inviteId, orgId);

  res.status(200).json({
    success: true,
    message: 'Invitation resent successfully.',
  });
});
