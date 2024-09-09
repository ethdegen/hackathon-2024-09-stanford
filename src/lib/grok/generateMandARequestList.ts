import { promises as fs } from "fs";
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { GeminiInstance, geminiClientPromise } from "./geminiClient";
import { SchemaType } from "@google/generative-ai";

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

async function initGeminiClient(): Promise<GeminiInstance> {
  try {
    console.log("Initializing Gemini client...");
    const genAI = await geminiClientPromise;
    console.log("Gemini client initialized successfully.");
    return genAI;
  } catch (error) {
    console.error("Error initializing Gemini client:", error);
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
  const workbook = XLSX.utils.book_new();

  // Convert the request list to a worksheet
  const worksheet = XLSX.utils.json_to_sheet(requestList);

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "M&A Request List");

  // Generate Excel file buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

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

  // Initialize Gemini client
  const genAI = await initGeminiClient();

  // Prepare the prompt for the LLM
  const prompt = `You are an experienced M&A lawyer tasked with creating a request list for a purchase agreement. 
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
  Some of these fields should be empty strings as placeholders.

  Prior Purchase Agreement:
  ${priorPurchaseAgreement}
  
  Prior Request List (in JSON format):
  ${priorRequestList}
  
  Prior Term Sheet:
  ${priorTermSheet}
  
  Current Term Sheet:
  ${currentTermSheet}
  
  Based on these documents, generate a comprehensive request list for the new purchase agreement.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro", 
    generationConfig: {
    responseMimeType: "application/json",
    /*responseSchema: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          ItemName: SchemaType.STRING,
          ItemDescription: SchemaType.STRING,
          Status: SchemaType.STRING,
          Priority: SchemaType.STRING,
          DateReceived: SchemaType.STRING,
          LLMExplanation: SchemaType.STRING,
          CompanysResponse: SchemaType.STRING,
          Comments: SchemaType.STRING,
          VirtualDataRoomLocation: SchemaType.STRING,
          },
        },
      },*/
    },
  });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const generatedList: RequestListItem[] = JSON.parse(response.text().trim());
    return generatedList;
  } catch (error) {
    console.error("Error generating M&A request list:", error);
    throw error;
  }
}