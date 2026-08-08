import { Router } from 'express';
import { authenticator } from '../../middlewares/authenticator.middleware.js';
import { authorizeRole } from '../../middlewares/rbac.middleware.js';
import { validateRequest } from '../../middlewares/validateRequest.middleware.js';
import { createCollectionSchema, editCollectionSchema } from '../../validations/collection.schema.js';
import { createCollection, getCollections, editCollection, deleteCollection } from './collection.controller.js';

const router = Router();

router.post('/create', authenticator, authorizeRole(['ADMIN']), validateRequest(createCollectionSchema), createCollection);
router.get('/', authenticator, getCollections);
router.patch('/:id', authenticator, authorizeRole(['ADMIN']), validateRequest(editCollectionSchema), editCollection);
router.delete('/:id', authenticator, authorizeRole(['ADMIN']), deleteCollection);

export default router;
