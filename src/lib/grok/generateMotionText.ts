// Import the necessary utilities for GPT-3 or your chosen LLM
import { readFile } from "fs/promises";
import { GroqInstance, groqClientPromise } from "./groqClient";

// Function to read file content asynchronously
async function readFileContent(filePath: string): Promise<string> {
  try {
    const content = await readFile(filePath, "utf8");
    return content;
  } catch (error) {
    console.error(`Error reading file at ${filePath}:`, error);
    throw error; // Rethrow to ensure the caller can react
  }
}

async function constructMotionPrompt(
  results: Array<any>,
  user: string
): Promise<string> {
  const legalRulesFilePath = "public/data/legalRules.txt";
  const legalRules = await readFileContent(legalRulesFilePath);
  const failedQuestions = results.filter(
    (question) => question.passFail === "Fail"
  );
  console.log("Failed questions: ",failedQuestions);

  let prompt: string;
  if (user === "respond") {
    prompt = `Responding: Generate legal analysis, intended to be copied and pasted into a motion document, based on the following interrogatory questions in violation of the rules:The analysis should reference ${legalRules}, specify what violation it is, cite case laws that also talk about that violation, and then explain how the same line of logic applies to the interrogatory questions at hand. \n\n. `;
  } else {
    prompt = `Propounding v2: you are a great litigator and you need to write some analysis for a motion about the following interrogatory questions which are purported to be in violation of the rules: ${legalRules}. If the question’s violation is unambiguous, DO NOT INCLUDE YOUR ANALYSIS OF THE QUESTION IN THE RESPONSE. If the question's violation is in your view ambiguous, argue why it doesn’t violate ${legalRules} and should be accepted. ONLY TALK ABOUT THE QUESTIONS WHICH YOU ARE ARGUING SHOULD BE ACCEPTED. Be crisp and concise with the analysis, specify what the purported violation it is, cite case laws that also talk about that violation, and then explain how the same line of logic applies to accepting the interrogatory questions at hand. \n\n.`;
  }
  failedQuestions.forEach((item) => {
    prompt += `Question ${item.questionNumber}: ${item.question}\nAnalysis: ${
      item.analysis
    }\n\n`;
  });
  prompt +=
    "Provide a detailed explanation of the rule violations. Do not suggest corrections.";
  return prompt;
}

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

export async function generateMotionText(
  results: Array<any>,
  user: string
): Promise<string> {
  const groq = await initGroqClient();

  // Construct the prompt for the motion generation
  const prompt = await constructMotionPrompt(results, user);

  // Send the prompt to the LLM
  const response = await groq.chat.completions.create({
    model: "llama3-8b-8192",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: prompt,
      },
    ],
    max_tokens: 2048,
  });

  // Extract and return the generated motion text
  return response.choices[0].message.content.trim();
}

// Example usage
// Assuming `failedQuestions` is the filtered list of failed questions from your analysis
// generateMotionText(failedQuestions).then(motionText => console.log(motionText));
