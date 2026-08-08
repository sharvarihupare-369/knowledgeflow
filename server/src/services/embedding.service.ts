import ollama from 'ollama';

/**
 * Generates an embedding vector for the given text.
 * @param text The input text to embed
 * @returns An array of numbers representing the embedding vector
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    // You can change the model to whatever embedding model you have pulled in Ollama
    // e.g. 'nomic-embed-text' or 'mxbai-embed-large'
    const response = await ollama.embeddings({
      model: 'nomic-embed-text',
      prompt: text,
    });

    return response.embedding;
  } catch (error) {
    console.error('Failed to generate embedding:', error);
    throw error;
  }
};
