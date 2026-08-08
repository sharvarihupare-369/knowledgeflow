import { ApiError } from "../../validations/api-error.js";
import * as adminRepository from './admin.repository.js';
import * as emailService from '../../services/email.service.js';
import crypto from "crypto";

export const getUnifiedUsers = async (orgId: string) => {
    return await adminRepository.getUnifiedUsers(orgId);
};

export const approveJoinRequest = async (joinRequestId: string, adminOrgId: string, collectionIds: string[] = []) => {
    const joinRequest = await adminRepository.findJoinRequestById(joinRequestId);
    
    if (!joinRequest) {
        throw new ApiError(404, "Join request not found.");
    }
    
    if (joinRequest.organisationId !== adminOrgId) {
        throw new ApiError(403, "You do not have permission to approve this request.");
    }

    const { user } = await adminRepository.approveJoinRequestTransaction(joinRequestId, collectionIds);
    
    // Optionally send email asynchronously
    emailService.sendApprovalEmail({ email: user.email, name: user.name }).catch(console.error);

    return user;
};

export const rejectJoinRequest = async (joinRequestId: string, adminOrgId: string) => {
    const joinRequest = await adminRepository.findJoinRequestById(joinRequestId);
    
    if (!joinRequest) {
        throw new ApiError(404, "Join request not found.");
    }
    
    if (joinRequest.organisationId !== adminOrgId) {
        throw new ApiError(403, "You do not have permission to reject this request.");
    }

    await adminRepository.rejectJoinRequest(joinRequestId);
    
    // Optionally send email asynchronously
    emailService.sendRejectionEmail({ email: joinRequest.email, name: joinRequest.name }).catch(console.error);

    return { success: true };
};

import { MembershipStatus } from "@prisma/client";

export const deactivateUser = async (userId: string, adminOrgId: string) => {
    // You could optionally add a check here to ensure the user belongs to adminOrgId
    await adminRepository.updateUserMembershipStatus(userId, adminOrgId, MembershipStatus.INACTIVE);
    return { success: true };
};

export const reactivateUser = async (userId: string, adminOrgId: string) => {
    await adminRepository.updateUserMembershipStatus(userId, adminOrgId, MembershipStatus.ACTIVE);
    return { success: true };
};

export const getInvites = async (orgId: string) => {
    return await adminRepository.findInvitesByOrganisation(orgId);
};

export const createInvites = async (emails: string[], collectionIds: string[], adminOrgId: string, inviterId: string) => {
    const invites = [];
    const org = await adminRepository.findOrganisationById(adminOrgId);
    if (!org) throw new ApiError(404, "Organisation not found");
    const inviter = await adminRepository.findUserById(inviterId);
    
    for (const email of emails) {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry
        
        const invite = await adminRepository.createInvite({
            email,
            organisationId: adminOrgId,
            inviterId,
            token,
            expiresAt,
            collectionIds
        });
        invites.push(invite);
        
        // Send email
        emailService.sendInvitationEmail({ 
            email, 
            token, 
            inviterName: inviter?.name || 'Admin', 
            orgName: org.name 
        }).catch(console.error);
    }
    
    return invites;
};

export const revokeInvite = async (inviteId: string, adminOrgId: string) => {
    const invite = await adminRepository.findInviteById(inviteId);
    if (!invite) throw new ApiError(404, "Invite not found");
    if (invite.organisationId !== adminOrgId) throw new ApiError(403, "Permission denied");
    
    await adminRepository.updateInviteStatus(inviteId, "REVOKED");
};

export const resendInvite = async (inviteId: string, adminOrgId: string) => {
    const invite = await adminRepository.findInviteById(inviteId);
    if (!invite) throw new ApiError(404, "Invite not found");
    if (invite.organisationId !== adminOrgId) throw new ApiError(403, "Permission denied");
    
    const org = await adminRepository.findOrganisationById(adminOrgId);
    const inviter = await adminRepository.findUserById(invite.inviterId);
    
    emailService.sendInvitationEmail({ 
        email: invite.email, 
        token: invite.token, 
        inviterName: inviter?.name || 'Admin', 
        orgName: org?.name || 'Organisation' 
    }).catch(console.error);
};
