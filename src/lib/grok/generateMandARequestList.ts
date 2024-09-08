import { promises as fs } from "fs";
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { OpenAIInstance, openaiClientPromise } from "./openAIClient";
// import { ClaudeInstance, claudeClientPromise } from './claudeClient';

// Function to read file content asynchronously
async function readFileContent(filePath: string): Promise<string> {
  try {
    const fileExtension = filePath.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'docx') {
      const buffer = await fs.readFile(filePath);
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else {
      // Assume it's a txt file
      const content = await fs.readFile(filePath, "utf8");
      return content;
    }
  } catch (error) {
    console.error(`Error reading file at ${filePath}:`, error);
    throw error;
  }
}

/*async function initClaudeClient(): Promise<ClaudeInstance> {
  try {
    console.log("Initializing Claude client...");
    const claude = await claudeClientPromise;
    console.log("Claude client initialized successfully.");
    return claude;
  } catch (error) {
    console.error("Error initializing Claude client:", error);
    throw error;
  }
}*/

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

async function initOpenAIClient(): Promise<OpenAIInstance> {
  try {
    console.log("Initializing OpenAI client...");
    const openai = await openaiClientPromise;
    console.log("OpenAI client initialized successfully.");
    return openai;
  } catch (error) {
    console.error("Error initializing OpenAI client:", error);
    throw error;
  }
}

interface RequestListItem {
  ItemName: string;
  ItemDescription: string;
  Status: string;
  Priority: string;
  DateReceived: string;
  LLMExplanation: string;
  CompanysResponse: string;
  Comments: string;
  VirtualDataRoomLocation: string;
}

// Function to convert the request list to Excel format
async function convertToExcel(requestList: RequestListItem[]): Promise<Blob> {
  // Create a new workbook
  const workbook = utils.book_new();

  // Convert the request list to a worksheet
  const worksheet = utils.json_to_sheet(requestList);

  // Add the worksheet to the workbook
  utils.book_append_sheet(workbook, worksheet, "M&A Request List");

  // Generate Excel file buffer
  const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });

  // Convert buffer to Blob
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  return blob;
}

async function readExcelContent(filePath: string): Promise<string> {
  try {
    const buffer = await fs.readFile(filePath);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);
    return JSON.stringify(jsonData, null, 2);
  } catch (error) {
    console.error(`Error reading Excel file at ${filePath}:`, error);
    throw new Error(`Failed to read Excel file: ${filePath}`);
  }
}

export async function generateMandARequestList(
  priorPurchaseAgreementPath: string,
  priorRequestListPath: string,
  priorTermSheetPath: string,
  currentTermSheetPath: string
): Promise<RequestListItem[]> {
  // Read files asynchronously
  const [priorPurchaseAgreement, priorTermSheet, currentTermSheet] = await Promise.all([
    readFileContent(priorPurchaseAgreementPath),
    readFileContent(priorTermSheetPath),
    readFileContent(currentTermSheetPath),
  ]);

  // Read and process the Excel file
  const priorRequestList = await readExcelContent(priorRequestListPath);

  // Initialize Groq client
  // const groq = await initGroqClient();

  const openai = await initOpenAIClient();

  // Prepare the prompt for the LLM
  const systemPrompt = `You are an experienced M&A lawyer tasked with creating a request list for a purchase agreement. 
  Analyze the provided documents and generate a comprehensive request list. 
  Your output should be a JSON array of objects, each representing an item in the request list. 
  Each object should have the following structure:
  {
    "ItemName": "Name of the requested item",
    "ItemDescription": "Detailed description of the item",
    "Status": "",
    "Priority": "",
    "DateReceived": "",
    "LLMExplanation": "Explanation of how this information relates to drafting a purchase agreement",
    "CompanysResponse": "",
    "Comments": "",
    "VirtualDataRoomLocation": ""
  }
  Some of these fields should be empty strings as placeholders.`;

  const userPrompt = `Prior Purchase Agreement:
  ${priorPurchaseAgreement}
  
  Prior Request List (in JSON format):
  ${priorRequestList}
  
  Prior Term Sheet:
  ${priorTermSheet}
  
  Current Term Sheet:
  ${currentTermSheet}
  
  Based on these documents, generate a comprehensive request list for the new purchase agreement.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 128000,
    });

    const generatedList: RequestListItem[] = JSON.parse(response.message.content.trim());
    return generatedList;
  } catch (error) {
    console.error("Error generating M&A request list:", error);
    throw error;
  }
}
