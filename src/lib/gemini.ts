import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY tidak ditemukan di .env.local");
}

const genAI = new GoogleGenerativeAI(apiKey);

// gemini-2.5-flash — stable, gratis, cocok untuk portfolio chat
export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    maxOutputTokens: 1024,
    temperature: 0.7,
    topP: 0.9,
  },
});