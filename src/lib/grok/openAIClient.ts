console.log("OpenAIClient starting");
import OpenAI from "openai";
// import dotenv from 'dotenv';

async function createOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set.");
  }
  const openai = new OpenAI({
    apiKey: apiKey,
  });
  return openai;
}
export type OpenAIInstance = OpenAI;
export const openaiClientPromise = createOpenAIClient();
