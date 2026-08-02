import { Router } from "express";
import { uploadDocument, getAllDocuments, getDocumentById, deleteDocument } from './document.controller.js'
import { authenticator } from "../../middlewares/authenticator.middleware.js";
import { upload } from "../../config/multer.js";
import { authorizeRole } from "../../middlewares/rbac.middleware.js";
import { validateRequest } from "../../middlewares/validateRequest.middleware.js";
import { uploadDocumentSchema } from "../../validations/document.schema.js";

const router = Router();

router.post('/upload', authenticator, upload.single('file'), validateRequest(uploadDocumentSchema), uploadDocument);
router.get('/', authenticator, getAllDocuments);
router.get('/:id', authenticator, getDocumentById);
router.delete('/:id', authenticator, authorizeRole(['ADMIN']), deleteDocument);
// router.patch('/:id', editDocument);

export default router;