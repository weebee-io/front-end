"use client"

import { useEffect, useRef } from "react"

type Stats = {
  investStat: number
  creditStat: number
  fiStat: number
  newsStat: number
  luckStat: number
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
    const size = 500
    canvas.width = size
    canvas.height = size

    // 최대 스탯 값 (차트 스케일링용)
    const maxStat = 400

    // 중심점
    const centerX = size / 2
    const centerY = size / 2

    // 반지름
    const radius = size * 0.35

    // 오각형의 각 꼭지점의 각도 (라디안)
    const angles = [
      Math.PI / 2,                        // 상단 (투자)
      Math.PI / 2 - (2 * Math.PI) / 5,    // 우상단 (신용)
      Math.PI / 2 - (4 * Math.PI) / 5,    // 우하단 (금융)
      Math.PI / 2 - (6 * Math.PI) / 5,    // 좌하단 (뉴스)
      Math.PI / 2 - (8 * Math.PI) / 5     // 좌상단 (운)
    ]

    // 중심에서 꼭지점으로 가는 가이드 라인 그리기
    ctx.strokeStyle = "rgba(209, 213, 219, 0.5)"
    ctx.lineWidth = 1
    
    angles.forEach(angle => {
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      const x = centerX + radius * Math.cos(angle)
      const y = centerY - radius * Math.sin(angle)
      ctx.lineTo(x, y)
      ctx.stroke()
    })

    // 동심원 형태의 오각형 그리기 (레벨별 격자)
    const gridLevels = 5 // 격자 수준 수
    
    for (let level = 1; level <= gridLevels; level++) {
      const levelRadius = (radius * level) / gridLevels
      
      ctx.beginPath()
      angles.forEach((angle, i) => {
        const x = centerX + levelRadius * Math.cos(angle)
        const y = centerY - levelRadius * Math.sin(angle)
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.closePath()
      ctx.strokeStyle = "rgba(209, 213, 219, 0.5)"
      ctx.stroke()
    }
    
    // 배경 오각형 그리기 (최대치)
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
    ctx.fillStyle = "rgba(229, 231, 235, 0.3)" // 연한 회색 배경
    ctx.fill()
    ctx.strokeStyle = "rgb(209, 213, 219)"
    ctx.lineWidth = 2
    ctx.stroke()

    // 현재 스탯 오각형 그리기
    const statValues = [
      stats.investStat / maxStat,  // 투자 스탯 (0~1 사이 값)
      stats.creditStat / maxStat,  // 신용 스탯 (0~1 사이 값)
      stats.fiStat / maxStat,      // 금융 스탯 (0~1 사이 값)
      (stats.newsStat || 0) / maxStat,  // 뉴스 스탯 (0~1 사이 값)
      (stats.luckStat || 0) / maxStat   // 운 스탯 (0~1 사이 값)
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
    // 그라디언트 색상 생성
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, radius
    )
    gradient.addColorStop(0, "rgba(16, 185, 129, 0.7)")
    gradient.addColorStop(1, "rgba(5, 150, 105, 0.3)")
    
    ctx.fillStyle = gradient
    ctx.fill()
    ctx.strokeStyle = "rgb(5, 150, 105)"
    ctx.lineWidth = 2.5
    ctx.stroke()

    // 라벨 그리기
    ctx.font = "14px sans-serif"
    ctx.fillStyle = "black"
    ctx.textAlign = "center"

    // 투자 라벨
    const investX = centerX + (radius + 30) * Math.cos(angles[0])
    const investY = centerY - (radius + 30) * Math.sin(angles[0])
    ctx.fillText(`투자 (${stats.investStat})`, investX, investY)

    // 신용 라벨
    const creditX = centerX + (radius + 40) * Math.cos(angles[1])
    const creditY = centerY - (radius + 40) * Math.sin(angles[1])
    ctx.fillText(`신용 (${stats.creditStat})`, creditX, creditY)

    // 금융 라벨
    const fiX = centerX + (radius + 40) * Math.cos(angles[2])
    const fiY = centerY - (radius + 40) * Math.sin(angles[2])
    ctx.fillText(`금융 (${stats.fiStat})`, fiX, fiY)

    // 뉴스 라벨
    const newsX = centerX + (radius + 40) * Math.cos(angles[3])
    const newsY = centerY - (radius + 40) * Math.sin(angles[3])
    ctx.fillText(`뉴스 (${stats.newsStat || 0})`, newsX, newsY)

    // 운 라벨
    const luckX = centerX + (radius + 40) * Math.cos(angles[4])
    const luckY = centerY - (radius + 40) * Math.sin(angles[4])
    ctx.fillText(`운 (${stats.luckStat || 0})`, luckX, luckY)
  }, [stats])

  return (
    <div className="flex justify-center">
      <canvas ref={canvasRef} className="max-w-full h-auto" />
    </div>
  )
}
