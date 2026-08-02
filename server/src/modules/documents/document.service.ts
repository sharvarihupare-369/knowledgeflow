import fs from 'fs/promises';
import * as documentRepository from './document.repository.js'
import { DocumentStatus } from "@prisma/client";

export const uploadDocument = async (documentData: {
    title: string;
    originalName: string;
    filePath: string;
    mimeType: string;
    fileSize: number;
    collectionId: string;
    uploadedBy: string;
}, chunks: string[] = []) => {
    const data = await documentRepository.uploadDocument(documentData, chunks)
    return data;
}

export const getAllDocuments = async (userId: string, collectionId?: string) => {
    return await documentRepository.getAllDocuments(userId, collectionId);
};

export const deleteDocument = async (id: string, userId: string) => {
    const document = await documentRepository.deleteDocument(id, userId);
    
    // Attempt to delete the physical file from the filesystem
    try {
        await fs.unlink(document.filePath);
    } catch (error) {
        console.error(`Failed to delete physical file: ${document.filePath}`, error);
        // We don't throw here to avoid failing the API request if the file is already missing
    }
    
    return document;
};
export const getDocumentById = async (id: string, userId: string) => {
    return await documentRepository.getDocumentById(id, userId);
};

export const updateDocumentStatus = async (id: string, status: DocumentStatus) => {
    return await documentRepository.updateDocumentStatus(id, status);
};