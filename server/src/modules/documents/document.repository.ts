import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../validations/api-error.js";

export const uploadDocument = async (documentData: {
    title: string;
    originalName: string;
    filePath: string;
    mimeType: string;
    fileSize: number;
    collectionId: string;
    uploadedBy: string;
}) => {
    const existingDocument = await prisma.document.findFirst({
        where: {
            collectionId: documentData.collectionId,
            originalName: documentData.originalName
        }
    });

    if (existingDocument) {
        throw new ApiError(409, "Document with this name already exists in the collection.");
    }

    const document = await prisma.document.create({
        data: documentData
    });
    return document;
}

export const getAllDocuments = async (userId: string) => {
    return await prisma.document.findMany({
        where: { uploadedBy: userId },
        orderBy: { createdAt: 'desc' }
    });
};

export const getDocumentById = async (id: string, userId: string) => {
    const document = await prisma.document.findFirst({
        where: { id, uploadedBy: userId }
    });
    
    if (!document) {
        throw new ApiError(404, "Document not found");
    }
    
    return document;
};

export const deleteDocument = async (id: string, userId: string) => {
    // 1. Verify the document exists and belongs to the user
    const document = await prisma.document.findFirst({
        where: { id, uploadedBy: userId }
    });
    
    if (!document) {
        throw new ApiError(404, "Document not found");
    }
    
    // 2. Delete the record from the database
    await prisma.document.delete({
        where: { id }
    });
    
    return document;
};
