"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { useAuth } from "@/components/auth/AuthProvider"
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
    userRank: "", // 기본값
  })
  const [error, setError] = useState("")
  const router = useRouter()
  const { login } = useAuth();

  // 기본 정보 제출 처리
  const handleBasicInfoSubmit = async (data: typeof basicInfo) => {
    try {
      const response = await fetch("http://localhost:8085/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        // 회원가입 성공 시 바로 로그인 처리
        const loginResult = await login(data.id, data.password);
        if (loginResult.success) {
          setBasicInfo(data)
          setStep("survey")
        } else {
          setError("회원가입은 성공했으나 자동 로그인에 실패했습니다: " + loginResult.message)
        }
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
      const token = Cookies.get("jwt_token");

      // 1. 회원 스텟 초기화
      const initStatsRes = await fetch("http://localhost:8085/stats/statsInit", {
        method: "GET",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      const initStatsResult = await initStatsRes.json();
      if (!initStatsResult.success) {
        setError(initStatsResult.message || "회원 스텟 초기화 중 오류가 발생했습니다.");
        return;
      }

      // 2. 설문조사 제출
      const response = await fetch("http://localhost:8085/surveys", {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(surveyData),
      })
      console.log(response)
      console.log(JSON.stringify(surveyData))
      const responseResult = await response.json();
      if (!responseResult.success) {
        setError(responseResult.message || "설문조사 제출 중 오류가 발생했습니다.")
        return;
      }


      // 3. ML 클러스터링 API 호출
      const mlRes = await fetch("http://localhost:8085/ml/clusteringwithKafka", {
        method: "GET",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        //body: JSON.stringify(surveyData),
      });
      const mlResult = await mlRes.json();
      if (!mlResult.success) {
        setError(mlResult.message || "ML 클러스터링 중 오류가 발생했습니다.");
        return;
      }

      // 모든 과정 성공 시 완료 페이지로 이동
      router.push("/login?signup=success");
    } catch (err) {
      setError("서버 연결 중 오류가 발생했습니다."+err);
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
