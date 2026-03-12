import { GoogleGenerativeAI } from "@google/generative-ai";

function getApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY tidak ditemukan di environment.");
  }

  return apiKey;
}

export function getGeminiModel() {
  const genAI = new GoogleGenerativeAI(getApiKey());

  // gemini-2.5-flash: stable, gratis, cocok untuk portfolio chat
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.7,
      topP: 0.9,
    },
  });
}
