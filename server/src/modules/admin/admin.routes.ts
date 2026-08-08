import { Router } from "express";
import { authenticator } from "../../middlewares/authenticator.middleware.js";
import { authorizeRole } from "../../middlewares/rbac.middleware.js";
import {
    getUnifiedUsers, 
    approveJoinRequest, 
    rejectJoinRequest,
    deactivateUser,
    reactivateUser,
    getInvites,
    createInvites,
    revokeInvite,
    resendInvite
} from "./admin.controller.js";

const router = Router();

// Protect all admin routes with authentication and ADMIN role check
router.use(authenticator);
router.use(authorizeRole(['ADMIN']));

router.get('/users', getUnifiedUsers);
router.post('/join-requests/:id/approve', approveJoinRequest);
router.post('/join-requests/:id/reject', rejectJoinRequest);
router.post('/users/:id/deactivate', deactivateUser);
router.post('/users/:id/reactivate', reactivateUser);

router.get('/invites', getInvites);
router.post('/invites', createInvites);
router.post('/invites/:id/revoke', revokeInvite);
router.post('/invites/:id/resend', resendInvite);

export default router;
