import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import fs from 'fs/promises';
import { ApiError } from "../../validations/api-error.js";
import * as documentService from './document.service.js';
import { processDocumentBackground } from './document.worker.js';

export const uploadDocument = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized");
    }

    if (!req.file) {
        throw new ApiError(400, "File is required");
    }

    const { collectionId, title } = req.body;
    if (!collectionId) {
        throw new ApiError(400, "Collection ID is required");
    }

    try {
        const documentData = {
            title: title || req.file.originalname,
        originalName: req.file.originalname,
        filePath: req.file.path,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        collectionId: collectionId,
        uploadedBy: req.user.id
    };

    const result = await documentService.uploadDocument(documentData, []);

    // Start background processing
    processDocumentBackground(result.id, result.filePath, result.collectionId, result.mimeType, false).catch(err => {
        console.error("Background job failed:", err);
    });

    res.status(201).json({
        success: true,
        message: "Document uploaded and is processing in background",
        data: result,
    });
    } catch (error) {
        if (req.file && req.file.path) {
            fs.unlink(req.file.path).catch(err => console.error("Failed to delete temp file:", err));
        }
        throw error;
    }
});

export const getAllDocuments = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new ApiError(401, "Unauthorized");
    const collectionId = req.query.collectionId as string | undefined;
    const documents = await documentService.getAllDocuments(req.user.id, collectionId);
    res.status(200).json({ success: true, data: documents });
});

export const getDocumentById = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new ApiError(401, "Unauthorized");
    const id = req.params.id as string;
    const document = await documentService.getDocumentById(id, req.user.id);
    res.status(200).json({ success: true, data: document });
});

export const deleteDocument = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new ApiError(401, "Unauthorized");
    const id = req.params.id as string;
    await documentService.deleteDocument(id, req.user.id);
    res.status(200).json({ success: true, message: "Document deleted successfully" });
});

export const reindexDocument = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new ApiError(401, "Unauthorized");
    const id = req.params.id as string;
    const document = await documentService.getDocumentById(id, req.user.id);

    processDocumentBackground(document.id, document.filePath, document.collectionId, document.mimeType, true).catch(err => {
        console.error("Background job failed for reindex:", err);
    });

    res.status(200).json({ success: true, message: "Document re-indexing started in background" });
});
