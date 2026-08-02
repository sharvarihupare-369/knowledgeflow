import { generateEmbedding } from "../../services/embedding.service.js";
import { searchVectors } from "../../services/qdrant.service.js";
import { generateAnswer } from "../../services/ai.service.js";
import { prisma } from "../../config/prisma.js";

export const semanticSearch = async ({ collectionId, question }: { collectionId: string, question: string }) => {
    const vector = await generateEmbedding(question);

    const searchResult = await searchVectors({
        vector,
        collectionId,
        limit: 5
    });

    // Handle "No Results" based on a minimum similarity score
    const hasGoodResults = searchResult.some(result => result.score >= 0.7);

    if (!hasGoodResults || searchResult.length === 0) {
        return {
            answer: "I couldn't find relevant information in the uploaded documents.",
            sources: []
        };
    }

    const chunks = searchResult.map(result => result.payload?.content).filter((c): c is string => !!c);
    
    // Call the AI Service to generate the answer using the chunks
    const answer = await generateAnswer(chunks, question);

    // Fetch document names for the sources
    const documentIds = [...new Set(searchResult.map(result => result.payload?.documentId).filter((id): id is string => !!id))];
    const documents = await prisma.document.findMany({
        where: { id: { in: documentIds } },
        select: { id: true, originalName: true }
    });
    
    const docMap = new Map(documents.map(d => [d.id, d.originalName]));

    // Build unique sources keeping the highest score for each document
    const uniqueSourcesMap = new Map();
    searchResult.forEach(result => {
        const docId = result.payload?.documentId as string | undefined;
        if (docId) {
            if (!uniqueSourcesMap.has(docId) || uniqueSourcesMap.get(docId).score < result.score) {
                uniqueSourcesMap.set(docId, {
                    documentId: docId,
                    documentName: docMap.get(docId) || "Unknown Document",
                    score: result.score
                });
            }
        }
    });

    const sources = Array.from(uniqueSourcesMap.values());

    return { answer, sources };
}
