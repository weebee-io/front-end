"use client"

import { QuizRank } from "@/lib/types"
import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import Cookies from "js-cookie"
import {
  getQuizzes,
  getUserQuizResults,
  checkQuizAnswer,
  getQuizHint,
} from "@/lib/api"
import { logEvent } from "@/lib/analytics"
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
import ChatPopup from "@/components/chat/ChatPopup"

type QuizOption2 = { quizId: number; choiceA: string; choiceB: string; correctAns: string }
type QuizOption4 = { quizId: number; choiceA: string; choiceB: string; choiceC: string; choiceD: string; correctAns: string }
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
const SUBJECT_NAMES: { [key: string]: string } = {
  finance: "금융상식",
  invest: "재테크",
  credit: "신용소비",
}

export default function QuizPage() {
  const { isAuthenticated, loading } = useAuth()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [userRank, setUserRank] = useState<QuizRank>(QuizRank.BRONZE)
  const [subject, setSubject] = useState<string>(SUBJECTS[0])
  const [loadingQuizzes, setLoadingQuizzes] = useState(false)
  const [quizStartTimes, setQuizStartTimes] = useState<{ [key: number]: number }>({})
  const [error, setError] = useState<string | null>(null)
  const [openQuizId, setOpenQuizId] = useState<number | null>(null)
  const [prevRank, setPrevRank] = useState<string | null>(null)
  const [showRankUpModal, setShowRankUpModal] = useState(false)
  const [newRank, setNewRank] = useState<string>("")
  const [showConfetti, setShowConfetti] = useState(false)
  const [rankUpdateInitialized, setRankUpdateInitialized] = useState(false)
  const { width, height } = useWindowSize()

  const [answers, setAnswers] = useState<{ [id: number]: string }>({})
  const [results, setResults] = useState<{ [id: number]: { correct: boolean; message: string } }>({})
  const [completed, setCompleted] = useState<Set<number>>(new Set())

  const [showResultModal, setShowResultModal] = useState(false)
  const [currentResult, setCurrentResult] = useState<{ quizId: number; correct: boolean; message: string } | null>(null)

  const [showHint, setShowHint] = useState<{ [id: number]: boolean }>({})
  const [hints, setHints] = useState<{ [id: number]: string }>({})
  const [loadingHint, setLoadingHint] = useState<{ [id: number]: boolean }>({})
  const [showAiExplanation, setShowAiExplanation] = useState<{ [id: number]: boolean }>({})

  const [chatUsed, setChatUsed] = useState<{ [key: number]: boolean }>({})

  const router = useRouter()

  // ───────────────────────────────────────────────────────
  // 퀴즈 탭 뷰 로깅
  useEffect(() => {
    if (!loading && isAuthenticated) {
      logEvent("quizTabViewed", { 
        quizSubject: subject, 
        quizRank: userRank, 
      })
      loadAll()
    }
    if (!loading && !isAuthenticated) router.push("/login")
  }, [isAuthenticated, loading, subject, userRank])
  // ───────────────────────────────────────────────────────

  // 사용자 정보 로드
  const loadUserInfo = async () => {
    try {
      const token = Cookies.get("jwt_token")
      const response = await fetch("http://52.78.4.114:8085/users/getUserinfo", {
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) {
        console.error("사용자 정보 가져오기 실패:", response.status)
        return
      }
      const userInfo = await response.json()
      if (userInfo.success && userInfo.data) {
        setRankUpdateInitialized(true)
        setUserRank(userInfo.data.userrank)
        setPrevRank(userInfo.data.userrank)
      } else {
        console.error("userInfo.success false:", userInfo)
      }
    } catch (err) {
      console.error("loadUserInfo 오류:", err)
    }
  }

  // 전체 로딩: 유저정보, 퀴즈, 이력
  async function loadAll() {
    setLoadingQuizzes(true)
    try {
      const [userInfo, allQuizzes, history] = await Promise.all([
        fetch("http://52.78.4.114:8085/users/getUserinfo", {
          credentials: "include",
          headers: {
            "Authorization": `Bearer ${Cookies.get("jwt_token")}`,
            "Content-Type": "application/json"
          }
        }).then(r => r.json()),
        getQuizzes(subject, userRank),
        getUserQuizResults()
      ])

      if (userInfo.success) {
        setUserRank(userInfo.data.userrank)
        setPrevRank(userInfo.data.userrank)
      }

      const filtered = allQuizzes.filter((q: Quiz) => q.quizRank === userRank)
      setQuizzes(filtered)

      const correctIds = history
        .filter((r: any) => r.isCorrect)
        .map((r: any) => r.quizId.quizId)
      setCompleted(new Set(correctIds))
    } catch (e) {
      console.error("로드 실패", e)
      setError("데이터를 불러오는데 실패했습니다.")
    } finally {
      setLoadingQuizzes(false)
    }
  }

  // ───────────────────────────────────────────────────────
  // 퀴즈 시작 로깅
  const handleQuizStart = (quizId: number) => {
    const start = Date.now()
    setQuizStartTimes(p => ({ ...p, [quizId]: start }))
    logEvent("quizStarted", {
      quizId,
      quizLevel: quizzes.find(q => q.quizId === quizId)?.quizLevel,
      quizSubject: subject,
    })
  }
  // ───────────────────────────────────────────────────────

  // ───────────────────────────────────────────────────────
  // 힌트 요청 로깅
  const handleGetHint = async (quizId: number) => {
    // (기존 getQuizHint 호출 전)
    const quiz = quizzes.find(q => q.quizId === quizId)
    const t0 = performance.now()
    const result = await getQuizHint(
      quiz?.quizContent || "",
      quiz?.option4
        ? [quiz.option4.choiceA, quiz.option4.choiceB, quiz.option4.choiceC, quiz.option4.choiceD]
        : quiz?.option2
        ? [quiz.option2.choiceA, quiz.option2.choiceB]
        : []
    )
    const duration = Math.round(performance.now() - t0)

    // AI 위젯 호출 여부 업데이트
    setShowAiExplanation(p => ({
      ...p,
      [quizId]: true
    }))

    logEvent("quizHintRequested", {
      quizId,
      quizLevel: quiz?.quizLevel,
      responseTimeMs: duration,
    })
    // … 나머지 힌트 처리 로직
  }
  // ───────────────────────────────────────────────────────

  // ───────────────────────────────────────────────────────
  // 퀴즈 펼침/접기 & 종료 로깅
  const toggleQuiz = (quiz: Quiz) => {
    if (openQuizId === quiz.quizId) {
      const start = quizStartTimes[quiz.quizId]
      const elapsed = start ? (Date.now() - start) / 1000 : undefined
      console.log(`[QuizPage] Logging quizEnded for quizId: ${quiz.quizId}, aiBotUsed: ${!!chatUsed[quiz.quizId]}`); // 디버깅 로그
      logEvent("quizEnded", {
        quizId: quiz.quizId,
        isCompleted: completed.has(quiz.quizId),
        timeTakenSec: elapsed,
        aiBotUsed: !!chatUsed[quiz.quizId]
      })
      setOpenQuizId(null)
      return
    }
    if (openQuizId !== null) {
      const prev = openQuizId
      const start = quizStartTimes[prev]
      const elapsed = start ? (Date.now() - start) / 1000 : undefined
      console.log(`[QuizPage] Logging quizEnded for prevQuizId: ${prev}, aiBotUsed: ${!!chatUsed[prev]}`); // 디버깅 로그
      logEvent("quizEnded", {
        quizId: prev,
        isCompleted: completed.has(prev),
        timeTakenSec: elapsed,
        aiBotUsed: !!chatUsed[prev]
      })
    }
    setOpenQuizId(quiz.quizId)
    handleQuizStart(quiz.quizId)
  }
  // ───────────────────────────────────────────────────────

  // ───────────────────────────────────────────────────────
  // 정답 제출 로깅
  const submitAnswer = async (quizId: number) => {
    const ans = answers[quizId]
    if (!ans) return
    const res = await checkQuizAnswer(quizId, ans)
    setResults(p => ({ ...p, [quizId]: { correct: res.isCorrect, message: res.message } }))

    console.log('Before setting currentResult and showResultModal:', { currentResult, showResultModal }) // 디버깅용 로그
    setCurrentResult({ quizId, correct: res.isCorrect, message: res.message })
    setShowResultModal(true)
    console.log('After setting currentResult and showResultModal:', { currentResult: { quizId, correct: res.isCorrect, message: res.message }, showResultModal: true }) // 디버깅용 로그

    const start = quizStartTimes[quizId]
    const elapsedMs = start ? Date.now() - start : undefined

    console.log(`[QuizPage] Logging quizSubmitted for quizId: ${quizId}, aiBotUsed: ${!!chatUsed[quizId]}`); // 디버깅 로그
    logEvent("quizSubmitted", {
      quizId,
      isCorrect: res.isCorrect,
      responseTimeMs: elapsedMs,
      aiBotUsed: !!chatUsed[quizId],
      streakCount: undefined,
    })

    if (res.isCorrect) {
      setCompleted(p => new Set(p).add(quizId))
      // 랭크 업데이트 로직…
    }
  }
  // ───────────────────────────────────────────────────────

  const handleChatUsed = useCallback((quizId: number) => {
    setChatUsed(prev => {
      const updated = { ...prev, [quizId]: true };
      console.log(`[QuizPage] handleChatUsed called for quizId: ${quizId}. chatUsed state updated: ${updated[quizId]}`);
      return updated;
    });
  }, []);

  useEffect(() => {
    console.log("[QuizPage] handleChatUsed useCallback 참조 유지됨");
  }, [handleChatUsed]);

  if (loading || loadingQuizzes) {
    return <div className="p-8 text-center">로딩 중...</div>
  }
  if (!isAuthenticated) return null

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-8 px-4">
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
      <ChatPopup
        currentQuizId={openQuizId}
        onChatUsed={handleChatUsed}
      />
    </div>
  )
}