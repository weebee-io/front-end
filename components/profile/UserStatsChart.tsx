"use client"

import { useEffect, useRef } from "react"

type Stats = {
  investStat: number
  creditStat: number
  fiStat: number
  statSum: number
  statsId: number
  weebeeImageName: string
}

export function UserStatsChart({ stats }: { stats: Stats }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // 캔버스 크기 설정
    const size = 300
    canvas.width = size
    canvas.height = size

    // 최대 스탯 값 (차트 스케일링용)
    const maxStat = 100

    // 중심점
    const centerX = size / 2
    const centerY = size / 2

    // 반지름
    const radius = size * 0.4

    // 삼각형 각 꼭지점의 각도 (라디안)
    const angles = [
      Math.PI / 2, // 상단 (투자)
      Math.PI / 2 + (2 * Math.PI) / 3, // 좌하단 (신용)
      Math.PI / 2 + (4 * Math.PI) / 3, // 우하단 (금융)
    ]

    // 배경 삼각형 그리기 (최대치)
    ctx.beginPath()
    angles.forEach((angle, i) => {
      const x = centerX + radius * Math.cos(angle)
      const y = centerY - radius * Math.sin(angle)
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.closePath()
    ctx.fillStyle = "rgba(229, 231, 235, 0.5)" // 연한 회색
    ctx.fill()
    ctx.strokeStyle = "rgb(209, 213, 219)"
    ctx.stroke()

    // 현재 스탯 삼각형 그리기
    const statValues = [
      stats.investStat / maxStat, // 투자 스탯 (0~1 사이 값)
      stats.creditStat / maxStat, // 신용 스탯 (0~1 사이 값)
      stats.fiStat / maxStat, // 금융 스탯 (0~1 사이 값)
    ]

    ctx.beginPath()
    angles.forEach((angle, i) => {
      const ratio = statValues[i]
      const x = centerX + radius * ratio * Math.cos(angle)
      const y = centerY - radius * ratio * Math.sin(angle)
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.closePath()
    ctx.fillStyle = "rgba(16, 185, 129, 0.3)" // 연한 녹색
    ctx.fill()
    ctx.strokeStyle = "rgb(5, 150, 105)"
    ctx.lineWidth = 2
    ctx.stroke()

    // 라벨 그리기
    ctx.font = "14px sans-serif"
    ctx.fillStyle = "black"
    ctx.textAlign = "center"

    // 투자 라벨
    const investX = centerX + (radius + 20) * Math.cos(angles[0])
    const investY = centerY - (radius + 20) * Math.sin(angles[0])
    ctx.fillText(`투자 (${stats.investStat})`, investX, investY)

    // 신용 라벨
    const creditX = centerX + (radius + 20) * Math.cos(angles[1])
    const creditY = centerY - (radius + 20) * Math.sin(angles[1])
    ctx.fillText(`신용 (${stats.creditStat})`, creditX, creditY)

    // 금융 라벨
    const fiX = centerX + (radius + 20) * Math.cos(angles[2])
    const fiY = centerY - (radius + 20) * Math.sin(angles[2])
    ctx.fillText(`금융 (${stats.fiStat})`, fiX, fiY)
  }, [stats])

  return (
    <div className="flex justify-center">
      <canvas ref={canvasRef} className="max-w-full h-auto" />
    </div>
  )
}
