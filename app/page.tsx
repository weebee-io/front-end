"use client"

import { useAuth } from "@/components/auth/AuthProvider"
import { useEffect, useState } from "react"
import Image from "next/image"
import { getUserInfo, getWeebeeImage, getLeaderboard } from "@/lib/api"
import { Quote } from "@/components/home/Quote"
import { RecentQuiz } from "@/components/home/RecentQuiz"
import type { LeaderboardDto, Page } from "@/lib/types"
import Link from "next/link"
import { Button } from "@/components/ui/button"

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
        <>
          {/* 상단에 우리FISA 추가 */}
          <div className="w-full bg-white py-4 mb-6">
            <div className="max-w-6xl mx-auto px-4">
              <h1 className="text-3xl font-bold text-black">우리FISA</h1>
            </div>
          </div>
        <div className="flex flex-col items-center w-full max-w-6xl py-12 px-4">
          {/* 상단: 이미지 영역 */}
          <div className="w-full mb-12 flex justify-center">
            <div className="relative w-full max-w-md h-[300px]">
              <Image 
                src="/images/characters/weebeefriends2.png" 
                alt="캐릭터 이미지"
                fill
                className="object-contain pixelated"
              />
            </div>
          </div>
          
          {/* 하단: 텍스트와 버튼 영역 */}
          <div className="w-full max-w-2xl text-center px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-black">
              AI를 활용한 손쉬운 금융 공부!
            </h1>
            <p className="text-xl mb-8 text-gray-700">
              재미있고 효과적인 방식으로 금융 지식을 배워보세요. 퀴즈와 함께 실력을 키우고 랭킹에 도전하세요!
            </p>
            
            <div className="flex flex-col space-y-4 max-w-xs mx-auto">
              <Link href="/signup" className="w-full">
                <button className="w-full py-4 text-lg rounded-xl bg-green-500 hover:bg-green-600 text-white transition-colors duration-200 shadow-md">
                  시작하기
                </button>
              </Link>
              
              <Link href="/login" className="w-full">
                <button className="w-full py-4 text-lg rounded-xl bg-white hover:bg-gray-100 text-blue-500 border border-gray-200 transition-colors duration-200 shadow-sm">
                  계정이 이미 있습니다
                </button>
              </Link>
            </div>
          </div>
        </div>
        </>
      ) : (
        <div className="w-full max-w-6xl">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* ── 사용자 정보 */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-4">
                  {userInfo?.nickname || "사용자"} 님
                </h2>
                <div className="rounded-lg h-64 w-full flex items-center justify-center">
                  {userInfo?.weebeeImageName ? (
                    <div className="relative h-full w-full">
                      <Image
                        src={`/images/characters/${userInfo.weebeeImageName}.png`}
                        alt="캐릭터 이미지"
                        width={200}
                        height={200}
                        className="object-contain pixelated object-center mx-auto"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=200&width=200"
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-2 text-center w-full">금융 스텟에 따라 캐릭터가 바뀝니다!</p>
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
