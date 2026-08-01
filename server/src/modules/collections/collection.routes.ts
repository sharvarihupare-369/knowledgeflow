import { Router } from "express";
import { authenticator } from "../../middlewares/authenticator.middleware.js";
import { authorizeRole } from "../../middlewares/rbac.middleware.js";
import { createCollection, getCollections, editCollection, deleteCollection } from "./collection.controller.js";

const router = Router();

router.post('/create', authenticator, authorizeRole(['ADMIN']), createCollection)
router.get('/', authenticator, getCollections)
router.patch('/:id', authenticator, authorizeRole(['ADMIN']), editCollection)
router.delete('/:id', authenticator, authorizeRole(['ADMIN']), deleteCollection)


export default router;