import { Router } from "express";
import { semanticSearch, getConversations, getConversation, createConversation, deleteConversation, getConversationMessages } from "./chat.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.middleware.js";
import { authenticator } from "../../middlewares/authenticator.middleware.js";
import { semanticSearchSchema, createConversationSchema } from "../../validations/chat.schema.js";

const router = Router();

router.use(authenticator);

router.post('/conversations', validateRequest(createConversationSchema), createConversation);
router.get('/conversations', getConversations);
router.get('/conversations/:id', getConversation);
router.get('/conversations/:id/messages', getConversationMessages);
router.delete('/conversations/:id', deleteConversation);
router.post('/search', validateRequest(semanticSearchSchema), semanticSearch);

export default router;