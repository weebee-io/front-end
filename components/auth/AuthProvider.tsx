"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"

// 인증 컨텍스트 타입 정의
type AuthContextType = {
  isAuthenticated: boolean
  user: any | null
  loading: boolean
  login: (id: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
}

// 인증 컨텍스트 생성
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  login: async () => ({ success: false, message: "" }),
  logout: () => {},
})

// 인증 프로바이더 컴포넌트
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // 컴포넌트 마운트 시 JWT 토큰 확인
  useEffect(() => {
    const token = Cookies.get("jwt_token")
    if (token) {
      setIsAuthenticated(true)
      // 여기서 사용자 정보를 가져올 수 있음
      // 예: fetchUserInfo(token).then(data => setUser(data))
    }
    setLoading(false)
  }, [])

  // 로그인 함수
  const login = async (id: string, password: string) => {
    try {
      const response = await fetch("http://localhost:8080/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, password }),
      })

      const data = await response.json()

      if (data.success) {
        // JWT 토큰을 쿠키에 저장 (30분 유효)
        Cookies.set("jwt_token", data.data, { expires: 1 / 48 }) // 30분 = 1일/48
        setIsAuthenticated(true)
        // 사용자 정보 설정 (필요한 경우)
        // setUser(userData)
        return { success: true, message: data.message }
      } else {
        return { success: false, message: data.message || "로그인에 실패했습니다." }
      }
    } catch (error) {
      console.error("로그인 오류:", error)
      return { success: false, message: "로그인 중 오류가 발생했습니다." }
    }
  }

  // 로그아웃 함수
  const logout = () => {
    Cookies.remove("jwt_token")
    setIsAuthenticated(false)
    setUser(null)
    router.push("/")
  }

  // 사용자 정보 가져오기 (랭크 확인용)
  const fetchUserInfo = async () => {
    try {
      const response = await fetch("http://localhost:8080/users/getUserinfo", {
        credentials: "include"
      });

      if (!response.ok) {
        // 401, 403 등 에러 응답일 때
        throw new Error(`서버 응답 에러: ${response.status}`);
      }

      const userInfo = await response.json();

      if (userInfo.success) {
        setUser(userInfo.data);
      }
    } catch (error) {
      console.error("유저 정보 로딩 실패:", error);
      // 에러 처리 UI 등 추가
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout }}>{children}</AuthContext.Provider>
  )
}

// 인증 컨텍스트 사용을 위한 훅
export const useAuth = () => useContext(AuthContext)
