import { GoogleGenerativeAI } from "@google/generative-ai";

console.log("GeminiClient starting");

async function createGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
}

export type GeminiInstance = GoogleGenerativeAI;
export const geminiClientPromise = createGeminiClient();