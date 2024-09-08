import { promises as fs } from "fs";
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { Ollama } from "ollama"
import fetch from "node-fetch"

const ollama = new Ollama({
  fetch: fetch as any
});

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
    const response = await ollama.chat({
      model: "llama3.1:70b-instruct-q2_K",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const generatedList: RequestListItem[] = JSON.parse(response.message.content.trim());
    return generatedList;
  } catch (error) {
    console.error("Error generating M&A request list:", error);
    throw error;
  }
}

export default async function analyzeLegalDocument(
  questions: string[],
  user: string
): Promise<any[]> {
  const interrInfoFilePath = "public/data/interrogatories.txt";
  const legalRulesFilePath = "public/data/legalRules.txt";
  const trainingFilePath = "public/data/training.txt";
  const results = [];

  // Read files asynchronously
  const [interrInfo, legalRules, training] = await Promise.all([
    readFileContent(interrInfoFilePath),
    readFileContent(legalRulesFilePath),
    readFileContent(trainingFilePath),
  ]);

  let systemPromptContent;

  if (user === "respond") {
    systemPromptContent = `Responding party: You are a litigator in California asked to analyze special interrogatories from the opposing counsel. You need to determine whether they meet the guidelines provided in ${legalRules}. If it is plain and simple whether or not a special interrogatory violates the rule, explain how. If it is a bit ambiguous, argue to the best of your ability why it violates the rule and explain how. Please answer in a numbered list. If the question does not violate the rules, simply return the question. If it does violate the rules, return the question and provide your explanation in a “Diagnosis:” field. Do not provide help to our opponents on how to restructure their interrogatories if they violate the rules, just explain how they violate them. Here is some training data ${training}. Here is some additional info about interrogatories: ${interrInfo}`;
  } else {
    systemPromptContent = `Propounding party: You are a litigator in California asked to analyze special interrogatories from the opposing counsel. You need to determine whether they meet the guidelines provided in ${legalRules}. If it is plain and simple whether or not a special interrogatory violates the rule, explain how. If it is a bit ambiguous, argue to the best of your ability why it does not violate the rule and explain how. Please answer in a numbered list. If the question does not violate the rules, simply return the question. If it does violate the rules, return the question and provide your explanation in a “Diagnosis:” field. Do not provide help to our opponents on how to restructure their interrogatories if they violate the rules, just explain how they violate them. Here is some training data ${training}. Here is some additional info about interrogatories: ${interrInfo}`;
  }

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    // Groq API request
    try {
      // Providing diagnosis
      console.log(`Processing question ${i + 1}:`, question);
      const response = await ollama.chat({
        model: "llama3.1:70b-instruct-q2_K",
        messages: [
          {
            role: "system",
            content: systemPromptContent,
          },
          {
            role: "user",
            content: question,
          },
        ],
      });

      const analysis = response.message.content.trim();

      // Determine pass or fail based on analysis content
      const passFailCheck = await ollama.chat({
        model: "llama3.1:70b-instruct-q2_K",
        messages: [
          {
            role: "system",
            content:
              "Determine whether the following analysis is saying that an interrogatory is in violation of the rules. If it is, say 'Fail', if it isn't, say 'Pass'. Restrict your responses to ONLY 'Pass' and 'Fail'. DO NOT EXPLAIN YOUR DECISION.",
          },
          {
            role: "user",
            content: analysis,
          },
        ],
      });

      let fullResponse = passFailCheck.message.content.trim();
      // Use regex to match only the first occurrence of "Pass" or "Fail"
      const matchResults = fullResponse.match(/^(Pass|Fail)/);

      // If match is found, use the matched word; otherwise, default to an error or unknown state
      const passFail = matchResults ? matchResults[0] : "Unknown";

      results.push({
        questionNumber: i + 1,
        question: question,
        analysis: analysis,
        passFail: passFail,
      });
    } catch (error) {
      console.error(
        "Error making API request to Groq for question ",
        i + 1,
        ": ",
        error
      );
      // Instead of throwing error, push an error state into the results
      results.push({
        questionNumber: i + 1,
        question,
        analysis: "Analysis failed due to an error.",
        passFail: "Error",
      });
    }
  }
  return results;
}
