"use client"

import { QuizRank } from "@/lib/types"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import {
  getQuizzes,
  getUserQuizResults,
  checkQuizAnswer,
  logQuizStart,
  logQuizEnd,
} from "@/lib/api"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

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

export default function QuizPage() {
  const { isAuthenticated, loading } = useAuth()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [userRank, setUserRank] = useState<QuizRank>(QuizRank.BRONZE)
  const [subject, setSubject] = useState<string>(SUBJECTS[0])
  const [loadingQuizzes, setLoadingQuizzes] = useState(false)
  const [quizStartTimes, setQuizStartTimes] = useState<{[key: number]: Date}>({})

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

  // 전체 로딩: 유저정보, 퀴즈, 푼 목록
  async function loadAll() {
    setLoadingQuizzes(true)
    try {
      // 1) 유저 랭크
      const ui = await fetch("http://localhost:8085/users/getUserinfo", {
        credentials: "include",
      }).then(r => r.json())
      if (ui.success) setUserRank(ui.data.userrank)

      // 2) 퀴즈
      const all = await getQuizzes(subject, ui.data.userrank)
      const filtered = all.filter((q: Quiz) => q.quizRank === ui.data.userrank)
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

  // 퀴즈 펼침/접기 핸들러
  const toggleQuiz = async (quiz: Quiz) => {
    const newQuizzes = quizzes.map(q => {
      if (q.quizId === quiz.quizId) {
        const newIsExpanded = !q.isExpanded;
        if (newIsExpanded) {
          // 퀴즈를 펼칠 때 시작 시간 기록
          setQuizStartTimes(prev => ({
            ...prev,
            [quiz.quizId]: new Date()
          }));
          handleQuizStart(quiz.quizId);
        } else {
          // 퀴즈를 접을 때 종료 로그 기록
          handleQuizEnd(quiz.quizId, completed.has(quiz.quizId));
        }
        return { ...q, isExpanded: newIsExpanded };
      }
      return q;
    });
    setQuizzes(newQuizzes);
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

      {/* 과목 선택 */}
      <div>
        <label className="mr-2">과목:</label>
        <select
          className="border px-2 py-1 rounded"
          value={subject}
          onChange={e => setSubject(e.target.value)}
        >
          {SUBJECTS.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
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

              {!quiz.isExpanded ? (
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
                      onClick={() => toggleQuiz(quiz)}
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
                  <p className="text-gray-600">{currentResult.message}</p>
                  <p className="text-lg font-bold text-red-600">-10점</p>
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
    </div>
  )
}
