import Groq from "groq-sdk";
// import dotenv from "dotenv";

async function createGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not set.");
  }
  const groq = new Groq({
    apiKey: apiKey,
  });
  return groq;
}
export type GroqInstance = Groq;
export const groqClientPromise = createGroqClient();
