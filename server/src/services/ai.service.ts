import ollama from 'ollama';

/**
 * Generates an answer using the provided context and question via Ollama.
 * @param context The chunks retrieved from semantic search
 * @param question The user's question
 * @returns The generated answer string
 */
export const generateAnswer = async (context: string[], question: string): Promise<string> => {
    try {
        const joinedContext = context.join('\n\n');
        
        const prompt = `You are an AI assistant for KnowledgeFlow AI.

Answer ONLY using the provided context.

If the answer is not available,
reply exactly:

"I couldn't find that information in the uploaded documents."

--------------------
Context:

${joinedContext}

--------------------

Question:

${question}`;

        const response = await ollama.generate({
            model: 'qwen3:4b',
            prompt: prompt,
            stream: false
        });

        return response.response;
    } catch (error) {
        console.error("Failed to generate answer from Ollama:", error);
        throw error;
    }
};
