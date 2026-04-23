import 'dotenv/config';
import axios from 'axios';
import OpenAI from "openai";

async function testGemini() {
    console.log("Testing API...");
    const AI = new OpenAI({
        apiKey: process.env.GEMINI_API_KEY,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
    });

    try {
        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [
                {
                    role: "user",
                    content: "Test prompt: write a 50 word article about AI.",
                },
            ],
            temperature: 0.7,
            max_tokens: 100,
        });
        console.log(response.choices[0].message.content);
    } catch (e) {
        console.log("Error status:", e?.status);
        console.log("Error message:", e?.message);
        console.dir(e);
    }
}

testGemini();
