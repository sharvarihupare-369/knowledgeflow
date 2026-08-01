import type { createCollectionPayload, EditCollectionPayload } from '../../types/collections.js';
import * as collectionRepository from './collection.repository.js'

export const createCollection = async (userId: string, payload: createCollectionPayload) => {
    const data = await collectionRepository.createCollection(userId, payload)
    return data;
}

export const getCollections = async (userId: string) => {
    return await collectionRepository.getCollections(userId)
}

export const editCollection = async (userId: string, id: string, payload: EditCollectionPayload) => {
    return await collectionRepository.editCollection(userId, id, payload)
}


export const deleteCollection = async (userId: string, id: string) => {
    return await collectionRepository.deleteCollection(userId, id)
}
