import { QdrantClient } from '@qdrant/js-client-rest';

import { env } from './env.js';

// Connect to the local Qdrant instance
export const qdrantClient = new QdrantClient({
  url: env.QDRANT_URL,
  ...(env.QDRANT_API_KEY ? { apiKey: env.QDRANT_API_KEY } : {}),
});
