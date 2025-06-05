// 파일 경로: app/api/logs/route.ts

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

type LogRequestBody = {
  event_type: string;
  timestamp: string;
  user_id: number;
  properties: { [key: string]: any };
};

export async function POST(req: NextRequest) {
  try {
    // 1) 요청 바디(JSON)를 파싱
    const body = (await req.json()) as LogRequestBody;
    const { event_type, timestamp, user_id, properties } = body;

    // 2) 간단한 유효성 검사
    if (
      typeof event_type !== "string" ||
      typeof timestamp !== "string" ||
      typeof user_id !== "number" ||
      typeof properties !== "object"
    ) {
      return NextResponse.json(
        { success: false, error: "잘못된 요청 형식입니다." },
        { status: 400 }
      );
    }

    // 3) logs 디렉토리 경로 구하기 (프로젝트 루트 기준)
    const logsDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir);
    }

    // 4) 최종 로그 파일 경로 (quiz.log)
    const logFilePath = path.join(logsDir, "quiz.log");

    // 5) 기록할 JSON 한 줄 생성
    const logObject = { event_type, timestamp, user_id, properties };
    const logLine = JSON.stringify(logObject) + "\n";

    // 6) 파일에 append 방식으로 기록
    fs.appendFileSync(logFilePath, logLine, "utf8");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("로그 기록 중 오류:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Unknown Error" },
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
