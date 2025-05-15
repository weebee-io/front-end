import Cookies from "js-cookie"
import { QuizRank } from "./types"

// API 기본 URL
const API_BASE_URL = "http://localhost:8080"

// API 요청 헬퍼 함수
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

// 사용자 정보 가져오기
export async function getUserInfo() {
  return fetchWithAuth("/users/getUserinfo")
}

// 사용자 스탯 가져오기
export async function getUserStats() {
  return fetchWithAuth("/stats/getuserstats")
}

// 위비 이미지 가져오기
export async function getWeebeeImage() {
  const response = await fetchWithAuth("/stats/weebee-image")
  return response // 이미지 이름을 포함한 응답 객체 반환
}

// 퀴즈 목록 가져오기 (subject, quiz_rank 쿼리 파라미터)
export async function getQuizzes(subject: string, quiz_rank: QuizRank) {
  return fetchWithAuth(
    `/quiz/generation/${encodeURIComponent(subject)}/${quiz_rank}`
  )
}

// 퀴즈 정답 확인 (정답은 POST로 보내는 게 더 안전하지만, 현재 GET 방식 유지)
export async function checkQuizAnswer(quizId: number, answer: string) {
  return fetchWithAuth(`/quiz/iscorrect/${quizId}/${encodeURIComponent(answer)}`)
}

// 사용자가 푼 퀴즈 결과 가져오기
export async function getUserQuizResults() {
  return fetchWithAuth("/quiz/checkResult")
}

// 퀴즈 업로드 (관리자용)
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
