import 'dotenv/config';
import OpenAI from "openai";

async function testGemini(modelName) {
    console.log(`Testing ${modelName}...`);
    const AI = new OpenAI({
        apiKey: process.env.GEMINI_API_KEY,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
    });

    try {
        const response = await AI.chat.completions.create({
            model: modelName,
            messages: [
                {
                    role: "user",
                    content: "Test prompt: write a 50 word article about AI.",
                },
            ],
            temperature: 0.7,
            max_tokens: 100,
        });
        console.log(`Success! Content for ${modelName}:`, response.choices[0].message.content.substring(0, 50));
    } catch (e) {
        console.log("Error status:", e?.status);
        console.log("Error message:", e?.message);
    }
}

async function run() {
    await testGemini("gemini-2.0-flash");
    await testGemini("gemini-1.5-flash");
    await testGemini("gemini-1.5-pro");
}

run();
