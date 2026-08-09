import { qdrantClient as client } from '../config/qdrant.js';

export interface QdrantPoint {
  id: string;
  vector: number[];
  payload?: Record<string, unknown>;
}

/**
 * Saves a list of vectors (points) into a specified Qdrant collection
 * @param collectionName The name of the collection to insert into
 * @param points The points to insert (id, vector, payload)
 */
export const saveIntoQdrant = async (collectionName: string, points: QdrantPoint[]) => {
  console.log(`[AI LOG] Storing ${points.length} vectors into Qdrant collection '${collectionName}'`);
  try {
    await client.upsert(collectionName, {
      wait: true,
      points: points,
    });

    console.log(`Successfully saved ${points.length} points to Qdrant collection: ${collectionName}`);
  } catch (error) {
    console.error('Failed to save vectors to Qdrant:', error);
    throw error;
  }
};

/**
 * Helper to ensure a collection exists before saving points.
 * @param collectionName The name of the collection
 * @param vectorSize The dimension size of the vectors (e.g. 768 for nomic-embed-text)
 */
export const createCollectionIfNotExists = async (collectionName: string, vectorSize: number) => {
  try {
    const { collections } = await client.getCollections();
    const exists = collections.some((c) => c.name === collectionName);

    if (!exists) {
      await client.createCollection(collectionName, {
        vectors: {
          size: vectorSize,
          distance: 'Cosine', // Cosine distance is standard for most embeddings
        },
      });
      console.log(`Created Qdrant collection: ${collectionName}`);
    }
  } catch (error) {
    console.error('Failed to create Qdrant collection:', error);
    throw error;
  }
};

/**
 * Searches for similar vectors in Qdrant, filtered by collectionId
 */
export const searchVectors = async ({ vector, collectionId, limit = 5 }: { vector: number[]; collectionId: string; limit?: number }) => {
  console.log(`[AI LOG] Searching for answer by comparing vectors in Qdrant (collectionId: ${collectionId}, limit: ${limit})`);
  try {
    const searchResult = await client.search('documents', {
      vector: vector,
      limit: limit,
      filter: {
        must: [
          {
            key: 'collectionId',
            match: {
              value: collectionId,
            },
          },
        ],
      },
    });

    return searchResult;
  } catch (error: any) {
    if (error.status === 404 || (error.message && error.message.includes('Not found'))) {
      console.warn(`Qdrant collection "documents" not found during search. Returning empty results.`);
      return [];
    }
    console.error('Failed to search vectors in Qdrant:', error);
    throw error;
  }
};

/**
 * Deletes all vectors associated with a specific documentId
 */
export const deleteVectorsByDocumentId = async (collectionName: string, documentId: string) => {
  try {
    await client.delete(collectionName, {
      wait: true,
      filter: {
        must: [
          {
            key: 'documentId',
            match: {
              value: documentId,
            },
          },
        ],
      },
    });
    console.log(`Successfully deleted vectors for document: ${documentId}`);
  } catch (error: any) {
    if (error.status === 404 || (error.message && error.message.includes('Not found'))) {
      console.warn(`Qdrant collection "documents" not found during delete. Ignoring.`);
      return;
    }
    console.error('Failed to delete vectors from Qdrant:', error);
    throw error;
  }
};

/**
 * Deletes all vectors associated with a specific collectionId
 */
export const deleteVectorsByCollectionId = async (collectionName: string, collectionId: string) => {
  try {
    await client.delete(collectionName, {
      wait: true,
      filter: {
        must: [
          {
            key: 'collectionId',
            match: {
              value: collectionId,
            },
          },
        ],
      },
    });
    console.log(`Successfully deleted vectors for collection: ${collectionId}`);
  } catch (error: any) {
    if (error.status === 404 || (error.message && error.message.includes('Not found'))) {
      console.warn(`Qdrant collection "documents" not found during delete. Ignoring.`);
      return;
    }
    console.error('Failed to delete vectors for collectionId from Qdrant:', error);
    throw error;
  }
};
