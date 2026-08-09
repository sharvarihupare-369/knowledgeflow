import ollama from 'ollama';
import { getOpenAI } from './ai.service.js';

/**
 * Generates an embedding vector for the given text.
 * @param text The input text to embed
 * @returns An array of numbers representing the embedding vector
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  console.log(`[AI LOG] Starting embedding generation for text (length: ${text.length})`);
  try {
    // Try Nvidia first
      const response = await fetch(`${process.env.NVDIA_BASE_URL}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NVDIA_API_KEY}`
        },
        body: JSON.stringify({
          model: 'nvidia/nv-embedqa-e5-v5',
          input: [text],
          input_type: 'passage',
          encoding_format: 'float',
          truncate: 'NONE'
        })
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Nvidia API error: ${response.status} ${errText}`);
      }
      const data = await response.json();
      const embedding = data.data[0]?.embedding;
      if (!embedding) {
        throw new Error('No embedding returned from Nvidia API');
      }
      console.log(`[AI LOG] Successfully generated embedding using Nvidia API (vector size: ${embedding.length})`);
      return embedding;
  } catch (error) {
    console.warn('Nvidia embedding failed or skipped, falling back to Ollama...', error);
  }

  try {
    // Fallback to local Ollama
    const response = await ollama.embeddings({
      model: 'nomic-embed-text',
      prompt: text,
    });

    console.log(`[AI LOG] Successfully generated embedding using Ollama fallback (vector size: ${response.embedding.length})`);
    return response.embedding;
  } catch (error) {
    console.error('Failed to generate embedding with both Nvidia and Ollama:', error);
    throw error;
  }
};
