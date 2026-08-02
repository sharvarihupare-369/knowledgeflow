import { Router } from "express";
import { semanticSearch } from "./chat.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.middleware.js";
import { semanticSearchSchema } from "../../validations/chat.schema.js";

const router = Router();

router.post('/search', validateRequest(semanticSearchSchema), semanticSearch);

export default router;