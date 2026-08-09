import type { PdfPage } from './pdf-parser.service.js';

export interface ChunkResult {
  content: string;
  page: number;
}

export const splitIntoChunks = (pages: PdfPage[], chunkSize = 1000, overlap = 200): ChunkResult[] => {
  console.log(`[AI LOG] Starting chunking process for ${pages.length} pages. Settings: chunkSize=${chunkSize}, overlap=${overlap}`);
  if (overlap >= chunkSize) {
    throw new Error('Overlap must be smaller than chunk size.');
  }
  const chunks: ChunkResult[] = [];

  for (const page of pages) {
    let start = 0;
    const text = page.text;

    while (start < text.length) {
      const end = start + chunkSize;
      const chunkText = text.slice(start, end).trim();
      if (chunkText) {
        chunks.push({
          content: chunkText,
          page: page.page,
        });
      }
      start += chunkSize - overlap;
    }
  }

  console.log(`[AI LOG] Completed chunking. Generated ${chunks.length} chunks.`);
  return chunks;
};
