import { generateEmbedding } from "./src/services/embedding.service.js";
import { generateTitle } from "./src/services/ai.service.js";

async function run() {
    try {
        console.log("Testing generateTitle...");
        const title = await generateTitle("What is our remote work policy?");
        console.log("Title generated:", title);

        console.log("Testing generateEmbedding...");
        const vector = await generateEmbedding("What is our remote work policy?");
        console.log("Vector generated length:", vector.length);
    } catch (err: any) {
        console.error("Caught error:", err.message);
    }
}
run();
