import { GroqInstance, groqClientPromise } from "./groqClient";

// Initialize Groq Client
async function initGroqClient(): Promise<GroqInstance> {
  try {
    console.log("Initializing Groq client...");
    const groq = await groqClientPromise;
    console.log("Groq client initialized successfully.");
    return groq;
  } catch (error) {
    console.error("Error initializing OpenAI client:", error);
    throw error;
  }
}

export default async function questionFormat(
  example: string
): Promise<string[]> {
  // Initialize Groq client
  const groq = await initGroqClient();

  // Groq API request
  try {
    const response = await groq.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: [
        {
          role: "system",
          content: `Here is a list of special interrogatories. Please convert it into a list of numbered questions. For example: 1. First question? 2. Second question? 3. Third question? etc.`,
        },
        {
          role: "user",
          content: example,
        },
      ],
      max_tokens: 2048,
    });
    console.log("Formatted questions:", response.choices[0].message.content);
    const formattedQuestions = response.choices[0].message.content
      .split(/[.\n]\d+\./)
      .map((q) => q.trim())
      .filter((q) => q);
    return formattedQuestions.map((q, index) => `${index + 1}. ${q}`);
  } catch (error) {
    console.error("Error formatting questions with Groq:", error);
    throw error; // Allow higher-level handling or specific user feedback
  }
}
