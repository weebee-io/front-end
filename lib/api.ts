// lib/api.ts

import Cookies from "js-cookie"
import { QuizRank } from "./types"

const API_BASE_URL = "http://localhost:8080"

/**
 * 인증이 필요한 모든 요청을 보낼 때 사용하는 헬퍼
 */
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = Cookies.get("jwt_token")
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    credentials: "include",
    headers,
  })

  if (!response.ok) {
    throw new Error(`API 요청 실패: ${response.status}`)
  }

  return response.json()
}

/** 사용자 정보 */
export async function getUserInfo() {
  return fetchWithAuth("/users/getUserinfo")
}

/** 사용자 스탯 */
export async function getUserStats() {
  return fetchWithAuth("/stats/getuserstats")
}

/** 위비 캐릭터 이미지 */
export async function getWeebeeImage() {
  return fetchWithAuth("/stats/weebee-image")
}

/**
 * 퀴즈 목록 가져오기
 * @param subject "finance" | "invest" | "credit"
 * @param quiz_rank "BRONZE" | "SILVER" | "GOLD"
 */
export async function getQuizzes(subject: string, quiz_rank: QuizRank) {
  return fetchWithAuth(
    `/quiz/generation/${encodeURIComponent(subject)}/${quiz_rank}`
  )
}

/** 퀴즈 정답 검증 */
export async function checkQuizAnswer(
  quizId: number,
  answer: string
) {
  return fetchWithAuth(
    `/quiz/iscorrect/${quizId}/${encodeURIComponent(answer)}`
  )
}

/** 지금까지 푼 퀴즈 결과 조회 */
export async function getUserQuizResults() {
  return fetchWithAuth("/quiz/checkResult")
}

/** 관리자용: 퀴즈 파일 업로드 */
export async function uploadQuizFile(file: File) {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(`${API_BASE_URL}/quiz/admin/upload`, {
    method: "POST",
    body: formData,
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`퀴즈 업로드 실패: ${response.status}`)
  }
  return response.text()
}

/** 리더보드: statSum 내림차순 페이징 조회 */
export async function getLeaderboard(
  page: number = 0,
  size: number = 10
) {
  return fetchWithAuth(`/leaderboard?page=${page}&size=${size}`)
}
