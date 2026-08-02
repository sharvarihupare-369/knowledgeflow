import fs from 'fs/promises';
import { PDFParse } from 'pdf-parse';

export interface PdfPage {
    page: number;
    text: string;
}

export async function extractText(filePath: string): Promise<PdfPage[]> {
    try {
        const dataBuffer = await fs.readFile(filePath);
        const render_page = function(pageData: any) {
            let render_options = {
                normalizeWhitespace: false,
                disableCombineTextItems: false
            }
            return pageData.getTextContent(render_options)
            .then(function(textContent: any) {
                let lastY, text = '';
                for (let item of textContent.items) {
                    if (lastY == item.transform[5] || !lastY){
                        text += item.str;
                    }  
                    else{
                        text += '\n' + item.str;
                    }    
                    lastY = item.transform[5];
                }
                return text + '\n---PAGE_BREAK---\n';
            });
        }

        const parser = new PDFParse({ data: dataBuffer, pagerender: render_page } as any);
        const data = await parser.getText();
        await parser.destroy();
        
        const rawText = data.text;
        const pageStrings = rawText.split('---PAGE_BREAK---');
        const pages: PdfPage[] = [];
        
        for (let i = 0; i < pageStrings.length; i++) {
            const trimmed = pageStrings[i]?.trim();
            if (trimmed) {
                pages.push({ page: i + 1, text: trimmed });
            }
        }
        
        return pages;
    } catch (error) {
        console.error("Error extracting text from PDF:", error);
        throw new Error("Failed to extract text from PDF");
    }
}
