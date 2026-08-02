import { extractText } from '../../services/pdf-parser.service.js';
import { splitIntoChunks } from "../../services/chunk.service.js";
import { generateEmbedding } from "../../services/embedding.service.js";
import { saveIntoQdrant, createCollectionIfNotExists, deleteVectorsByDocumentId } from "../../services/qdrant.service.js";
import * as documentService from './document.service.js';
import { prisma } from "../../config/prisma.js";

export const processDocumentBackground = async (
    documentId: string, 
    filePath: string, 
    collectionId: string, 
    mimeType: string, 
    isReindex: boolean = false
) => {
    try {
        if (isReindex) {
            try {
                await deleteVectorsByDocumentId("documents", documentId);
            } catch (e) {
                console.error("Failed to delete Qdrant vectors during re-index", e);
            }
            await prisma.chunk.deleteMany({ where: { documentId } });
            await documentService.updateDocumentStatus(documentId, 'PROCESSING');
        }

        let chunks: { content: string, page: number }[] = [];
        if (mimeType === 'application/pdf') {
            const extractedPages = await extractText(filePath);
            chunks = splitIntoChunks(extractedPages);
            console.log(`Split document into ${chunks.length} chunks`);
        }

        if (chunks.length > 0) {
            await prisma.chunk.createMany({
                data: chunks.map((chunk, index) => ({
                    documentId,
                    chunkIndex: index,
                    content: chunk.content,
                    page: chunk.page
                }))
            });

            const insertedChunks = await prisma.chunk.findMany({
                where: { documentId },
                orderBy: { chunkIndex: 'asc' }
            });

            await createCollectionIfNotExists("documents", 768);
            
            const batchSize = 10;
            for (let i = 0; i < insertedChunks.length; i += batchSize) {
                const batch = insertedChunks.slice(i, i + batchSize);
                
                const batchPromises = batch.map(async (chunk) => {
                    const vector = await generateEmbedding(chunk.content);
                    return {
                        id: chunk.id,
                        vector,
                        payload: {
                            documentId: documentId,
                            chunkId: chunk.id,
                            collectionId: collectionId,
                            chunkIndex: chunk.chunkIndex,
                            page: chunk.page,
                            content: chunk.content, 
                        }
                    };
                });
                
                const batchPoints = await Promise.all(batchPromises);
                await saveIntoQdrant("documents", batchPoints);
            }
        }
        
        await documentService.updateDocumentStatus(documentId, 'READY');
    } catch (error) {
        console.error("Error processing document in background:", error);
        await documentService.updateDocumentStatus(documentId, 'FAILED');
    }
};
