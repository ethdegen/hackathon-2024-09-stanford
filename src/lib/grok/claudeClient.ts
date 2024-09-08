console.log("ClaudeClient starting");
import Anthropic from "@anthropic-ai/sdk";

async function createClaudeClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not set.");
  }
  const claude = new Anthropic({
    apiKey: apiKey,
  });
  return claude;
}

export type ClaudeInstance = Anthropic;
export const claudeClientPromise = createClaudeClient();