"use client"

import { QuizRank } from "@/lib/types"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import Cookies from "js-cookie"
import {
  getQuizzes,
  getUserQuizResults,
  checkQuizAnswer,
  logQuizStart,
  logQuizEnd,
  getQuizHint,
} from "@/lib/api"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import ReactConfetti from 'react-confetti'
import { useWindowSize } from 'react-use'

type QuizOption2 = {
  quizId: number
  choiceA: string
  choiceB: string
  correctAns: string
}
type QuizOption4 = {
  quizId: number
  choiceA: string
  choiceB: string
  choiceC: string
  choiceD: string
  correctAns: string
}
type Quiz = {
  quizId: number
  quizContent: string
  quizSubject: string
  quizRank: string
  quizLevel: number
  option2: QuizOption2 | null
  option4: QuizOption4 | null
  correctAns: string
  isExpanded?: boolean
}

const SUBJECTS = ["finance", "invest", "credit"]
const SUBJECT_NAMES: {[key: string]: string} = {
  "finance": "금융상식",
  "invest": "재테크",
  "credit": "신용소비"
}

export default function QuizPage() {
  const { isAuthenticated, loading } = useAuth()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [userRank, setUserRank] = useState<QuizRank>(QuizRank.BRONZE)
  const [subject, setSubject] = useState<string>(SUBJECTS[0])
  const [loadingQuizzes, setLoadingQuizzes] = useState(false)
  const [quizStartTimes, setQuizStartTimes] = useState<{[key: number]: Date}>({})
  const [error, setError] = useState<string | null>(null)
  // 현재 열린 퀴즈 ID 추적 (null이면 모든 퀴즈가 닫힌 상태)
  const [openQuizId, setOpenQuizId] = useState<number | null>(null)
  
  // 랭크 승급 관련 상태
  const [prevRank, setPrevRank] = useState<string | null>(null)
  const [showRankUpModal, setShowRankUpModal] = useState(false)
  const [newRank, setNewRank] = useState<string>("") 
  const [showConfetti, setShowConfetti] = useState(false)
  const [rankUpdateInitialized, setRankUpdateInitialized] = useState<boolean>(false)
  const { width, height } = useWindowSize()

  // 사용자가 선택한 답
  const [answers, setAnswers] = useState<{ [id: number]: string }>({})
  // 제출 후 결과 (message, correct)
  const [results, setResults] = useState<{
    [id: number]: { correct: boolean; message: string }
  }>({})
  // **정답으로 제출 완료된** 문제 ID 집합
  const [completed, setCompleted] = useState<Set<number>>(new Set())

  // 결과 모달 관련 상태
  const [showResultModal, setShowResultModal] = useState(false)
  const [currentResult, setCurrentResult] = useState<{
    quizId: number,
    correct: boolean,
    message: string
  } | null>(null)
  
  // 힌트 관련 상태
  const [showHint, setShowHint] = useState<{[id: number]: boolean}>({})
  const [hints, setHints] = useState<{[id: number]: string}>({})
  const [loadingHint, setLoadingHint] = useState<{[id: number]: boolean}>({})

  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/")
      } else {
        loadAll()
      }
    }
  }, [isAuthenticated, loading, subject])
  
  // 초기 사용자 정보 불러오기
  useEffect(() => {
    // 비로그인 상태면 로그인 페이지로 이동
    if (!loading && !isAuthenticated) {
      router.push("/login")
      return
    }

    // 사용자 정보만 먼저 불러오기 (퀴즈는 다른 useEffect에서 불러옵니다)
    loadUserInfo()
  }, [isAuthenticated, loading])

  // 초기 사용자 정보 불러오기 - 승급 초기화
  const loadUserInfo = async () => {
    try {
      const token = Cookies.get("jwt_token");
      const response = await fetch("http://52.78.4.114:8085/users/getUserinfo", {
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("사용자 정보 가져오기 실패:", errorText);
        setError("사용자 정보를 가져오는 중 오류가 발생했습니다. 로그인을 다시 시도해주세요.");
        return;
      }
      
      const userInfo = await response.json();
      
      if (!userInfo.success || !userInfo.data) {
        console.error("사용자 정보 없음:", userInfo);
        setError("사용자 정보를 가져오는 중 오류가 발생했습니다.");
        return;
      }
      
      if (userInfo.success) {
        // 승급 감지 장치
        setRankUpdateInitialized(true) // 이것이 true일 때만 userRank의 변화가 승급으로 인식됨
        setUserRank(userInfo.data.userrank)
        setPrevRank(userInfo.data.userrank)
      }
    } catch (error) {
      console.error('사용자 정보 로딩 중 오류:', error)
      setError('사용자 정보를 가져오는 중 오류가 발생했습니다.')
    }
  }

  // 처음 로드 시 현재 랭크 저장
  useEffect(() => {
    if (userRank && !prevRank) {
      setPrevRank(userRank)
    }
  }, [userRank, prevRank])

  // 전체 로딩: 유저정보, 퀴즈, 푼 목록
  async function loadAll() {
    setLoadingQuizzes(true)
    try {
      // 1) 유저 랭크
      const token = Cookies.get("jwt_token");
      const response = await fetch("http://52.78.4.114:8085/users/getUserinfo", {
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("사용자 정보 가져오기 실패:", errorText);
        setError("사용자 정보를 가져오는 중 오류가 발생했습니다.");
        setLoadingQuizzes(false);
        return;
      }
      
      const ui = await response.json();
      
      if (!ui.success || !ui.data) {
        console.error("사용자 정보 없음:", ui);
        setError("사용자 정보를 가져오는 중 오류가 발생했습니다.");
        setLoadingQuizzes(false);
        return;
      }
      
      if (ui.success) setUserRank(ui.data.userrank);

      // 2) 퀴즈
      const all = await getQuizzes(subject, ui.data.userrank);
      const filtered = all.filter((q: Quiz) => q.quizRank === ui.data.userrank);
      setQuizzes(filtered)

      // 3) 이미 푼 이력 중 **정답인 것만**
      const hist = await getUserQuizResults()
      const correctIds = hist
        .filter((r: any) => r.isCorrect)
        .map((r: any) => r.quizId.quizId)
      setCompleted(new Set(correctIds))
    } catch (e) {
      console.error("로드 실패", e)
    } finally {
      setLoadingQuizzes(false)
    }
  }

  // 퀴즈 시작 로깅
  const handleQuizStart = async (quizId: number) => {
    try {
      const response = await logQuizStart(quizId, new Date());
      if (!response.success) {
        console.error('퀴즈 시작 로깅 실패:', response.error);
      }
    } catch (e) {
      console.error('퀴즈 시작 로깅 실패:', e);
    }
  }

  // 퀴즈 종료 로깅
  const handleQuizEnd = async (quizId: number, isCompleted: boolean) => {
    try {
      const response = await logQuizEnd(quizId, new Date(), isCompleted);
      if (!response.success) {
        console.error('퀴즈 종료 로깅 실패:', response.error);
      }
    } catch (e) {
      console.error('퀴즈 종료 로깅 실패:', e);
    }
  }
  
  // 힌트 가져오기 함수
  const handleGetHint = async (quizId: number) => {
    try {
      setLoadingHint(prev => ({ ...prev, [quizId]: true }));
      
      // 해당 퀴즈 찾기
      const quiz = quizzes.find(q => q.quizId === quizId);
      if (!quiz) {
        setHints(prev => ({ ...prev, [quizId]: "퀴즈 정보를 찾을 수 없습니다." }));
        setShowHint(prev => ({ ...prev, [quizId]: true }));
        setLoadingHint(prev => ({ ...prev, [quizId]: false }));
        return;
      }
      
      // 퀴즈 내용과 선택지를 추출
      const quizContent = quiz.quizContent;
      let choices: string[] = [];
      
      if (quiz.option2) {
        // 2지선다일 경우
        choices = [quiz.option2.choiceA, quiz.option2.choiceB];
      } else if (quiz.option4) {
        // 4지선다일 경우
        choices = [quiz.option4.choiceA, quiz.option4.choiceB, quiz.option4.choiceC, quiz.option4.choiceD];
      }
      
      const result = await getQuizHint(quizContent, choices);
      
      if (result.success) {
        // API 응답에서 힌트 필드가 없을 경우 대체 텍스트 사용
        const hintText = (result as any).answer || result.hint || "힌트가 없습니다.";
        setHints(prev => ({ ...prev, [quizId]: hintText }));
        setShowHint(prev => ({ ...prev, [quizId]: true }));
      } else {
        console.error("힌트 가져오기 실패:", result.error);
        // 오류 상황에도 사용자에게 메시지 표시
        setHints(prev => ({ ...prev, [quizId]: "힌트를 가져오는 중 오류가 발생했습니다. 다시 시도해주세요." }));
        setShowHint(prev => ({ ...prev, [quizId]: true }));
      }
    } catch (error) {
      console.error("힌트 API 호출 오류:", error);
      // 예외 발생 시에도 사용자에게 피드백 제공
      setHints(prev => ({ ...prev, [quizId]: "힌트 서버와의 통신에 문제가 발생했습니다. 잠시 후 다시 시도해주세요." }));
      setShowHint(prev => ({ ...prev, [quizId]: true }));
    } finally {
      setLoadingHint(prev => ({ ...prev, [quizId]: false }));
    }
  }

  // 퀴즈 펼침/접기 핸들러
  const toggleQuiz = async (quiz: Quiz) => {
    // 이미 열린 퀴즈인 경우 닫기
    if (openQuizId === quiz.quizId) {
      // 퀴즈를 접을 때 종료 로그 기록
      handleQuizEnd(quiz.quizId, completed.has(quiz.quizId));
      setOpenQuizId(null);
      return;
    }
    
    // 다른 퀴즈가 열려있었다면 닫기
    if (openQuizId !== null) {
      // 이전 퀴즈 종료 로그 기록
      handleQuizEnd(openQuizId, completed.has(openQuizId));
    }
    
    // 새 퀴즈 열기
    setOpenQuizId(quiz.quizId);
    
    // 퀴즈를 펼칠 때 시작 시간 기록
    setQuizStartTimes(prev => ({
      ...prev,
      [quiz.quizId]: new Date()
    }));
    handleQuizStart(quiz.quizId);
  }

  // 제출 핸들러
  const submitAnswer = async (quizId: number) => {
    const ans = answers[quizId]
    if (!ans) return

    try {
      const res = await checkQuizAnswer(quizId, ans)
      // 결과 저장
      setResults(prev => ({
        ...prev,
        [quizId]: { correct: res.isCorrect, message: res.message },
      }))
      
      // 모달 표시를 위한 현재 결과 설정
      setCurrentResult({
        quizId,
        correct: res.isCorrect,
        message: res.message
      })
      setShowResultModal(true)
      
      if (res.isCorrect) {
        setCompleted(prev => new Set(prev).add(quizId))
        // 정답 제출 시 종료 로그 기록
        handleQuizEnd(quizId, true)
        
        // 퀴즈 제출 후 사용자 정보를 다시 가져와서 랭크 변경 확인
        try {
          const userInfo = await fetch("http://52.78.4.114:8085/users/getUserinfo", {
            credentials: "include",
          }).then(r => r.json())
          
          if (userInfo.success) {
            const currentRank = userInfo.data.userrank
            
            // 초기화가 완료되었을 때만 승급 감지 로직 실행
            if (rankUpdateInitialized && prevRank && prevRank !== currentRank) {
              console.log(`랜크 승급 감지: ${prevRank} -> ${currentRank}`)
              setNewRank(currentRank)
              setShowConfetti(true)
              setShowRankUpModal(true)
              
              // 5초 후에 폭죽 효과 중단
              setTimeout(() => {
                setShowConfetti(false)
              }, 5000)
              
              // 승급 후 즉시 새 랜크로 업데이트
              setPrevRank(currentRank)
            }
            
            // 현재 랜크 저장
            setUserRank(currentRank)
          }
        } catch (error) {
          console.error('랭크 정보 가져오기 실패:', error)
        }
      }
    } catch (e) {
      // 오류 결과 저장
      setResults(prev => ({
        ...prev,
        [quizId]: { correct: false, message: "제출 오류 발생" },
      }))
      
      // 오류 모달 표시
      setCurrentResult({
        quizId,
        correct: false,
        message: "제출 오류 발생"
      })
      setShowResultModal(true)
    }
  }

  if (loading || loadingQuizzes) {
    return <div className="p-8 text-center">로딩 중...</div>
  }
  if (!isAuthenticated) return null

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-8">
      <h1 className="text-2xl font-bold">퀴즈 풀기</h1>

      {/* 오류 표시 */}
      {error && (
        <Alert className="mb-4 bg-red-50 border-red-400">
          <AlertDescription className="text-red-600">{error}</AlertDescription>
        </Alert>
      )}

      {/* 과목 선택 탭 */}
      <div className="mb-4">
        <div className="flex items-center">
          <span className="mr-3 font-medium">과목:</span>
          <div className="flex space-x-2">
            {SUBJECTS.map(s => (
              <button
                key={s}
                className={`px-6 py-3 rounded-md transition-colors text-base font-medium ${subject === s 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                onClick={() => setSubject(s)}
              >
                {SUBJECT_NAMES[s]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 퀴즈가 없으면 */}
      {quizzes.length === 0 && (
        <div className="text-gray-500">
          해당 랭크({userRank})의 퀴즈가 없습니다.
        </div>
      )}

      {/* 퀴즈 목록 */}
      <div className="space-y-4">
        {quizzes.map((quiz, index) => {
          const isDone = completed.has(quiz.quizId)
          return (
            <Card key={`${quiz.quizId}-${index}`} className="border">
              <CardHeader className="flex justify-between items-center">
                <CardTitle>{quiz.quizContent}</CardTitle>
                {isDone && (
                  <span className="text-sm text-gray-500">✔ 정답 완료</span>
                )}
              </CardHeader>

              {openQuizId !== quiz.quizId ? (
                <CardFooter>
                  <Button
                    onClick={() => toggleQuiz(quiz)}
                    className="w-full"
                  >
                    문제 풀기
                  </Button>
                </CardFooter>
              ) : (
                <>
                  <CardContent>
                    {/* 2지선다 */}
                    {quiz.option2 && (
                      <div className="space-y-2">
                        <label className="block">
                          <input
                            type="radio"
                            name={`answer-${quiz.quizId}`}
                            value="1"
                            disabled={isDone}
                            checked={answers[quiz.quizId] === "1"}
                            onChange={() =>
                              setAnswers(a => ({ ...a, [quiz.quizId]: "1" }))
                            }
                            className="mr-2"
                          />
                          {quiz.option2.choiceA}
                        </label>
                        <label className="block">
                          <input
                            type="radio"
                            name={`answer-${quiz.quizId}`}
                            value="2"
                            disabled={isDone}
                            checked={answers[quiz.quizId] === "2"}
                            onChange={() =>
                              setAnswers(a => ({ ...a, [quiz.quizId]: "2" }))
                            }
                            className="mr-2"
                          />
                          {quiz.option2.choiceB}
                        </label>
                      </div>
                    )}

                    {/* 4지선다 */}
                    {quiz.option4 && (
                      <div className="space-y-2">
                        {[quiz.option4.choiceA,
                          quiz.option4.choiceB,
                          quiz.option4.choiceC,
                          quiz.option4.choiceD
                        ].map((txt, idx) => (
                          <label key={idx} className="block">
                            <input
                              type="radio"
                              name={`answer-${quiz.quizId}`}
                              value={`${idx+1}`}
                              disabled={isDone}
                              checked={answers[quiz.quizId] === `${idx+1}`}
                              onChange={() =>
                                setAnswers(a => ({ ...a, [quiz.quizId]: `${idx+1}` }))
                              }
                              className="mr-2"
                            />
                            {txt}
                          </label>
                        ))}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="flex gap-2">
                    <Button
                      onClick={() => submitAnswer(quiz.quizId)}
                      disabled={isDone || !answers[quiz.quizId]}
                      className="flex-1"
                    >
                      {isDone ? "제출 완료" : "제출하기"}
                    </Button>
                    <Button
                      onClick={() => setOpenQuizId(null)}
                      variant="outline"
                    >
                      닫기
                    </Button>
                  </CardFooter>

                  {/* 제출 결과 메세지 - 모달로 대체했으니 주석 처리 */}
                  {/* {results[quiz.quizId] && (
                    <p className={`px-6 pb-4 ${
                      results[quiz.quizId].correct
                        ? "text-green-600"
                        : "text-red-600"
                    }`}>
                      {results[quiz.quizId].message}
                    </p>
                  )} */}
                </>
              )}
            </Card>
          )
        })}
      </div>
      {/* 결과 모달 */}
      {showResultModal && currentResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg transform transition-all">
            <div className="text-center">
              {currentResult.correct ? (
                <>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-green-600 mb-2">정답입니다!</h3>
                  <p className="text-gray-600 mb-2">{currentResult.message}</p>
                  <p className="text-lg font-bold text-green-600">+10점</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-red-600 mb-2">오답입니다!</h3>
                  <p className="text-gray-600 mb-3">{currentResult.message}</p>
                  <p className="text-lg font-bold text-red-600 mb-4">-10점</p>
                  
                  {/* 힌트 버튼 */}
                  {!showHint[currentResult.quizId] && (
                    <button 
                      onClick={() => handleGetHint(currentResult.quizId)}
                      className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
                      disabled={loadingHint[currentResult.quizId]}
                    >
                      {loadingHint[currentResult.quizId] ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          로딩 중...
                        </span>
                      ) : "힌트 보기"}
                    </button>
                  )}
                  
                  {/* 힌트 내용 표시 */}
                  {showHint[currentResult.quizId] && hints[currentResult.quizId] && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-md text-left">
                      <h4 className="font-semibold mb-2">힌트</h4>
                      <p className="text-gray-700 whitespace-pre-line">{hints[currentResult.quizId]}</p>
                    </div>
                  )}
                </>
              )}
              
              <button 
                onClick={() => setShowResultModal(false)}
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 랭크 승급 모달 */}
      {showRankUpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          {showConfetti && (
            <ReactConfetti
              width={width}
              height={height}
              recycle={false}
              numberOfPieces={500}
              gravity={0.2}
              colors={['#FFD700', '#FFA500', '#FF4500', '#32CD32', '#1E90FF', '#8A2BE2']}
            />
          )}
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-lg transform transition-all text-center z-10">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-yellow-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">축하합니다!</h2>
            <div className="mb-6">
              <p className="text-lg text-gray-600 mb-2">랭크가 승급되었습니다!</p>
              <p className="text-xl font-bold text-emerald-600">{newRank}</p>
            </div>
            <button 
              onClick={() => setShowRankUpModal(false)}
              className="px-6 py-3 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors font-medium"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
