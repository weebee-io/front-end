"use client"

import { useEffect, useState } from "react"

// 금융 관련 명언 목록
const FINANCIAL_QUOTES = [
  "투자의 성공은 시간에 달려있지, 타이밍에 달려있지 않다. - 워렌 버핏",
  "돈을 벌기는 쉽지만, 돈을 지키기는 어렵다. - 앤드류 카네기",
  "저축은 미래의 자신에게 주는 선물이다. - 익명",
  "투자에서 가장 중요한 것은 감정 조절이다. - 벤저민 그레이엄",
  "부자가 되는 방법은 수입보다 적게 쓰는 것이다. - 리처드 템플러",
  "돈은 좋은 하인이지만 나쁜 주인이다. - 프랜시스 베이컨",
  "투자는 미래에 대한 믿음이다. - 익명",
  "복리는 세상에서 가장 강력한 힘이다. - 알버트 아인슈타인",
  "돈을 잃으면 조금 잃은 것이고, 명예를 잃으면 많이 잃은 것이며, 용기를 잃으면 모든 것을 잃은 것이다. - 괴테",
  "돈은 당신이 원하는 것을 살 수 있지만, 행복은 살 수 없다. - 익명",
]

export function Quote() {
  const [quote, setQuote] = useState("")

  useEffect(() => {
    // 랜덤 명언 선택
    const randomIndex = Math.floor(Math.random() * FINANCIAL_QUOTES.length)
    setQuote(FINANCIAL_QUOTES[randomIndex])
  }, [])

  return (
    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
      <h3 className="text-lg font-semibold mb-2">오늘의 금융 명언</h3>
      <p className="italic text-gray-700">{quote}</p>
    </div>
  )
}
