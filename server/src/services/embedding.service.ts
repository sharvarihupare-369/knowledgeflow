import ollama from 'ollama';
import { getOpenAI } from './ai.service.js';

/**
 * Generates an embedding vector for the given text.
 * @param text The input text to embed
 * @returns An array of numbers representing the embedding vector
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    // Try Nvidia first
    const openai = getOpenAI();
    // Only attempt if an API key was actually configured
    if (process.env.NVDIA_API_KEY) {
      const response = await openai.embeddings.create({
        model: 'nvidia/nv-embedqa-e5-v5',
        input: text,
      });
      const embedding = response.data[0]?.embedding;
      if (!embedding) {
        throw new Error('No embedding returned from Nvidia API');
      }
      return embedding;
    }
  } catch (error) {
    console.warn('Nvidia embedding failed or skipped, falling back to Ollama...', error);
  }

  try {
    // Fallback to local Ollama
    const response = await ollama.embeddings({
      model: 'nomic-embed-text',
      prompt: text,
    });

    return response.embedding;
  } catch (error) {
    console.error('Failed to generate embedding with both Nvidia and Ollama:', error);
    throw error;
  }
};
