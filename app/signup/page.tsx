"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BasicInfoForm } from "@/components/auth/BasicInfoForm"
import { SurveyForm } from "@/components/auth/SurveyForm"

// 회원가입 단계
type SignupStep = "basic-info" | "survey"

export default function SignupPage() {
  const [step, setStep] = useState<SignupStep>("basic-info")
  const [basicInfo, setBasicInfo] = useState({
    id: "",
    password: "",
    nickname: "",
    name: "",
    gender: "",
    age: 0,
    userRank: "BRONZE", // 기본값
  })
  const [error, setError] = useState("")
  const router = useRouter()

  // 기본 정보 제출 처리
  const handleBasicInfoSubmit = async (data: typeof basicInfo) => {
    try {
      const response = await fetch("http://localhost:8080/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        // 기본 정보 저장 및 다음 단계로 이동
        setBasicInfo(data)
        setStep("survey")
      } else {
        setError(result.message || "회원가입 중 오류가 발생했습니다.")
      }
    } catch (err) {
      setError("서버 연결 중 오류가 발생했습니다.")
    }
  }

  // 설문조사 제출 처리
  const handleSurveySubmit = async (surveyData: any) => {
    try {
      const response = await fetch("http://localhost:8080/surveys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(surveyData),
      })

      const result = await response.json()

      if (result.success) {
        // 회원가입 완료 후 로그인 페이지로 이동
        router.push("/login?signup=success")
      } else {
        setError(result.message || "설문조사 제출 중 오류가 발생했습니다.")
      }
    } catch (err) {
      setError("서버 연결 중 오류가 발생했습니다.")
    }
  }

  return (
    <div className="flex justify-center items-center py-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">회원가입</CardTitle>
          <CardDescription>
            {step === "basic-info" ? "기본 정보를 입력해주세요." : "금융 관련 설문조사에 응답해주세요."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === "basic-info" ? (
            <BasicInfoForm initialData={basicInfo} onSubmit={handleBasicInfoSubmit} />
          ) : (
            <SurveyForm onSubmit={handleSurveySubmit} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
