import type { Request, Response } from "express";
import { ApiError } from "../../validations/api-error.js";
import * as chatService from './chat.service.js'

import asyncHandler from 'express-async-handler';

export const createConversation = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { collectionId, title } = req.body;
    const userId = req.user!.id;
    const conversation = await chatService.createConversation(userId, collectionId, title);
    res.status(201).json({
        success: true,
        message: "Conversation created successfully",
        data: conversation
    });
});

export const getConversations = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { collectionId } = req.query as { collectionId: string };
    if (!collectionId) throw new ApiError(400, "Collection ID is required");

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const userId = req.user!.id;
    const { conversations, total } = await chatService.getConversations(userId, collectionId, page, limit);

    res.status(200).json({
        success: true,
        data: conversations,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    });
});

export const getConversation = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const userId = req.user!.id;
    const conversation = await chatService.getConversation(userId, id);
    res.status(200).json({
        success: true,
        data: conversation
    });
});

export const deleteConversation = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const userId = req.user!.id;
    await chatService.deleteConversation(userId, id);
    res.status(200).json({
        success: true,
        message: "Conversation deleted successfully"
    });
});

export const getConversationMessages = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const userId = req.user!.id;

    // We already have a service method that fetches the conversation including messages
    const conversation = await chatService.getConversation(userId, id);

    const messages = conversation.messages.map((m: any) => ({
        role: m.role,
        content: m.content
    }));

    // Respond directly with the array as requested
    res.status(200).json(messages);
});

export const semanticSearch = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { collectionId, conversationId, question } = req.body;
    const userId = req.user!.id;

    const { stream, sources, conversationId: activeConversationId, saveMessage } = await chatService.semanticSearch({
        userId,
        collectionId,
        conversationId,
        question
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let isClientDisconnected = false;
    req.on('close', () => {
        isClientDisconnected = true;
    });

    res.write(`data: ${JSON.stringify({ type: 'metadata', sources, conversationId: activeConversationId })}\n\n`);

    let fullAnswer = "";
    try {
        for await (const chunk of stream) {
            if (isClientDisconnected) break;

            if (chunk && chunk.response) {
                fullAnswer += chunk.response;
                res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk.response })}\n\n`);
            }
        }
    } catch (error) {
        console.error("Error during stream:", error);
        res.write(`data: ${JSON.stringify({ type: 'error', message: 'Stream interrupted' })}\n\n`);
    }

    await saveMessage(fullAnswer);

    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
});
