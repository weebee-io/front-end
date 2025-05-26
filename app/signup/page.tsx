// page.tsx

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
  const [showRankModal, setShowRankModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false) // 랭크 측정 중 로딩 상태
  const [userRank, setUserRank] = useState("") // 최종적으로 모달에 표시될 랭크
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
      // 로딩 상태 활성화
      setIsLoading(true);
      
      console.log('서버에 전송할 설문 데이터:', surveyData);
      const token = Cookies.get("jwt_token");
      
      // 서버 호출 함수 수정
      const callApi = async (url: string, method: string, body?: any) => {
        try {
          const options: RequestInit = {
            method,
            credentials: 'include',
            headers: {
              // ML API가 문자열을 반환하므로, Content-Type은 요청 시에만 중요하고,
              // 응답에서는 Accept 헤더를 지정할 수 있지만, fetch는 기본적으로 모든 응답을 받습니다.
              "Content-Type": "application/json", // POST 요청 시 본문이 JSON임을 명시
              "Authorization": `Bearer ${token}`
            },
          };
          
          if (body) {
            options.body = JSON.stringify(body);
          }
          
          const response = await fetch(url, options);
          
          // 응답 텍스트를 먼저 추출
          const responseText = await response.text();

          if (!response.ok) {
            // HTTP 에러 발생 시, 응답 텍스트가 에러 메시지일 수 있음
            return { 
              success: false, 
              error: responseText || `HTTP 오류: ${response.status} ${response.statusText}` 
            };
          }
          
          // 응답이 비어있는 경우 (204 No Content 등) 또는 성공했지만 텍스트가 없는 경우
          if (response.status === 204 || !responseText) {
            return { success: true, data: null }; // 데이터 없음을 명시적으로 표시
          }
          
          // ML API (clusteringwithKafka)의 경우, 문자열 응답을 그대로 data로 사용
          if (url.includes("/ml/clusteringwithKafka")) {
            console.log(`ML API (${url}) 문자열 응답:`, responseText);
            return { success: true, data: responseText };
          }

          // 그 외 API는 JSON 파싱 시도
          try {
            return { success: true, data: JSON.parse(responseText) };
          } catch (e) {
            // JSON 파싱 실패했으나, 성공적인 응답(2xx)이고 텍스트가 있다면, 해당 텍스트를 오류 또는 데이터로 반환할지 결정
            // 여기서는 의도치 않은 문자열 응답으로 간주하고 경고 후 null 데이터 반환
            console.warn(`응답을 JSON으로 파싱할 수 없음 (URL: ${url}):`, responseText);
            return { success: true, data: null, warning: 'Response was not valid JSON.' }; 
          }
        } catch (err: any) {
          console.error(`서버 호출 오류 (URL: ${url}):`, err);
          return { success: false, error: `서버 요청 오류: ${err.message || String(err)}` };
        }
      };

      // 지연 함수 정의 - 모든 지연에 사용
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      
      
      
      // 2. 설문조사 제출
      const surveyResult = await callApi("http://localhost:8085/surveys", "POST", surveyData);
      if (!surveyResult.success) {
        setError(`설문조사 제출 오류: ${surveyResult.error}`);
        return;
      }
      
      // 설문조사 제출 후 DB 반영 대기
      console.log('설문조사 제출 후 DB 반영 대기 중...');
      await delay(1000); // 1초 대기
      
      
      // 4. ML 클러스터링 API 호출
      const mlResult = await callApi("http://localhost:8085/ml/clusteringwithKafka", "GET");
      if (!mlResult.success) {
        setError(`ML 클러스터링 오류: ${mlResult.error}`);
        return;
      }
      
      console.log('ML 클러스터링 완료, 응답:', mlResult.data);
      
      // 카프카 메시지 처리 및 랭크 업데이트를 위한 지연 추가 (3초)
      console.log('카프카 메시지 처리 및 랭크 업데이트를 위해 3초 대기 중...');
      await delay(3000); // 3000ms = 3초

      // 3. 퀴즈 배치 테스트 결과 제출 (금융 지식 스탯 정보)
      console.log('금융 지식 스탯 정보 제출:', surveyData.stats);
      const quizPlacementResult = await callApi("http://localhost:8085/quiz/placementTest", "POST", surveyData.stats);
      if (!quizPlacementResult.success) {
        setError(`퀴즈 배치 테스트 제출 오류: ${quizPlacementResult.error}`);
        return;
      }
      console.log('퀴즈 배치 테스트 응답:', quizPlacementResult.data);
      
      // 4. getUserStats API 호출하여 사용자 랭크 정보 가져오기
      console.log('getUserStats API 호출 시작...');
      const userStatsResult = await callApi("http://localhost:8085/stats/getuserstats", "GET");
      
      if (!userStatsResult.success) {
        setError(`사용자 스탯 정보 조회 오류: ${userStatsResult.error}`);
        return;
      }
      
      console.log('사용자 스탯 응답:', userStatsResult.data);
      
      // 응답에서 userRank 추출
      let extractedRank: string | null = null;
      
      if (userStatsResult.data && userStatsResult.data.userRank) {
        // UserStatsResponseDto 구조에 맞게 userRank 필드 추출
        extractedRank = userStatsResult.data.userRank;
        console.log('추출한 사용자 랭크:', extractedRank);
      } else {
        console.log('사용자 랭크 정보를 찾을 수 없습니다:', userStatsResult.data);
        
        // 테스트용 기본 랭크 사용 (실제 개발 시 제거)
        const testRanks = ["초급 투자자", "중급 투자자", "고급 투자자", "수익형", "안정형", "성장형", "공격형"];
        extractedRank = testRanks[Math.floor(Math.random() * testRanks.length)];
        console.log('테스트용 랭크 사용:', extractedRank);
      }
      
      // 로딩 상태 종료
      setIsLoading(false);
      
      // 랭크 정보 표시
      setUserRank(extractedRank || "Unknown");
      setShowRankModal(true);
      console.log('회원가입 과정 완료! 최종 랭크:', extractedRank);
      
    } catch (err: any) {
      console.error("설문 제출 처리 중 최상위 오류:", err);
      setError(`처리 중 예상치 못한 오류가 발생했습니다: ${err.message || String(err)}`);
      // 오류 발생 시 로딩 상태 비활성화
      setIsLoading(false);
    }
  }

  // 확인 버튼 클릭 핸들러
  const handleConfirmRank = () => {
    setShowRankModal(false);
    router.push("/"); // 메인 페이지로 이동
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
      
      {/* 랭크 측정 중 로딩 모달 */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-[600px] h-[300px] w-full">
            <h2 className="text-2xl font-bold mb-4">랭크 측정 중</h2>
            <div className="mb-6 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-lg mb-2">금융 성향을 분석하고 있습니다</p>
              <p className="text-sm text-gray-500">
                잠시만 기다려주세요...
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* 랭크 결과 모달 */}
      {showRankModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-[600px] h-[300px] w-full">
            <h2 className="text-2xl font-bold mb-4">분석 결과</h2>
            <div className="mb-6 text-center">
              <p className="text-lg mb-2">금융 성향 분석 완료</p>
              <p className="text-3xl font-bold my-4">
                당신의 랭크는 <span className={`
                  ${userRank === 'BRONZE' ? 'text-amber-700' : ''}
                  ${userRank === 'SILVER' ? 'text-gray-400' : ''}
                  ${userRank === 'GOLD' ? 'text-yellow-500 animate-pulse' : ''}
                  ${!['BRONZE', 'SILVER', 'GOLD'].includes(userRank) ? 'text-primary' : ''}
                `}>{userRank}</span>입니다
              </p>
              <p className="text-sm text-gray-500 mb-4">
                이 랭크는 설문조사 결과를 바탕으로 분석되었습니다.
              </p>
            </div>
            <button
              onClick={handleConfirmRank}
              className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  )
}