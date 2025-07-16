import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import {v2 as cloudinary} from 'cloudinary'
import axios from "axios";
import fs from 'fs'
import pdf from 'pdf-parse/lib/pdf-parse.js'

const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

//Generate article
export const generateArticle = async (req, res) => {
    try {
    const { userId } = req.auth();
    const { prompt, length } = req.body;
    const Plan = req.Plan;
    const free_usage = req.free_usage;

    if (Plan !== 'Premium' && free_usage >= 10) {
        return res.status(402).json({
        success: false,
        message: 'Limit reached. Upgrade to Premium to continue.',
    });
    }

    const response = await AI.chat.completions.create({
    model: 'gemini-2.0-flash',
    messages: [
        {
        role: 'user',
        content: prompt,
        },
    ],
    temperature: 0.7,
    max_tokens: length,
    });

    let content = response.choices[0].message.content;

    // ✅ Strip Markdown symbols
    const plainContent = content.replace(/[#*_]/g, '');

    // ✅ Store plain text in DB
    await sql`INSERT INTO creations (user_id, prompt, content, type)
    VALUES (${userId}, ${prompt}, ${plainContent}, 'article')`;

    if (Plan !== 'Premium') {
    await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
        free_usage: free_usage + 1,
        },
    });
    }

    // ✅ Return plain text to client
    res.json({ success: true, content: plainContent });
} catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
}
};


//Blogtitile 
export const generateBlogTitle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt } = req.body;
        const Plan = req.Plan;
        const free_usage = req.free_usage;

        if (Plan !== 'Premium' && free_usage >= 10) {
            return res.status(402).json({ success: false, message: "Limit reached. Upgrade to Premium to continue." });
        }

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 100,
        });

        const content = response.choices[0].message.content

        await sql`INSERT INTO creations (user_id,prompt,content,type)
        VALUES (${userId}, ${prompt},${content}, 'blog-title')`;
        
        if (Plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            });
        }

        res.json({ success: true, content });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

//Generate Image
export const generateImage = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt,publish } = req.body;
        const Plan = req.Plan;
        // (because its for premium users ) const free_usage = req.free_usage;

        // if (Plan !== 'Premium') {
        //     return res.status(402).json({ success: false, message: "This feature is only available for premium user" });
        // }
        

    const formData = new FormData()
formData.append('prompt', prompt)
const {data} = await axios.post('https://clipdrop-api.co/text-to-image/v1',formData, {
    headers: {'x-api-key': process.env.CLIPDROP_API_KEY},
    responseType:"arraybuffer",
})
const base64Image = `data:image/png;base64,${Buffer.from(data,'binary').toString('base64')}`;

const{secure_url} = await cloudinary.uploader.upload(base64Image)


        await sql`INSERT INTO creations (user_id,prompt,content,type,publish)
        VALUES (${userId}, ${prompt},${secure_url}, 'image',${publish ?? false })`;
        
    

        res.json({ success: true, content:secure_url });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

//remove background 
export const removeImageBackground = async (req, res) => {
    try {
        const { userId } = req.auth();
        const image = req.file; //multer middleware
        const Plan = req.Plan;
        // (because its for premium users ) const free_usage = req.free_usage;

        // if (Plan !== 'Premium') {
        //     return res.status(402).json({ success: false, message: "This feature is only available for premium user" });
        // }

//     const formData = new FormData()
// formData.append('prompt', prompt)
// const {data} = await axios.post('https://clipdrop-api.co/text-to-image/v1',formData, {
//     headers: {'x-api-key': process.env.CLIPDROP_API_KEY},
//     responseType:"arraybuffer",
// })
// const base64Image = `data:image/pn;base64,${Buffer.from(Data,'binary').toString('base64')}`;



const{secure_url} = await cloudinary.uploader.upload(image.path,{
    transformation:[
        {
            effect:'background_removal',
            background_removal:'remove_the_background'
        }
    ]
})


        await sql`INSERT INTO creations (user_id,prompt,content,type)
        VALUES (${userId},'Remove background from image',${secure_url}, 'image')`;
        
    

        res.json({ success: true, content: secure_url });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};


//remove object
export const removeImageObject = async (req, res) => {
  try {
    const userId = req.userId || req.auth?.userId; // ✅ fallback if using Clerk
    const object = req.body?.object || req.query?.object; // ensure 'object' is passed

    const image = req.file;
    if (!image) {
      return res.status(400).json({ success: false, message: "Image file is missing." });
    }
    if (!object) {
      return res.status(400).json({ success: false, message: "Object to remove not provided." });
    }

    // ✅ Upload image to Cloudinary
    const { public_id } = await cloudinary.uploader.upload(image.path);

    // ✅ Generate transformed URL
    const imageUrl = cloudinary.url(public_id, {
      transformation: [
        { effect: `gen_remove:${object}` }
      ],
      resource_type: 'image'
    });

    // ✅ Save to DB
    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${`Remove ${object} from image`}, ${imageUrl}, 'image')
    `;

    return res.json({ success: true, content: imageUrl });

  } catch (error) {
    console.error("❌ Backend Error in removeImageObject:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

//review resume
export const reviewResume= async (req, res) => {
    try {
        const { userId } = req.auth();
        const resume = req.file; //multer middleware
        const Plan = req.Plan;
        // (because its for premium users ) const free_usage = req.free_usage;

        // if (Plan !== 'Premium') {
        //     return res.status(402).json({ success: false, message: "This feature is only available for premium user" });
        // } 

//     const formData = new FormData()   (this is for text to image)
// formData.append('prompt', prompt)
// const {data} = await axios.post('https://clipdrop-api.co/text-to-image/v1',formData, {
//     headers: {'x-api-key': process.env.CLIPDROP_API_KEY},
//     responseType:"arraybuffer",
// })
// const base64Image = `data:image/pn;base64,${Buffer.from(Data,'binary').toString('base64')}`;


        if(resume.size > 5 * 1024 *1024){
            return res.json({success:false,message:"Resume file size exceeds allowed size (5MB)."})
        }

        const dataBuffer = fs.readFileSync(resume.path)
        const pdfData = await pdf(dataBuffer)

        const prompt = `Rewiew the following resume and provide constructive feedback on its strength,weeknesses,and areas fro improvement.Resume content:\n\n${pdfData.text}` //prompt on which it works 

            const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 1000,
        });

        const content = response.choices[0].message.content

        await sql`INSERT INTO creations (user_id,prompt,content,type)
        VALUES (${userId},'Review the uploaded resume',${content}, 'resume_review')`;  //it will save the data in neon database
        
    

        res.json({ success: true, content});

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};