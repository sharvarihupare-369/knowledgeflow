import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import fs from 'fs/promises';
import { ApiError } from "../../validations/api-error.js";
import * as documentService from './document.service.js';
import { extractText } from '../../services/pdf-parser.service.js';
import { splitIntoChunks } from "../../services/chunk.service.js";
import { generateEmbedding } from "../../services/embedding.service.js";
import { saveIntoQdrant, createCollectionIfNotExists, type QdrantPoint } from "../../services/qdrant.service.js";

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

    let chunks: string[] = [];
    if (req.file.mimetype === 'application/pdf') {
        const extractedText = await extractText(documentData.filePath);
        chunks = splitIntoChunks(extractedText);
        console.log(`Split document into ${chunks.length} chunks`);
    }

    const result = await documentService.uploadDocument(documentData, chunks);

    if (result.chunks && result.chunks.length > 0) {
        try {
            await createCollectionIfNotExists("documents", 768);
            
            const batchSize = 10;
            for (let i = 0; i < result.chunks.length; i += batchSize) {
                const batch = result.chunks.slice(i, i + batchSize);
                
                const batchPromises = batch.map(async (chunk) => {
                    const vector = await generateEmbedding(chunk.content);
                    return {
                        id: chunk.id,
                        vector,
                        payload: {
                            documentId: result.id,
                            chunkId: chunk.id,
                            collectionId: result.collectionId,
                            chunkIndex: chunk.chunkIndex,
                            content: chunk.content, 
                        }
                    };
                });
                
                const batchPoints = await Promise.all(batchPromises);
                await saveIntoQdrant("documents", batchPoints);
            }
            await documentService.updateDocumentStatus(result.id, 'READY');
        } catch (embedError) {
            console.error("Error generating embeddings or saving to Qdrant:", embedError);
            await documentService.updateDocumentStatus(result.id, 'FAILED');
            throw new ApiError(500, "Document uploaded but failed to process embeddings");
        }
    }

        res.status(201).json({
            success: true,
            message: "Document Uploaded Successfully",
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
