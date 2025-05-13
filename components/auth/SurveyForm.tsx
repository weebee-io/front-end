"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"

// 설문조사 데이터 타입
type SurveyData = {
  assetType: number
  investResource: number
  creditScore: number
  delinquentCount: number
  debtRatio: number
  consumptionScore: number
  digitalFriendly: number
  finKnowScore: number
}

// 소비 습관 질문
const consumptionQuestions = [
  {
    id: "consumption1",
    question: "월 소득 중 저축하는 비율은 어느 정도인가요?",
    options: [
      { value: 1, label: "10% 미만" },
      { value: 2, label: "10~20%" },
      { value: 3, label: "20~30%" },
      { value: 4, label: "30% 이상" },
    ],
  },
  {
    id: "consumption2",
    question: "충동구매를 하는 빈도는 어느 정도인가요?",
    options: [
      { value: 4, label: "거의 없음" },
      { value: 3, label: "가끔 (월 1-2회)" },
      { value: 2, label: "자주 (주 1-2회)" },
      { value: 1, label: "매우 자주 (주 3회 이상)" },
    ],
  },
  {
    id: "consumption3",
    question: "예산 계획을 세우고 지출을 관리하나요?",
    options: [
      { value: 4, label: "항상 예산을 세우고 철저히 지킴" },
      { value: 3, label: "예산을 세우지만 가끔 초과함" },
      { value: 2, label: "대략적인 예산만 있음" },
      { value: 1, label: "예산 계획 없이 지출함" },
    ],
  },
]

// 금융 지식 질문
const finKnowQuestions = [
  {
    id: "finknow1",
    question: "복리 이자란 무엇인가요?",
    options: [
      { value: 0, label: "원금에만 이자가 붙는 것" },
      { value: 1, label: "원금과 이자에 이자가 붙는 것" },
      { value: 0, label: "이자에만 이자가 붙는 것" },
      { value: 0, label: "잘 모르겠음" },
    ],
  },
  {
    id: "finknow2",
    question: "인플레이션이 높을 때 돈의 가치는 어떻게 되나요?",
    options: [
      { value: 0, label: "증가한다" },
      { value: 1, label: "감소한다" },
      { value: 0, label: "변화 없다" },
      { value: 0, label: "잘 모르겠음" },
    ],
  },
  {
    id: "finknow3",
    question: "주식과 채권 중 일반적으로 더 위험한 투자는?",
    options: [
      { value: 1, label: "주식" },
      { value: 0, label: "채권" },
      { value: 0, label: "둘 다 동일함" },
      { value: 0, label: "잘 모르겠음" },
    ],
  },
  {
    id: "finknow4",
    question: "분산 투자의 주요 목적은 무엇인가요?",
    options: [
      { value: 0, label: "수익 극대화" },
      { value: 1, label: "위험 감소" },
      { value: 0, label: "세금 절감" },
      { value: 0, label: "잘 모르겠음" },
    ],
  },
  {
    id: "finknow5",
    question: "ETF는 무엇의 약자인가요?",
    options: [
      { value: 0, label: "Electronic Trading Fund" },
      { value: 0, label: "Extra Tax Freedom" },
      { value: 1, label: "Exchange Traded Fund" },
      { value: 0, label: "잘 모르겠음" },
    ],
  },
  {
    id: "finknow6",
    question: "신용점수에 가장 큰 영향을 미치는 요소는?",
    options: [
      { value: 0, label: "소득 수준" },
      { value: 1, label: "상환 이력" },
      { value: 0, label: "보유 계좌 수" },
      { value: 0, label: "잘 모르겠음" },
    ],
  },
  {
    id: "finknow7",
    question: "연금과 적금의 주요 차이점은?",
    options: [
      { value: 0, label: "이자율의 차이" },
      { value: 0, label: "가입 기간의 차이" },
      { value: 1, label: "목적과 세제 혜택의 차이" },
      { value: 0, label: "잘 모르겠음" },
    ],
  },
  {
    id: "finknow8",
    question: "주택담보대출의 LTV란?",
    options: [
      { value: 1, label: "대출금액/주택가격 비율" },
      { value: 0, label: "월 상환액/소득 비율" },
      { value: 0, label: "대출 이자율" },
      { value: 0, label: "잘 모르겠음" },
    ],
  },
  {
    id: "finknow9",
    question: "다음 중 세금 공제 항목이 아닌 것은?",
    options: [
      { value: 0, label: "의료비" },
      { value: 0, label: "교육비" },
      { value: 1, label: "여행 경비" },
      { value: 0, label: "기부금" },
    ],
  },
  {
    id: "finknow10",
    question: "퇴직연금 중 확정급여형(DB)과 확정기여형(DC)의 차이는?",
    options: [
      { value: 0, label: "가입 대상의 차이" },
      { value: 1, label: "급여 산정 방식의 차이" },
      { value: 0, label: "운용 기관의 차이" },
      { value: 0, label: "잘 모르겠음" },
    ],
  },
]

type SurveyFormProps = {
  onSubmit: (data: SurveyData) => void
}

