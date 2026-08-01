import { Router } from "express";
import { authenticator } from "../../middlewares/authenticator.middleware.js";
import { createCollection, getCollections, editCollection, deleteCollection } from "./collection.controller.js";

const router = Router();

router.post('/create', authenticator, createCollection)
router.get('/', authenticator, getCollections)
router.patch('/:id', authenticator, editCollection)
router.delete('/:id', authenticator, deleteCollection)



export default router;