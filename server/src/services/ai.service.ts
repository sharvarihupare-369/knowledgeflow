import ollama from 'ollama';
import OpenAI from 'openai';

let openaiInstance: OpenAI | null = null;
const getOpenAI = () => {
  if (!openaiInstance) {
    openaiInstance = new OpenAI({
      apiKey: process.env.NVDIA_API_KEY || 'dummy_to_prevent_crash',
      baseURL: process.env.NVDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1',
      timeout: 15000,
    });
  }
  return openaiInstance;
};

/**
 * Generates an answer using the provided context and question.
 * @param context The chunks retrieved from semantic search
 * @param question The user's question
 * @returns The generated answer string stream
 */
export const generateAnswerStream = async (context: string[], question: string, conversationHistory?: { role: string; content: string }[]) => {
  const joinedContext = context.join('\n\n');

  let historyPrompt = '';
  if (conversationHistory && conversationHistory.length > 0) {
    historyPrompt = 'Conversation History\n\n';
    for (const msg of conversationHistory) {
      historyPrompt += `${msg.role}:\n${msg.content}\n\n`;
    }
    historyPrompt += '--------------------\n\n';
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

  try {
    if (!process.env.NVDIA_API_KEY) throw new Error('NVDIA_API_KEY not configured');

    const completion = await getOpenAI().chat.completions.create({
      model: 'meta/llama-3.1-8b-instruct',
      messages: [{ role: 'user', content: prompt }],
      temperature: 1,
      top_p: 1,
      max_tokens: 16384,
      stream: true,
    });
    console.log(completion, 'completetion');

    async function* openaiStreamAdapter() {
      for await (const chunk of completion) {
        const text = chunk.choices[0]?.delta?.content || '';
        if (text) {
          yield { response: text };
        }
      }
    }
    return openaiStreamAdapter();
  } catch (error) {
    console.warn('Failed to generate answer from NVIDIA API, falling back to Ollama:', error);

    try {
      const response = await ollama.generate({
        model: 'qwen3:4b',
        prompt: prompt,
        stream: true,
      });
      return response;
    } catch (ollamaError) {
      console.error('Failed to generate answer from Ollama:', ollamaError);
      throw ollamaError;
    }
  }
};

/**
 * Generates a short title for a conversation based on the first question.
 * @param question The user's question
 * @returns The generated title string
 */
export const generateTitle = async (question: string): Promise<string> => {
  const prompt = `Generate a short, concise title (max 5 words) for the following question. Do not include quotes, extra text, or punctuation in your response. Just the title.

Question:
${question}`;

  try {
    if (!process.env.NVDIA_API_KEY) throw new Error('NVDIA_API_KEY not configured');

    const completion = await getOpenAI().chat.completions.create({
      model: 'meta/llama-3.1-8b-instruct',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 20,
      stream: false,
    });

    return completion.choices[0]?.message?.content?.trim() || question.substring(0, 50);
  } catch (error) {
    console.warn('Failed to generate title from NVIDIA API, falling back to Ollama:', error);

    try {
      const response = await ollama.generate({
        model: 'qwen3:4b',
        prompt: prompt,
        stream: false,
      });
      return response.response.trim();
    } catch (ollamaError) {
      console.error('Failed to generate title from Ollama:', ollamaError);
      return question.substring(0, 50);
    }
  }
};

/**
 * Generates a summary stream for the provided text.
 * @param text The document text to summarize
 * @returns The generated summary stream
 */
export const generateSummaryStream = async (text: string) => {
  const prompt = `You are a helpful AI assistant. Please provide a clear, comprehensive, and well-structured summary of the following document text. Highlight the main points and key takeaways.

Document Text:
--------------------
${text}
--------------------
`;

  try {
    if (!process.env.NVDIA_API_KEY) throw new Error('NVDIA_API_KEY not configured');

    const completion = await getOpenAI().chat.completions.create({
      model: 'meta/llama-3.1-8b-instruct',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      top_p: 1,
      max_tokens: 4096,
      stream: true,
    });

    async function* openaiStreamAdapter() {
      for await (const chunk of completion) {
        const textChunk = chunk.choices[0]?.delta?.content || '';
        if (textChunk) {
          yield { response: textChunk };
        }
      }
    }
    return openaiStreamAdapter();
  } catch (error) {
    console.warn('Failed to generate summary from NVIDIA API, falling back to Ollama:', error);

    try {
      const response = await ollama.generate({
        model: 'qwen3:4b',
        prompt: prompt,
        stream: true,
      });
      return response;
    } catch (ollamaError) {
      console.error('Failed to generate summary from Ollama:', ollamaError);
      throw ollamaError;
    }
  }
};

/**
 * Generates a translation stream for the provided text.
 * @param text The document text to translate
 * @param targetLanguage The language to translate to
 * @returns The generated translation stream
 */
export const generateTranslationStream = async (text: string, targetLanguage: string) => {
  const prompt = `You are a professional translator. Please translate the following text into ${targetLanguage}. Provide ONLY the translated text, without any additional explanations or comments.

Text to translate:
--------------------
${text}
--------------------
`;

  try {
    if (!process.env.NVDIA_API_KEY) throw new Error('NVDIA_API_KEY not configured');

    const completion = await getOpenAI().chat.completions.create({
      model: 'meta/llama-3.1-8b-instruct',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      top_p: 1,
      max_tokens: 8192,
      stream: true,
    });

    async function* openaiStreamAdapter() {
      for await (const chunk of completion) {
        const textChunk = chunk.choices[0]?.delta?.content || '';
        if (textChunk) {
          yield { response: textChunk };
        }
      }
    }
    return openaiStreamAdapter();
  } catch (error) {
    console.warn('Failed to generate translation from NVIDIA API, falling back to Ollama:', error);

    try {
      const response = await ollama.generate({
        model: 'qwen3:4b',
        prompt: prompt,
        stream: true,
      });
      return response;
    } catch (ollamaError) {
      console.error('Failed to generate translation from Ollama:', ollamaError);
      throw ollamaError;
    }
  }
};
