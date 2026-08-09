import type { createCollectionPayload, EditCollectionPayload } from '../../types/collections.js';
import * as collectionRepository from './collection.repository.js';
import { deleteVectorsByCollectionId } from '../../services/qdrant.service.js';

export const createCollection = async (userId: string, payload: createCollectionPayload) => {
  const data = await collectionRepository.createCollection(userId, payload);
  return data;
};

export const getCollections = async (userId: string) => {
  return await collectionRepository.getCollections(userId);
};

export const editCollection = async (userId: string, id: string, payload: EditCollectionPayload) => {
  return await collectionRepository.editCollection(userId, id, payload);
};

export const deleteCollection = async (userId: string, id: string) => {
  const deleted = await collectionRepository.deleteCollection(userId, id);
  // Cleanup vectors in Qdrant async (fire and forget or await)
  await deleteVectorsByCollectionId('knowledgeflow_docs', id).catch(err => {
    console.error('Failed to cleanup qdrant vectors for collection', id, err);
  });
  return deleted;
};
