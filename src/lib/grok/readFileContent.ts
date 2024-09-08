import { promises as fs } from "fs";

export default async function readFileContent(filePath: string): Promise<string> {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return content;
  } catch (error) {
    console.error(`Error reading file at ${filePath}:`, error);
    throw error; // Rethrow to ensure the caller can react
  }
}

