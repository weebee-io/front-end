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
  risk_profile_score: number
  complex_product_flag: number
  is_married: number
  essential_pct: number
  discretionary_pct: number
  sav_inv_ratio: number
  spend_volatility: number
  digital_engagement: number
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
    risk_profile_score: 0,
    complex_product_flag: 0,
    is_married: 0,
    essential_pct: 0,
    discretionary_pct: 0,
    sav_inv_ratio: 0,
    spend_volatility: 0,
    digital_engagement: 0,
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
        essential_pct: consumptionTotal,
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


    onSubmit(surveyData)
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
            <h3 className="text-lg font-medium">기본 정보</h3>

            <div className="space-y-2">
              <Label htmlFor="risk_profile_score">본인의 투자 위험 성향 (1~10)</Label>
              <Input
                id="risk_profile_score"
                name="risk_profile_score"
                type="number"
                min="1"
                max="10"
                value={surveyData.risk_profile_score || ""}
                onChange={handleInputChange}
                required
                placeholder="1(매우 안정) ~ 10(매우 공격)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="complex_product_flag">복합 금융상품(ELS, DLS 등) 보유 여부</Label>
              <RadioGroup
                value={surveyData.complex_product_flag?.toString() || ""}
                onValueChange={(value) => setSurveyData(prev => ({ ...prev, complex_product_flag: Number(value) }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="complex_product_yes" />
                  <Label htmlFor="complex_product_yes">예</Label>
                  <RadioGroupItem value="0" id="complex_product_no" />
                  <Label htmlFor="complex_product_no">아니오</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="is_married">결혼 여부</Label>
              <RadioGroup
                value={surveyData.is_married?.toString() || ""}
                onValueChange={(value) => setSurveyData(prev => ({ ...prev, is_married: Number(value) }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="married_yes" />
                  <Label htmlFor="married_yes">예</Label>
                  <RadioGroupItem value="0" id="married_no" />
                  <Label htmlFor="married_no">아니오</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="essential_pct">월 소득 중 필수 소비 비율 (%)</Label>
              <Input
                id="essential_pct"
                name="essential_pct"
                type="number"
                min="0"
                max="100"
                value={surveyData.essential_pct || ""}
                onChange={handleInputChange}
                required
                placeholder="예: 50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discretionary_pct">월 소득 중 재량 소비 비율 (%)</Label>
              <Input
                id="discretionary_pct"
                name="discretionary_pct"
                type="number"
                min="0"
                max="100"
                value={surveyData.discretionary_pct || ""}
                onChange={handleInputChange}
                required
                placeholder="예: 30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="digital_engagement">디지털 금융 서비스 사용 빈도 (1~5)</Label>
              <Input
                id="digital_engagement"
                name="digital_engagement"
                type="number"
                min="1"
                max="5"
                value={surveyData.digital_engagement || ""}
                onChange={handleInputChange}
                required
                placeholder="1(전혀 안함) ~ 5(매우 자주)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="spend_volatility">월별 소비 변동성 (0~1)</Label>
              <Input
                id="spend_volatility"
                name="spend_volatility"
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={surveyData.spend_volatility || ""}
                onChange={handleInputChange}
                required
                placeholder="예: 0.2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sav_inv_ratio">저축 대비 투자 비율 (%)</Label>
              <Input
                id="sav_inv_ratio"
                name="sav_inv_ratio"
                type="number"
                min="0"
                max="100"
                value={surveyData.sav_inv_ratio || ""}
                onChange={handleInputChange}
                required
                placeholder="예: 40"
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
