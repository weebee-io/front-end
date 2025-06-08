import Cookies from "js-cookie";

// JWT 디코딩 헬퍼 함수 (간단 버전)
function decodeJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(atob(base64).split("").map(function(c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(""));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("JWT decoding failed", e);
    return null;
  }
}

// 사용자 ID 가져오기 (비 React Hook)
function getUserId(): string | null {
  const token = Cookies.get("jwt_token");
  if (token) {
    const decoded = decodeJwt(token);
    // userId가 숫자일 경우를 대비해 문자열로 변환
    return decoded?.userId ? String(decoded.userId) : null;
  }
  return null;
}

// 사용자명 가져오기 (비 React Hook)
function getUsername(): string | null {
  const token = Cookies.get("jwt_token");
  if (token) {
    const decoded = decodeJwt(token);
    // username이 숫자일 경우를 대비해 문자열로 변환 (일반적으로 username은 문자열)
    return decoded?.username ? String(decoded.username) : null;
  }
  return null;
}

export async function logEvent(
    eventType: string,
    properties?: Record<string, any>
  ): Promise<void> {
    await fetch('/api/logs', {                // 지정된 엔드포인트로 변경
      method: 'POST',                                     //    POST 요청 보내고
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType,                                        // 이벤트 이름
        timestamp: new Date().toISOString(),              // 발생 시각 (ISO 포맷)
        userId: getUserId(),                              // 로그인된 사용자 ID
        properties                                       // 이벤트별 상세 속성
      })
    });
  }
  