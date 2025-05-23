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
      console.log('회원가입 요청 데이터:', data);
      const response = await fetch("http://localhost:8085/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      
      console.log('회원가입 응답 상태:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('서버 응답 오류:', response.status, errorText);
        throw new Error(`서버 응답 오류: ${response.status} ${errorText}`);
      }
      
      // response를 미리 clone해두고 하나는 json용, 하나는 오류 처리용으로 사용
      const responseClone = response.clone();
      let result;
      try {
        result = await response.json();
        console.log('회원가입 응답 데이터:', result);
      } catch (jsonError) {
        console.error('JSON 파싱 오류:', jsonError);
        try {
          const responseText = await responseClone.text();
          console.log('응답 원본 텍스트:', responseText);
        } catch (textError) {
          console.error('응답 텍스트 가져오기 오류:', textError);
        }
        throw jsonError;
      }

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

      // 2. 설문조사 제출
      console.log('설문조사 요청 데이터:', surveyData);
      const response = await fetch("http://localhost:8085/surveys", {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(surveyData),
      })
      console.log('설문조사 응답 상태:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('설문조사 제출 오류:', response.status, errorText);
        throw new Error(`설문조사 제출 오류: ${response.status} ${errorText}`);
      }
      
      // response를 미리 clone해두고 하나는 json용, 하나는 오류 처리용으로 사용
      const responseClone = response.clone();
      let responseResult;
      try {
        responseResult = await response.json();
        console.log('설문조사 응답 데이터:', responseResult);
      } catch (jsonError) {
        console.error('JSON 파싱 오류 (설문조사):', jsonError);
        try {
          const responseText = await responseClone.text();
          console.log('응답 원본 텍스트 (설문조사):', responseText);
        } catch (textError) {
          console.error('응답 텍스트 가져오기 오류:', textError);
        }
        throw jsonError;
      }
      
      // success 필드가 없어도 userId가 있으면 성공으로 처리
      if (responseResult.userId) {
        console.log('설문조사 성공 - userId:', responseResult.userId);
      } else if (!responseResult.success) {
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
      console.log('ML 클러스터링 응답 상태:', mlRes.status, mlRes.statusText);
      
      if (!mlRes.ok) {
        const errorText = await mlRes.text();
        console.error('ML 클러스터링 오류:', mlRes.status, errorText);
        throw new Error(`ML 클러스터링 오류: ${mlRes.status} ${errorText}`);
      }
      
      // 클러스터링 API는 텍스트 응답을 반환할 수 있으므로 텍스트로 먼저 처리
      try {
        const responseText = await mlRes.text();
        console.log('ML 클러스터링 응답 텍스트:', responseText);
        
        // 텍스트가 JSON인지 확인
        let mlResult;
        try {
          // JSON 형식인지 확인
          mlResult = JSON.parse(responseText);
          console.log('ML 클러스터링 응답 데이터(JSON):', mlResult);
          
          if (mlResult && !mlResult.success) {
            setError(mlResult.message || "ML 클러스터링 중 오류가 발생했습니다.");
            return;
          }
        } catch (jsonError) {
          // JSON이 아닌 경우 - 텍스트 응답이 "클러스터링 요청 완료"와 같은 메시지인 경우 성공으로 처리
          console.log('ML 클러스터링 응답은 JSON이 아닌 텍스트입니다:', responseText);
          if (responseText.includes('클러스터링') && responseText.includes('완료')) {
            // 클러스터링 완료 메시지를 받았으므로 성공으로 처리
            console.log('ML 클러스터링 요청이 성공적으로 처리되었습니다.');
          } else {
            // 예상치 못한 텍스트 응답인 경우 오류로 처리
            throw new Error(`ML 클러스터링 오류: 예상치 못한 응답 형식 - ${responseText}`);
          }
        }
      } catch (error) {
        console.error('ML 클러스터링 오류:', error);
        if (error instanceof Error && !error.message.includes('클러스터링 요청 완료')) {
          setError(`ML 클러스터링 중 오류가 발생했습니다: ${error.message}`);
          return;
        }
      }

      // 모든 과정 성공 시 완료 페이지로 이동
      router.push("/login?signup=success");
    } catch (err) {
      console.error('설문조사 제출 중 오류:', err);
      setError(`서버 연결 중 오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}`);
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
