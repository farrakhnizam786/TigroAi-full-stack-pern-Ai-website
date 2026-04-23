import 'dotenv/config';
import OpenAI from "openai";

async function testGemini() {
    console.log("Testing 1.5-flash...");
    const AI = new OpenAI({
        apiKey: process.env.GEMINI_API_KEY,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
    });

    try {
        const response = await AI.chat.completions.create({
            model: "gemini-1.5-flash",
            messages: [
                {
                    role: "user",
                    content: "Test prompt",
                },
            ],
            temperature: 0.7,
            max_tokens: 100,
        });
        console.log("Success! Content:", response.choices[0].message.content);
    } catch (e) {
        console.log("Error status:", e?.status);
        console.log("Error message:", e?.message);
    }
}

testGemini();
