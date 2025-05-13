import Cookies from "js-cookie"

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

// 퀴즈 목록 가져오기
export async function getQuizzes() {
  // 이 함수는 예시입니다. 실제 API 엔드포인트에 맞게 수정해야 합니다.
  // 서버에서 퀴즈 목록을 가져오는 API가 없어서 임시로 구현했습니다.
  return fetchWithAuth("/quizzes")
}

// 사용자의 퀴즈 결과 가져오기
export async function getUserQuizResults() {
  // 이 함수는 예시입니다. 실제 API 엔드포인트에 맞게 수정해야 합니다.
  // 사용자 정보에서 퀴즈 결과를 추출할 수도 있습니다.
  const userInfo = await getUserInfo()
  return userInfo.success ? userInfo.data.quizResults : []
}

// 퀴즈 답변 제출하기
export async function submitQuizAnswer(quizId: number, answer: string) {
  // 이 함수는 예시입니다. 실제 API 엔드포인트에 맞게 수정해야 합니다.
  return fetchWithAuth("/quiz/submit", {
    method: "POST",
    body: JSON.stringify({ quizId, answer }),
  })
}