export function SurveyForm({ onSubmit }: SurveyFormProps) {
  // 설문 단계 (0: 자산 및 신용 정보, 1: 소비 습관, 2: 금융 지식)
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  // 설문 응답 데이터
  const [surveyData, setSurveyData] = useState<SurveyData>({
    assetType: 0,
    investResource: 0,
    creditScore: 0,
    delinquentCount: 0,
    debtRatio: 0,
    consumptionScore: 0,
    digitalFriendly: 0,
    finKnowScore: 0,
  })

  // 소비 습관 응답
  const [consumptionAnswers, setConsumptionAnswers] = useState<Record<string, number>>({})

  // 금융 지식 응답
  const [finKnowAnswers, setFinKnowAnswers] = useState<Record<string, number>>({})

  // 입력 필드 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSurveyData((prev) => ({
      ...prev,
      [name]: Number.parseInt(value) || 0,
    }))
  }

  // 소비 습관 응답 처리
  const handleConsumptionAnswer = (questionId: string, value: number) => {
    setConsumptionAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  // 금융 지식 응답 처리
  const handleFinKnowAnswer = (questionId: string, value: number) => {
    setFinKnowAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  // 다음 단계로 이동
  const handleNextStep = () => {
    if (step === 0) {
      // 자산 및 신용 정보 단계에서 소비 습관 단계로
      setStep(1)
    } else if (step === 1) {
      // 소비 습관 점수 계산
      const consumptionTotal = Object.values(consumptionAnswers).reduce((sum, score) => sum + score, 0)
      setSurveyData((prev) => ({
        ...prev,
        consumptionScore: consumptionTotal,
      }))
      setStep(2)
    }
  }

  // 이전 단계로 이동
  const handlePrevStep = () => {
    setStep((prev) => Math.max(0, prev - 1))
  }

  // 설문 제출
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // 금융 지식 점수 계산
    const finKnowTotal = Object.values(finKnowAnswers).reduce((sum, score) => sum + score, 0)

    // 최종 데이터 준비
    const finalData = {
      ...surveyData,
      finKnowScore: finKnowTotal,
    }

    onSubmit(finalData)
    setLoading(false)
  }

  // 진행 상태 계산
  const progress = step === 0 ? 33 : step === 1 ? 66 : 100

  return (
    <div className="space-y-6">
      <Progress value={progress} className="h-2" />

      <form onSubmit={handleSubmit}>
        {/* 자산 및 신용 정보 단계 */}
        {step === 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">자산 및 신용 정보</h3>

            <div className="space-y-2">
              <Label htmlFor="assetType">자산 유형 (0-5)</Label>
              <Input
                id="assetType"
                name="assetType"
                type="number"
                min="0"
                max="5"
                value={surveyData.assetType || ""}
                onChange={handleInputChange}
                required
                placeholder="자산 유형을 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="investResource">투자 자원 (0-5)</Label>
              <Input
                id="investResource"
                name="investResource"
                type="number"
                min="0"
                max="5"
                value={surveyData.investResource || ""}
                onChange={handleInputChange}
                required
                placeholder="투자 자원을 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="creditScore">신용 점수 (0-1000)</Label>
              <Input
                id="creditScore"
                name="creditScore"
                type="number"
                min="0"
                max="1000"
                value={surveyData.creditScore || ""}
                onChange={handleInputChange}
                required
                placeholder="신용 점수를 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delinquentCount">연체 횟수</Label>
              <Input
                id="delinquentCount"
                name="delinquentCount"
                type="number"
                min="0"
                value={surveyData.delinquentCount || ""}
                onChange={handleInputChange}
                required
                placeholder="연체 횟수를 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="debtRatio">부채 비율 (%)</Label>
              <Input
                id="debtRatio"
                name="debtRatio"
                type="number"
                min="0"
                max="100"
                value={surveyData.debtRatio || ""}
                onChange={handleInputChange}
                required
                placeholder="부채 비율을 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="digitalFriendly">디지털 친화도 (0-5)</Label>
              <Input
                id="digitalFriendly"
                name="digitalFriendly"
                type="number"
                min="0"
                max="5"
                value={surveyData.digitalFriendly || ""}
                onChange={handleInputChange}
                required
                placeholder="디지털 친화도를 입력하세요"
              />
            </div>

            <Button type="button" onClick={handleNextStep} className="w-full">
              다음 단계
            </Button>
          </div>
        )}

        {/* 소비 습관 단계 */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">소비 습관</h3>

            {consumptionQuestions.map((q) => (
              <Card key={q.id} className="p-4">
                <p className="font-medium mb-3">{q.question}</p>
                <RadioGroup
                  value={consumptionAnswers[q.id]?.toString()}
                  onValueChange={(value) => handleConsumptionAnswer(q.id, Number.parseInt(value))}
                >
                  <div className="space-y-2">
                    {q.options.map((option, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value.toString()} id={`${q.id}-${idx}`} />
                        <Label htmlFor={`${q.id}-${idx}`}>{option.label}</Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </Card>
            ))}

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={handlePrevStep}>
                이전 단계
              </Button>
              <Button
                type="button"
                onClick={handleNextStep}
                disabled={Object.keys(consumptionAnswers).length < consumptionQuestions.length}
              >
                다음 단계
              </Button>
            </div>
          </div>
        )}

        {/* 금융 지식 단계 */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">금융 지식 테스트</h3>

            {finKnowQuestions.map((q) => (
              <Card key={q.id} className="p-4">
                <p className="font-medium mb-3">{q.question}</p>
                <RadioGroup
                  value={finKnowAnswers[q.id]?.toString()}
                  onValueChange={(value) => handleFinKnowAnswer(q.id, Number.parseInt(value))}
                >
                  <div className="space-y-2">
                    {q.options.map((option, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value.toString()} id={`${q.id}-${idx}`} />
                        <Label htmlFor={`${q.id}-${idx}`}>{option.label}</Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </Card>
            ))}

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={handlePrevStep}>
                이전 단계
              </Button>
              <Button type="submit" disabled={loading || Object.keys(finKnowAnswers).length < finKnowQuestions.length}>
                {loading ? "제출 중..." : "회원가입 완료"}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
