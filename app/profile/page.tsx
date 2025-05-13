"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { getUserStats } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserStatsChart } from "@/components/profile/UserStatsChart"
import Image from "next/image"

// 사용자 스탯 타입
type UserStats = {
  stats: {
    statsId: number
    investStat: number
    creditStat: number
    fiStat: number
    statSum: number
    weebeeImageName: string
  }
  userRank: string
}

export default function ProfilePage() {
  const { isAuthenticated, loading } = useAuth()
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // 인증 상태 확인 후 리다이렉트 또는 데이터 로드
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/")
      } else {
        // 사용자 스탯 로드
        setLoadingStats(true)
        getUserStats()
          .then((data) => {
            setUserStats(data)
          })
          .catch((err) => console.error("스탯 로딩 실패:", err))
          .finally(() => setLoadingStats(false))
      }
    }
  }, [isAuthenticated, loading, router])

  // 로딩 중일 때 표시할 UI
  if (loading || loadingStats) {
    return <div className="flex justify-center items-center min-h-[60vh]">로딩 중...</div>
  }

  // 인증되지 않은 경우 (리다이렉트 전)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">내 정보</h1>

      {userStats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 캐릭터 이미지 */}
          <Card>
            <CardHeader>
              <CardTitle>내 캐릭터</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="border-2 border-gray-300 rounded-lg h-64 w-64 flex items-center justify-center">
                {userStats.stats.weebeeImageName ? (
                  <Image
                    src={`/images/characters/${userStats.stats.weebeeImageName}.png`}
                    alt="캐릭터 이미지"
                    width={200}
                    height={200}
                    className="object-contain"
                  />
                ) : (
                  <p className="text-gray-500">캐릭터 이미지가 없습니다</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 랭크 및 스탯 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>내 랭크 및 스탯</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">현재 랭크</h3>
                <p className="text-2xl font-bold text-emerald-600">{userStats.userRank}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">스탯 정보</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-500">투자 스탯</p>
                      <p className="text-xl font-semibold">{userStats.stats.investStat}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-500">신용 스탯</p>
                      <p className="text-xl font-semibold">{userStats.stats.creditStat}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-500">금융 스탯</p>
                      <p className="text-xl font-semibold">{userStats.stats.fiStat}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-500">총합</p>
                      <p className="text-xl font-semibold">{userStats.stats.statSum}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 스탯 차트 */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>스탯 차트</CardTitle>
            </CardHeader>
            <CardContent>
              <UserStatsChart stats={userStats.stats} />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">스탯 정보를 불러올 수 없습니다.</p>
        </div>
      )}
    </div>
  )
}
