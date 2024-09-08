import { data } from "@/lib/data";
import analyzeLegalDocument from "@/lib/grok/analyzeLegalDocument";
import questionFormat from "@/lib/grok/questionFormat";

interface AnalyzeRequestBody {
  /** Input questions from end user */
  questions: string;
  type: "respond" | "propound";
}

export const dynamic = "force-dynamic"; // defaults to auto
export async function POST(request: Request) {
  try {
    const res = (await request.json()) as AnalyzeRequestBody;

    if (!res.questions) {
      return Response.json(
        {
          message: "`questions` are required",
        },
        { status: 422 }
      );
    } else if (!res.type) {
      return Response.json(
        {
          message: "`type` are required (respond or propound)",
        },
        { status: 422 }
      );
    }

    // TODO: Pass res.questions & res.type into LLM
    const initialDoc = res.questions;
    const questions = await questionFormat(initialDoc);
    const analysisResults = await analyzeLegalDocument(questions, res.type);

    return Response.json(
      {
        questions: analysisResults,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);

    return Response.json(
      {
        message: "An error has occurred",
      },
      {
        status: 500,
      }
    );
  }
}
