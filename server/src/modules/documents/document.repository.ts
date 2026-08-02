import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../validations/api-error.js";
import { DocumentStatus, Prisma } from "@prisma/client";

export const uploadDocument = async (documentData: {
    title: string;
    originalName: string;
    filePath: string;
    mimeType: string;
    fileSize: number;
    collectionId: string;
    uploadedBy: string;
}, chunks: string[] = []) => {
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
        data: {
            ...documentData,
            chunks: chunks.length > 0 ? {
                create: chunks.map((content, index) => ({
                    chunkIndex: index,
                    content
                }))
            } : undefined
        },
        include: {
            chunks: true
        }
    });
    return document;
}

export const updateDocumentStatus = async (documentId: string, status: DocumentStatus) => {
    return prisma.document.update({
        where: { id: documentId },
        data: { status }
    });
};

export const getAllDocuments = async (userId: string, collectionId?: string) => {
    const where: Prisma.DocumentWhereInput = { uploadedBy: userId };
    if (collectionId) {
        where.collectionId = collectionId;
    }
    return await prisma.document.findMany({
        where,
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
