import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

async function testGemini() {
    console.log("Testing Native Gemini SDK...");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        const result = await model.generateContent("Test prompt: write a 50 word article about AI.");
        console.log("Success! Content:", result.response.text());
    } catch (e) {
        console.log("Error status:", e?.status);
        console.log("Error message:", e?.message);
        console.dir(e);
    }
}

testGemini();
