import fs from 'fs/promises';
import * as documentRepository from './document.repository.js';
import { deleteVectorsByDocumentId } from '../../services/qdrant.service.js';
import { DocumentStatus } from '@prisma/client';

import type { ChunkResult } from '../../services/chunk.service.js';

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
  chunks: ChunkResult[] = [],
) => {
  const data = await documentRepository.uploadDocument(documentData, chunks);
  return data;
};

export const getAllDocuments = async (userId: string, collectionId?: string) => {
  return await documentRepository.getAllDocuments(userId, collectionId);
};

export const deleteDocument = async (id: string, userId: string) => {
  // 1. Fetch to verify it exists and belongs to the user
  const document = await documentRepository.getDocumentById(id, userId);

  // 2. Delete Qdrant vectors
  try {
    await deleteVectorsByDocumentId('knowledgeflow_docs_v2', document.id);
  } catch (error) {
    console.error(`Failed to delete Qdrant vectors for ${document.id}`, error);
  }

  // 3. Delete chunks and document from PostgreSQL
  await documentRepository.deleteDocument(id, userId);

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

export const getDocumentChunks = async (id: string, limit?: number) => {
  return await documentRepository.getDocumentChunks(id, limit);
};
