import ollama from 'ollama';

/**
 * Generates an answer using the provided context and question via Ollama.
 * @param context The chunks retrieved from semantic search
 * @param question The user's question
 * @returns The generated answer string
 */
export const generateAnswerStream = async (context: string[], question: string, conversationHistory?: { role: string, content: string }[]) => {
    try {
        const joinedContext = context.join('\n\n');

        let historyPrompt = "";
        if (conversationHistory && conversationHistory.length > 0) {
            historyPrompt = "Conversation History\n\n";
            for (const msg of conversationHistory) {
                historyPrompt += `${msg.role}:\n${msg.content}\n\n`;
            }
            historyPrompt += "--------------------\n\n";
        }

        const prompt = `You are an AI assistant for KnowledgeFlow AI.

Answer ONLY using the provided context.

If the answer is not available,
reply exactly:

"I couldn't find that information in the uploaded documents."

--------------------
${historyPrompt}Context:

${joinedContext}

--------------------

Question:

${question}`;

        const response = await ollama.generate({
            model: 'qwen3:4b',
            prompt: prompt,
            stream: true
        });

        return response;
    } catch (error) {
        console.error("Failed to generate answer from Ollama:", error);
        throw error;
    }
};

/**
 * Generates a short title for a conversation based on the first question.
 * @param question The user's question
 * @returns The generated title string
 */
export const generateTitle = async (question: string): Promise<string> => {
    try {
        const prompt = `Generate a short, concise title (max 5 words) for the following question. Do not include quotes, extra text, or punctuation in your response. Just the title.

Question:
${question}`;

        const response = await ollama.generate({
            model: 'qwen3:4b',
            prompt: prompt,
            stream: false
        });

        return response.response.trim();
    } catch (error) {
        console.error("Failed to generate title from Ollama:", error);
        return question.substring(0, 50);
    }
};
