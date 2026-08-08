import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../validations/api-error.js';
import { DocumentStatus, Prisma } from '@prisma/client';

export const uploadDocument = async (
  documentData: {
    title: string;
    originalName: string;
    filePath: string;
    mimeType: string;
    fileSize: number;
    collectionId: string;
    uploadedBy: string;
  },
  chunks: { content: string; page: number }[] = [],
) => {
  const existingDocument = await prisma.document.findFirst({
    where: {
      collectionId: documentData.collectionId,
      originalName: documentData.originalName,
    },
  });

  if (existingDocument) {
    throw new ApiError(409, 'Document with this name already exists in the collection.');
  }

  const document = await prisma.document.create({
    data: {
      ...documentData,
      ...(chunks.length > 0
        ? {
            chunks: {
              create: chunks.map((chunk, index) => ({
                chunkIndex: index,
                content: chunk.content,
                page: chunk.page,
              })),
            },
          }
        : {}),
    },
    include: {
      chunks: true,
    },
  });
  return document;
};

export const updateDocumentStatus = async (documentId: string, status: DocumentStatus) => {
  return prisma.document.update({
    where: { id: documentId },
    data: { status },
  });
};

export const getAllDocuments = async (userId: string, collectionId?: string) => {
  const membership = await prisma.userOrganisationMembership.findFirst({
    where: { userId },
  });
  if (!membership) throw new ApiError(404, 'User not associated with any organisation');

  const where: Prisma.DocumentWhereInput = {
    collection: {
      organisationId: membership.orgId,
      ...(membership.role !== 'ADMIN' && {
        usersWithAccess: { some: { id: userId } },
      }),
    },
  };
  if (collectionId) {
    where.collectionId = collectionId;
  }
  return await prisma.document.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
};

export const getDocumentById = async (id: string, userId: string) => {
  const membership = await prisma.userOrganisationMembership.findFirst({
    where: { userId },
  });
  if (!membership) throw new ApiError(404, 'User not associated with any organisation');

  const document = await prisma.document.findFirst({
    where: {
      id,
      collection: {
        organisationId: membership.orgId,
        ...(membership.role !== 'ADMIN' && {
          usersWithAccess: { some: { id: userId } },
        }),
      },
    },
  });

  if (!document) {
    throw new ApiError(404, 'Document not found');
  }

  return document;
};

export const deleteDocument = async (id: string, userId: string) => {
  const membership = await prisma.userOrganisationMembership.findFirst({
    where: { userId },
  });
  if (!membership) throw new ApiError(404, 'User not associated with any organisation');

  // 1. Verify the document exists and belongs to the user (or user is ADMIN)
  const document = await prisma.document.findFirst({
    where: {
      id,
      ...(membership.role !== 'ADMIN' && { uploadedBy: userId }),
    },
  });

  if (!document) {
    throw new ApiError(404, "Document not found or you don't have permission to delete it");
  }

  // 2. Delete the record from the database
  await prisma.$transaction([
    prisma.chunk.deleteMany({
      where: { documentId: id },
    }),
    prisma.document.delete({
      where: { id },
    }),
  ]);

  return document;
};

export const getDocumentChunks = async (documentId: string, limit: number = 15) => {
  return await prisma.chunk.findMany({
    where: { documentId },
    orderBy: { chunkIndex: 'asc' },
    take: limit,
  });
};
