import type { Request, Response } from "express";
import fs from 'fs/promises';
import { ApiError } from "../../validations/api-error.js";
import * as documentService from './document.service.js'

export const uploadDocument = async (req: Request, res: Response) => {
    try {
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

        const documentData = {
            title: title || req.file.originalname,
            originalName: req.file.originalname,
            filePath: req.file.path,
            mimeType: req.file.mimetype,
            fileSize: req.file.size,
            collectionId: collectionId,
            uploadedBy: req.user.id
        };

        const result = await documentService.uploadDocument(documentData);
        res.status(201).json({
            success: true,
            message: "Document Uploaded Successfully",
            data: result
        })
    } catch (error) {
        // Clean up the uploaded file if an error occurs and it was saved
        if (req.file && req.file.path) {
            fs.unlink(req.file.path).catch(err => console.error("Failed to delete temp file:", err));
        }

        console.error(error);
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message
            })
            return
        }
        res.status(500).json({ success: false, message: "Error while uploading document." })
    }
}

export const getAllDocuments = async (req: Request, res: Response) => {
    try {
        if (!req.user) throw new ApiError(401, "Unauthorized");
        const documents = await documentService.getAllDocuments(req.user.id);
        res.status(200).json({ success: true, data: documents });
    } catch (error) {
        console.error(error);
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: "Error fetching documents" });
    }
};

export const getDocumentById = async (req: Request, res: Response) => {
    try {
        if (!req.user) throw new ApiError(401, "Unauthorized");
        const { id } = req.params;
        const document = await documentService.getDocumentById(id, req.user.id);
        res.status(200).json({ success: true, data: document });
    } catch (error) {
        console.error(error);
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: "Error fetching document" });
    }
};

export const deleteDocument = async (req: Request, res: Response) => {
    try {
        if (!req.user) throw new ApiError(401, "Unauthorized");
        const { id } = req.params;
        await documentService.deleteDocument(id, req.user.id);
        res.status(200).json({ success: true, message: "Document deleted successfully" });
    } catch (error) {
        console.error(error);
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: "Error deleting document" });
    }
};
