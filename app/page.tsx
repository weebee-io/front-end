"use client"

import { useAuth } from "@/components/auth/AuthProvider"
import { useEffect, useState } from "react"
import Image from "next/image"
import { getUserInfo } from "@/lib/api"
import { Quote } from "@/components/home/Quote"
import { RecentQuiz } from "@/components/home/RecentQuiz"
import { getWeebeeImage } from "@/lib/api"

export default function Home() {
  const { isAuthenticated, user, loading } = useAuth()
  const [userInfo, setUserInfo] = useState<any>(null)
  const [loadingUserInfo, setLoadingUserInfo] = useState(false)

  useEffect(() => {
    // 사용자 정보 가져오기 (로그인 상태일 때만)
    if (isAuthenticated && !loading) {
      setLoadingUserInfo(true)

      // 사용자 정보와 위비 이미지 정보를 함께 가져옵니다
      Promise.all([getUserInfo(), getWeebeeImage()])
        .then(([userInfoData, weebeeImageData]) => {
          console.log("사용자 정보:", userInfoData.data)
          console.log("위비 이미지 정보:", weebeeImageData)

          if (userInfoData.success) {
            // 사용자 정보에 위비 이미지 이름 추가
            setUserInfo({
              ...userInfoData.data,
              weebeeImageName: weebeeImageData.imageName,
            })
          }
        })
        .catch((err) => console.error("데이터 로딩 실패:", err))
        .finally(() => setLoadingUserInfo(false))
    }
  }, [isAuthenticated, loading])

  // 로딩 중일 때 표시할 UI
  if (loading || loadingUserInfo) {
    return <div className="flex justify-center items-center min-h-[60vh]">로딩 중...</div>
  }

  return (
    <div className="flex flex-col items-center">
      {!isAuthenticated ? (
        // 비로그인 상태 UI
        <div className="text-center py-20">
          <h1 className="text-3xl font-bold mb-10">빈 공간</h1>
        </div>
      ) : (
        // 로그인 상태 UI
        <div className="w-full max-w-4xl">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* 사용자 정보 및 캐릭터 이미지 */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-4">{userInfo?.nickname || "사용자"} 님</h2>
                <div className="border-2 border-gray-300 rounded-lg h-64 w-full flex items-center justify-center">
                  {userInfo?.weebeeImageName ? (
                    <div className="relative h-full w-full">
                      <Image
                        src={`/images/characters/${userInfo.weebeeImageName}.png`}
                        alt="캐릭터 이미지"
                        width={200}
                        height={200}
                        className="object-contain"
                        onError={(e) => {
                          console.error("이미지 로드 실패:", userInfo.weebeeImageName)
                          // 이미지 로드 실패 시 기본 이미지로 대체
                          e.currentTarget.src = "/placeholder.svg?height=200&width=200"
                        }}
                      />
                    </div>
                  ) : (
                    <p className="text-gray-500">캐릭터 이미지가 없습니다</p>
                  )}
                </div>
              </div>

              {/* 금융 명언 및 랭크 정보 */}
              <div className="flex-1">
                <Quote />
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold mb-2">
                    현재 랭크: <span className="text-emerald-600">{userInfo?.userrank || "랭크 정보 없음"}</span>
                  </p>
                  <RecentQuiz quizResults={userInfo?.quizResults || []} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
