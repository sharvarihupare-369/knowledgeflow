import { generateEmbedding } from "../../services/embedding.service.js";
import { searchVectors } from "../../services/qdrant.service.js";
import { generateAnswerStream, generateTitle } from "../../services/ai.service.js";
import { prisma } from "../../config/prisma.js";
import * as chatRepository from "./chat.repository.js";
import { MessageRole } from "@prisma/client";
import { ApiError } from "../../validations/api-error.js";

export const createConversation = async (userId: string, collectionId: string, title: string) => {
    return await chatRepository.createConversation(userId, collectionId, title);
}

export const getConversations = async (userId: string, collectionId: string, page: number = 1, limit: number = 20) => {
    const skip = (page - 1) * limit;
    return await chatRepository.getConversationsByCollection(userId, collectionId, skip, limit);
}

export const getConversation = async (userId: string, conversationId: string) => {
    const conversation = await chatRepository.getConversationById(userId, conversationId);
    if (!conversation) throw new ApiError(404, "Conversation not found or does not belong to you");
    return conversation;
}

export const deleteConversation = async (userId: string, conversationId: string) => {
    return await chatRepository.deleteConversation(userId, conversationId);
}

export const semanticSearch = async ({ userId, collectionId, conversationId, question }: { userId: string, collectionId: string, conversationId?: string, question: string }) => {
    let activeConversationId: string;
    let conversationHistory: { role: string, content: string }[] = [];

    if (conversationId) {
        const conversation = await chatRepository.getConversationById(userId, conversationId);
        if (!conversation) {
            throw new ApiError(404, "Conversation not found or does not belong to you");
        }
        if (conversation.collectionId !== collectionId) {
            throw new ApiError(400, "Conversation does not belong to the specified collection");
        }
        activeConversationId = conversationId;

        const lastMessages = conversation.messages.slice(-10);
        conversationHistory = lastMessages.map(msg => ({
            role: msg.role === 'USER' ? 'USER' : 'ASSISTANT',
            content: msg.content
        }));
    } else {
        const title = await generateTitle(question);
        const newConversation = await createConversation(userId, collectionId, title);
        activeConversationId = newConversation.id;
    }

    // 1. Save USER message
    await chatRepository.addMessage(activeConversationId, MessageRole.USER, question);

    const vector = await generateEmbedding(question);

    // 1. Vector Search & 2. Keyword Search (PostgreSQL full-text)
    const cleanedQuestion = question.replace(/[^\w\s]/g, '');
    const keywordQuery = cleanedQuestion.split(/\s+/).filter(w => w.length > 2).join(' | ');
    
    const [searchResult, keywordChunks] = await Promise.all([
        searchVectors({
            vector,
            collectionId,
            limit: 5
        }),
        keywordQuery ? prisma.chunk.findMany({
            where: {
                document: { collectionId },
                content: { search: keywordQuery }
            },
            take: 5
        }).catch(err => {
            console.error("Keyword search failed:", err);
            return [];
        }) : Promise.resolve([])
    ]);

    // 3. Merge results
    const combinedChunksMap = new Map();

    searchResult.forEach(result => {
        const chunkId = result.payload?.chunkId as string | undefined;
        if (chunkId) {
            combinedChunksMap.set(chunkId, {
                content: result.payload?.content as string,
                documentId: result.payload?.documentId as string,
                page: result.payload?.page as number | undefined,
                chunkIndex: result.payload?.chunkIndex as number | undefined,
                score: result.score
            });
        }
    });

    keywordChunks.forEach(chunk => {
        if (!combinedChunksMap.has(chunk.id)) {
            combinedChunksMap.set(chunk.id, {
                content: chunk.content,
                documentId: chunk.documentId,
                page: chunk.page,
                chunkIndex: chunk.chunkIndex,
                score: 0.8 // Arbitrary score to ensure exact keyword matches are considered good
            });
        }
    });

    const finalResults = Array.from(combinedChunksMap.values()).sort((a, b) => b.score - a.score).slice(0, 8);

    if (finalResults.length === 0) {
        const answer = "I couldn't find relevant information in the uploaded documents.";
        await chatRepository.addMessage(activeConversationId, MessageRole.ASSISTANT, answer);
        
        async function* mockStream() {
            yield { response: answer };
        }

        return {
            stream: mockStream(),
            sources: [],
            conversationId: activeConversationId,
            saveMessage: async () => {}
        };
    }

    const chunks = finalResults.map(result => result.content).filter((c): c is string => !!c);
    
    // Call the AI Service to generate the answer stream using the chunks
    const stream = await generateAnswerStream(chunks, question, conversationHistory);

    // Fetch document names for the sources
    const documentIds = [...new Set(finalResults.map(result => result.documentId).filter((id): id is string => !!id))];
    const documents = await prisma.document.findMany({
        where: { id: { in: documentIds } },
        select: { id: true, originalName: true }
    });
    
    const docMap = new Map(documents.map(d => [d.id, d.originalName]));

    // Build unique sources grouping by documentId + page
    const uniqueSourcesMap = new Map();
    finalResults.forEach(result => {
        const docId = result.documentId as string | undefined;
        const page = result.page as number | undefined;
        const chunkIndex = result.chunkIndex as number | undefined;

        if (docId) {
            const key = `${docId}_${page || 'all'}`;
            if (!uniqueSourcesMap.has(key) || uniqueSourcesMap.get(key).score < result.score) {
                uniqueSourcesMap.set(key, {
                    documentName: docMap.get(docId) || "Unknown Document",
                    page,
                    chunkIndex,
                    score: result.score
                });
            }
        }
    });

    const sources = Array.from(uniqueSourcesMap.values());

    return { 
        stream, 
        sources, 
        conversationId: activeConversationId,
        saveMessage: async (fullAnswer: string) => {
            await chatRepository.addMessage(activeConversationId, MessageRole.ASSISTANT, fullAnswer);
        }
    };
}
