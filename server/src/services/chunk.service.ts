export const splitIntoChunks = (
    text: string,
    chunkSize = 1000,
    overlap = 200
): string[] => {
    if (overlap >= chunkSize) {
        throw new Error("Overlap must be smaller than chunk size.");
    }
    const chunks: string[] = [];
    let start = 0;
    while (start < text.length) {
        const end = start + chunkSize;
        const chunk = text.slice(start, end).trim();
        if (chunk) {
            chunks.push(chunk);
        }
        start += chunkSize - overlap;
    }
    return chunks;
};