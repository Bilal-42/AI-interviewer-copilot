import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function POST(req: Request, res: Response) {
  logger.info("register-call request received");

  const body = await req.json();

  // For GPT Realtime, the client connects directly with API key.
  // We still return a call_id so the rest of the app works unchanged.
  const registerCallResponse = {
    call_id: randomUUID(),
    access_token: "ok",
    dynamic_data: body.dynamic_data,
  };

  logger.info("Call registered successfully");

  return NextResponse.json(
    {
      registerCallResponse,
    },
    { status: 200 },
  );
}
