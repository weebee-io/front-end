// app/leaderboard/page.tsx
"use client"

import { useEffect, useState } from "react"
import { getLeaderboard } from "@/lib/api"
import { LeaderboardDto, Page } from "@/lib/types"

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardDto[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const pageSize = 10

  useEffect(() => {
    setLoading(true)
    getLeaderboard(0, pageSize + 3) // 상위 3명 + 페이지 크기
      .then((json: Page<LeaderboardDto>) => {
        setData(json.content)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page])

  if (loading) {
    return <div className="p-8 text-center">로딩 중...</div>
  }

  // 상위 3명과 나머지 리더보드 분리
  const topThree = data.slice(0, 3)
  const restOfBoard = data.slice(3)

  return (
    <div className="max-w-5xl mx-auto py-8 flex flex-col gap-24">
      <h1 className="text-3xl font-bold text-center">리더보드</h1>

      {/* Top 3 특별 디자인 */}
      <div className="bg-gradient-to-b from-blue-50 to-blue-100 p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-8">명예의 전당</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {/* 2등 */}
          {topThree.length > 1 && (
            <div className="w-72 text-center">
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-silver mx-auto flex items-center justify-center relative z-10 shadow-lg">
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
                <div className="absolute top-20 left-0 right-0 bg-white p-4 pt-12 rounded-lg shadow-md z-0">
                  <p className="font-bold text-lg mt-2 truncate px-2">{topThree[1]?.nickname || "-"}</p>
                  <p className="text-xl font-bold text-yellow-500">{topThree[1]?.statSum || 0}</p>
                </div>
              </div>
            </div>
          )}

          {/* 1등 */}
          {topThree.length > 0 && (
            <div className="w-72 text-center -mt-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gold mx-auto flex items-center justify-center relative z-10 shadow-lg">
                  <span className="text-4xl font-bold text-white">1</span>
                </div>
                <div className="absolute top-24 left-0 right-0 bg-white p-4 pt-12 rounded-lg shadow-md z-0">
                  <p className="font-bold text-lg mt-2 truncate px-2">{topThree[0]?.nickname || "-"}</p>
                  <p className="text-xl font-bold text-yellow-500">{topThree[0]?.statSum || 0}</p>
                </div>
              </div>
            </div>
          )}

          {/* 3등 */}
          {topThree.length > 2 && (
            <div className="w-72 text-center">
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-bronze mx-auto flex items-center justify-center relative z-10 shadow-lg">
                  <span className="text-3xl font-bold text-white">3</span>
                </div>
                <div className="absolute top-20 left-0 right-0 bg-white p-4 pt-12 rounded-lg shadow-md z-0">
                  <p className="font-bold text-lg mt-2 truncate px-2">{topThree[2]?.nickname || "-"}</p>
                  <p className="text-xl font-bold text-yellow-500">{topThree[2]?.statSum || 0}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 나머지 리더보드 (테이블 형식) */}
      <div className="overflow-x-auto border-t-4 border-gray-200 pt-10 mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">순위표</h2>
        <table className="min-w-full bg-white shadow rounded-lg table-fixed">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="px-4 py-2 text-center w-1/6">순위</th>
              <th className="px-4 py-2 text-left w-3/6">닉네임</th>
              <th className="px-4 py-2 text-right w-2/6">스탯 합계</th>
            </tr>
          </thead>
          <tbody>
            {restOfBoard.map((row, idx) => (
              <tr
                key={row.userId}
                className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                <td className="border px-4 py-2 text-center w-1/6">{idx + 4}</td>
                <td className="border px-4 py-2 truncate w-3/6">{row.nickname}</td>
                <td className="border px-4 py-2 text-right font-semibold w-2/6">
                  {row.statSum}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-between">
        <button
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          disabled={page === 0}
          onClick={() => setPage((p) => p - 1)}
        >
          이전
        </button>
        <button
          className="px-4 py-2 bg-gray-200 rounded"
          onClick={() => setPage((p) => p + 1)}
        >
          다음
        </button>
      </div>
    </div>
  )
}
