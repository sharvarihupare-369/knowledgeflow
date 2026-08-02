import type { Request, Response } from "express";
import { ApiError } from "../../validations/api-error.js";
import * as chatService from './chat.service.js'

import asyncHandler from 'express-async-handler';

export const semanticSearch = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { collectionId, question } = req.body;
    const result = await chatService.semanticSearch({
        collectionId,
        question
    });
    res.status(200).json({
        success: true,
        message: "Search completed successfully",
        data: result
    })
});

