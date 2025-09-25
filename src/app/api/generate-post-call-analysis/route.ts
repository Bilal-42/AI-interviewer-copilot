import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import OpenAI from "openai";

// OpenAI configuration (non-Azure) for post-call analysis
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      const msg = "OPENAI_API_KEY is not set";
      logger.error(msg);
      
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    const body = await req.json();
    const { transcript, interviewObjective, questions } = body;

    logger.info("generate-post-call-analysis request received");

    if (!transcript) {
      return NextResponse.json(
        { error: "Transcript is required" },
        { status: 400 }
      );
    }

    const analysisPrompt = `You are an expert technical interviewer and evaluator. Analyze the ENTIRE interview transcript and produce an objective, rubric-based evaluation.

CRITICAL RULES:
- Evaluate ONLY the candidate's answers. Do not invent content.
- STRICTLY ENGLISH: If the candidate does not answer in English, penalize communication accordingly. Do not translate; simply recognize non-English and penalize.
- For each provided question, derive a concise rubric of 3-6 expected key points and use it to judge correctness and relevance of the candidate's answer(s) to that question.
- If a question was not answered, score low and explain briefly.
- Scores are integers 0-100. Use a wide distribution, not clustered.
- Output ONLY valid JSON following the schema strictly. NO code fences.

INTERVIEW OBJECTIVE: ${interviewObjective || "General interview assessment"}

QUESTIONS TO EVALUATE (in order):
${(questions || []).map((q: string, i: number) => `${i + 1}. ${q}`).join('\n') || "Not specified"}

TRANSCRIPT (full conversation, interviewer and candidate turns):
${transcript}

Produce the following JSON object exactly:
{
  "overallScore": <0-100>,
  "overallFeedback": "<overall strengths/weaknesses and hiring guidance>",
  "communication": {
    "score": <0-100>,
    "feedback": "<clarity, concision, language adherence (English-only), structure>"
  },
  "generalIntelligence": "<concise assessment of reasoning and problem-solving>",
  "softSkillSummary": "<concise assessment of professionalism, collaboration, attitude>",
  "questionSummaries": [
    {
      "question": "<original question>",
      "expectedKeyPoints": ["<point1>", "<point2>", "<point3>"] ,
      "answerRelevance": "<brief check if the candidate addressed the question>",
      "correctnessScore": <0-100>,
      "summary": "<brief summary of candidate's answer(s)>"
    }
  ],
  "callSummary": "<2-3 sentence summary of the entire interview>",
  "strengths": ["<strength1>", "<strength2>"] ,
  "weaknesses": ["<weakness1>", "<weakness2>"],
  "recommendation": "<Hire|Reject|Consider>"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [
        {
          role: "system",
          content: "You are an expert interview analyst. Output strictly valid JSON only. Never include code fences or commentary."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const analysisRaw = completion.choices?.[0]?.message?.content;
    let analysisText = typeof analysisRaw === "string" ? analysisRaw : "{}";
    // Sanitize: remove accidental code fences if any
    analysisText = analysisText.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      logger.error("Failed to parse analysis JSON:", (parseError as Error)?.message || String(parseError));
      
      return NextResponse.json({ error: "Invalid analysis JSON" }, { status: 502 });
    }

    logger.info("Post-call analysis generated successfully");

    return NextResponse.json(
      { analysis },
      { status: 200 }
    );
  } catch (error: any) {
    // Extract as much detail as possible from OpenAI error
    const status = error?.status || error?.response?.status || 500;
    const data = error?.response?.data || error?.data || null;
    const code = error?.code || data?.error?.code;
    const type = data?.error?.type;
    const message = (error?.message as string) || data?.error?.message || "Internal server error";
    logger.error("Error generating post-call analysis:", { status, code, type, message, data });

    return NextResponse.json(
      { error: message, code, type, details: data },
      { status }
    );
  }
}
