import { generateMotionText } from "@/lib/grok/generateMotionText";

interface GenerateRequestBody {
  /** Input questions from end user */
  questions: string;
  type: "respond" | "propound";

  /** Output from POST /api/analyze */
  diagnosis: {
    questionNumber: number;
    question: string;
    analysis: string;
    passFail: "Fail" | "Pass";
  }[];
}

export const dynamic = "force-dynamic"; // defaults to auto
export async function POST(request: Request) {
  // TODO: Validations

  try {
    const res = (await request.json()) as GenerateRequestBody;
    const motion = await generateMotionText(res.diagnosis, res.type);

    return Response.json({ motion }, { status: 200 });
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
