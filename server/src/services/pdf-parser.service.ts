import fs from 'fs/promises';
import { PDFParse } from 'pdf-parse';

export async function extractText(filePath: string): Promise<string> {
    try {
        const dataBuffer = await fs.readFile(filePath);
        const parser = new PDFParse({ data: dataBuffer });
        const data = await parser.getText();
        await parser.destroy();
        return data.text;
    } catch (error) {
        console.error("Error extracting text from PDF:", error);
        throw new Error("Failed to extract text from PDF");
    }
}