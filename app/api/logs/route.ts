// 파일 경로: app/api/logs/route.ts

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { z } from "zod";

// 이벤트 타입 정의
const EventType = z.enum([
  "newsViewed",
  "newsSummaryClicked",
  "newsQuizClicked",
  "quizStarted",
  "quizEnded",
  "quizSubmitted",
  "aiWidgetCalled",
  "chatPopupToggled",
  "chatMessageSent",
  "chatMessageError",
  "quizTabViewed",
  "quizHintRequested"
]);

// 이벤트 속성 스키마
const EventProperties = z.object({
  newsId: z.number().optional(),
  quizId: z.number().optional(),
  isCorrect: z.boolean().optional(),
  responseTimeMs: z.number().optional(),
  aiBotUsed: z.boolean().optional(),
  streakCount: z.number().optional(),
  isOpen: z.boolean().optional(),
  messageCount: z.number().optional(),
  messageLength: z.number().optional(),
  error: z.string().optional()
});

// 로그 요청 스키마
const LogRequestSchema = z.object({
  eventType: EventType,
  timestamp: z.string(),
  userId: z.string(),
  properties: EventProperties
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Received log request body:", body);

    // 요청 데이터 검증
    const validatedData = LogRequestSchema.parse(body);

    // logs 디렉토리 경로 구하기 (프로젝트 루트 기준)
    const logsDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir);
    }

    // 최종 로그 파일 경로 (quiz.log)
    const logFilePath = path.join(logsDir, "quiz.log");

    // 기록할 JSON 한 줄 생성
    const logObject = {
      eventType: validatedData.eventType,
      timestamp: validatedData.timestamp,
      userId: validatedData.userId,
      properties: validatedData.properties
    };
    const logLine = JSON.stringify(logObject) + "\n";

    // 파일에 append 방식으로 기록
    fs.appendFileSync(logFilePath, logLine, "utf8");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing log:", error);
    if (error instanceof z.ZodError) {
      console.error("Validation errors:", error.errors.map(e => e.message));
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  // GET 요청은 허용하지 않음
  return NextResponse.json(
    { success: false, error: "Method Not Allowed (POST만 허용)" },
    { status: 405 }
  );
}
