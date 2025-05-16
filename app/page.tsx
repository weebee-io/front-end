"use client"

import { useAuth } from "@/components/auth/AuthProvider"
import { useEffect, useState } from "react"
import Image from "next/image"
import { getUserInfo, getWeebeeImage, getLeaderboard } from "@/lib/api"
import { Quote } from "@/components/home/Quote"
import { RecentQuiz } from "@/components/home/RecentQuiz"
import type { LeaderboardDto, Page } from "@/lib/types"

export default function Home() {
  const { isAuthenticated, user, loading } = useAuth()
  const [userInfo, setUserInfo] = useState<any>(null)
  const [loadingUserInfo, setLoadingUserInfo] = useState(false)

  // ★ 리더보드 State 추가
  const [leaderboard, setLeaderboard] = useState<Page<LeaderboardDto> | null>(null)
  const [loadingLb, setLoadingLb] = useState(false)

  useEffect(() => {
    if (isAuthenticated && !loading) {
      setLoadingUserInfo(true)

      Promise.all([getUserInfo(), getWeebeeImage()])
        .then(([userInfoData, weebeeImageData]) => {
          if (userInfoData.success) {
            setUserInfo({
              ...userInfoData.data,
              weebeeImageName: weebeeImageData.imageName,
            })
          }
        })
        .catch((err) => console.error("사용자 데이터 로딩 실패:", err))
        .finally(() => setLoadingUserInfo(false))
    }
  }, [isAuthenticated, loading])

  // ★ 리더보드 로드
  useEffect(() => {
    if (isAuthenticated) {
      setLoadingLb(true)
      getLeaderboard(0, 5)
        .then((page) => setLeaderboard(page))
        .catch((err) => console.error("리더보드 로딩 실패:", err))
        .finally(() => setLoadingLb(false))
    }
  }, [isAuthenticated])

  if (loading || loadingUserInfo) {
    return <div className="flex justify-center items-center min-h-[60vh]">로딩 중...</div>
  }

  return (
    <div className="flex flex-col items-center">
      {!isAuthenticated ? (
        <div className="text-center py-20">
          <h1 className="text-3xl font-bold mb-10">빈 공간</h1>
        </div>
      ) : (
        <div className="w-full max-w-6xl">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* ── 사용자 정보 */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-4">
                  {userInfo?.nickname || "사용자"} 님
                </h2>
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
                          e.currentTarget.src = "/placeholder.svg?height=200&width=200"
                        }}
                      />
                    </div>
                  ) : (
                    <p className="text-gray-500">캐릭터 이미지가 없습니다</p>
                  )}
                </div>
              </div>

              {/* ── 명언·최근퀴즈·랭크·리더보드 */}
              <div className="flex-1 space-y-6">
                <Quote />
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold mb-2">
                    현재 랭크:{" "}
                    <span className="text-emerald-600">
                      {userInfo?.userrank || "랭크 정보 없음"}
                    </span>
                  </p>
                  <RecentQuiz quizResults={userInfo?.quizResults || []} />
                </div>

                {/* ★ 리더보드 섹션 */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">리더보드 (Top 5)</h3>

                  {loadingLb ? (
                    <p>로딩 중...</p>
                  ) : leaderboard && leaderboard.content.length > 0 ? (
                    <ol className="list-decimal list-inside space-y-1">
                      {leaderboard.content.map((item, idx) => (
                        <li
                          key={item.userId}
                          className="flex justify-between text-sm"
                        >
                          <span>
                            {idx + 1}. {item.nickname}
                          </span>
                          <span className="font-medium">{item.statSum}점</span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-gray-500">표시할 리더보드가 없습니다.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
