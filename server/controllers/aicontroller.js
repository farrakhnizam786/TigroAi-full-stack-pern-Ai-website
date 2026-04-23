import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import { v2 as cloudinary } from 'cloudinary';
import axios from "axios";
import fs from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import { invalidateUserCache } from '../middlewares/auth.js';

// ✅ GROQ HELPER
const generateWithGroq = async (prompt) => {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 500  // ✅ reduced from 1024
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(`Groq error ${response.status}: ${JSON.stringify(data)}`);
    }

    return data.choices[0].message.content;
};

// ======================= GENERATE ARTICLE =======================
export const generateArticle = async (req, res) => {
    try {
        const userId = req.userId;
        const { prompt, length, publish } = req.body;
        const Plan = req.Plan;
        const free_usage = req.free_usage;

        if (!prompt) {
            return res.status(400).json({ success: false, message: "Prompt required" });
        }

        if (Plan !== 'Premium' && free_usage >= 10) {
            return res.status(402).json({
                success: false,
                message: 'Limit reached. Upgrade to Premium to continue.',
            });
        }

        const content = await generateWithGroq(prompt);

        if (!content) {
            return res.status(500).json({ success: false, message: "AI returned empty response" });
        }

        const plainContent = content.replace(/[#*_]/g, '');

        await sql`INSERT INTO creations (user_id, prompt, content, type, publish)
        VALUES (${userId}, ${prompt}, ${plainContent}, 'article', ${publish ?? false})`;

        if (Plan !== 'Premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: { free_usage: free_usage + 1 },
            });
            invalidateUserCache(userId);
        }

        res.json({ success: true, content: plainContent });

    } catch (error) {
        console.log("❌ ERROR:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// ======================= BLOG TITLE =======================
export const generateBlogTitle = async (req, res) => {
    try {
        const userId = req.userId;
        const { prompt, publish } = req.body;
        const Plan = req.Plan;
        const free_usage = req.free_usage;

        if (!prompt) {
            return res.status(400).json({ success: false, message: "Prompt required" });
        }

        if (Plan !== 'Premium' && free_usage >= 10) {
            return res.status(402).json({
                success: false,
                message: "Limit reached. Upgrade to Premium to continue."
            });
        }

        const content = await generateWithGroq(prompt);

        if (!content) {
            return res.status(500).json({ success: false, message: "AI returned empty response" });
        }

        await sql`INSERT INTO creations (user_id, prompt, content, type, publish)
        VALUES (${userId}, ${prompt}, ${content}, 'blog-title', ${publish ?? false})`;

        if (Plan !== 'Premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: { free_usage: free_usage + 1 }
            });
            invalidateUserCache(userId);
        }

        res.json({ success: true, content });

    } catch (error) {
        console.log("❌ ERROR:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// ======================= GENERATE IMAGE =======================
export const generateImage = async (req, res) => {
    try {
        const userId = req.userId;
        const { prompt, publish } = req.body;

        const formData = new FormData();
        formData.append('prompt', prompt);

        const { data } = await axios.post(
            'https://clipdrop-api.co/text-to-image/v1',
            formData,
            {
                headers: { 'x-api-key': process.env.CLIPDROP_API_KEY },
                responseType: "arraybuffer",
            }
        );

        const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`;
        const { secure_url } = await cloudinary.uploader.upload(base64Image);

        await sql`INSERT INTO creations (user_id, prompt, content, type, publish)
        VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})`;

        res.json({ success: true, content: secure_url });

    } catch (error) {
        console.log("❌ ERROR:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// ======================= REMOVE BACKGROUND =======================
export const removeImageBackground = async (req, res) => {
    try {
        const userId = req.userId;
        const image = req.file;

        const { secure_url } = await cloudinary.uploader.upload(image.path, {
            transformation: [{
                effect: 'background_removal',
                background_removal: 'remove_the_background'
            }]
        });

        await sql`INSERT INTO creations (user_id, prompt, content, type)
        VALUES (${userId}, 'Remove background', ${secure_url}, 'image')`;

        res.json({ success: true, content: secure_url });

    } catch (error) {
        console.log("❌ ERROR:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// ======================= REMOVE OBJECT (COMING SOON) =======================
export const removeImageObject = async (req, res) => {
    try {
        const userId = req.userId;
        const object = req.body?.object;
        const image = req.file;

        if (!image || !object) {
            return res.status(400).json({ success: false, message: "Missing image or object name" });
        }

        const { public_id } = await cloudinary.uploader.upload(image.path);

        const imageUrl = cloudinary.url(public_id, {
            transformation: [{ effect: `gen_remove:prompt_${object}` }],
            resource_type: 'image'
        });

        await sql`INSERT INTO creations (user_id, prompt, content, type)
        VALUES (${userId}, ${`Remove ${object}`}, ${imageUrl}, 'image')`;

        res.json({ success: true, content: imageUrl });

    } catch (error) {
        console.log("❌ ERROR:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};


// ======================= REVIEW RESUME =======================
export const reviewResume = async (req, res) => {
    try {
        const userId = req.userId;
        const resume = req.file;

        if (resume.size > 5 * 1024 * 1024) {
            return res.status(400).json({ success: false, message: "File too large (max 5MB)" });
        }

        const dataBuffer = fs.readFileSync(resume.path);
        const pdfData = await pdf(dataBuffer);

        // ✅ Trim to 3000 chars to save tokens
        const resumeText = pdfData.text.slice(0, 3000);

        const prompt = `Review this resume and provide concise constructive feedback on strengths, weaknesses, and areas for improvement:\n\n${resumeText}`;

        const content = await generateWithGroq(prompt);

        if (!content) {
            return res.status(500).json({ success: false, message: "AI returned empty response" });
        }

        await sql`INSERT INTO creations (user_id, prompt, content, type)
        VALUES (${userId}, 'Resume review', ${content}, 'resume_review')`;

        res.json({ success: true, content });

    } catch (error) {
        console.log("❌ ERROR:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};