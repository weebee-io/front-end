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
    getLeaderboard(page, pageSize)
      .then((json: Page<LeaderboardDto>) => {
        setData(json.content)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page])

  if (loading) {
    return <div className="p-8 text-center">로딩 중...</div>
  }

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold text-center">리더보드</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded-lg">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="px-4 py-2 text-center">순위</th>
              <th className="px-4 py-2 text-left">닉네임</th>
              <th className="px-4 py-2 text-right">스텟 합계</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={row.userId}
                className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                <td className="border px-4 py-2 text-center">{page * pageSize + idx + 1}</td>
                <td className="border px-4 py-2">{row.nickname}</td>
                <td className="border px-4 py-2 text-right font-semibold">
                  {row.statSum}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 간단 페이지 네비게이션 */}
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
