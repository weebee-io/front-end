"use client"

import { QuizRank } from "@/lib/types"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import {
  getQuizzes,
  getUserQuizResults,
  checkQuizAnswer,
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
}

const SUBJECTS = ["finance", "invest", "credit"]

export default function QuizPage() {
  const { isAuthenticated, loading } = useAuth()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [userRank, setUserRank] = useState<QuizRank>(QuizRank.BRONZE)
  const [subject, setSubject] = useState<string>(SUBJECTS[0])
  const [loadingQuizzes, setLoadingQuizzes] = useState(false)

  // 각 문제별 사용자가 선택한 답
  const [answers, setAnswers] = useState<{ [id: number]: string }>({})
  // 각 문제별 제출 결과
  const [results, setResults] = useState<{
    [id: number]: { correct: boolean; message: string }
  }>({})

  const router = useRouter()

  // 1) 인증 검사 + 퀴즈 로드
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/")
      } else {
        loadQuizData()
      }
    }
  }, [isAuthenticated, loading, subject])

  // 2) userRank 가져오기
  useEffect(() => {
    fetch("http://localhost:8080/users/getUserinfo", {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setUserRank(data.data.userrank)
        }
      })
      .catch(console.error)
  }, [])

  // 3) 퀴즈 로딩 함수
  const loadQuizData = async () => {
    setLoadingQuizzes(true)
    try {
      const all = await getQuizzes(subject, userRank)
      // quizRank === userRank 필터
      const filtered = all.filter((q: Quiz) => q.quizRank === userRank)
      setQuizzes(filtered)
    } catch (e) {
      console.error("로드 실패", e)
    } finally {
      setLoadingQuizzes(false)
    }
  }

  // 4) 정답 제출 핸들러
  const submitAnswer = async (quizId: number) => {
    const ans = answers[quizId]
    if (!ans) return

    try {
      const res = await checkQuizAnswer(quizId, ans)
      setResults((prev) => ({
        ...prev,
        [quizId]: { correct: res.isCorrect, message: res.message },
      }))
    } catch (e) {
      setResults((prev) => ({
        ...prev,
        [quizId]: { correct: false, message: "제출 오류 발생" },
      }))
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
          onChange={(e) => setSubject(e.target.value)}
        >
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* 퀴즈 리스트 */}
      {quizzes.length === 0 && (
        <div className="text-gray-500">해당 랭크({userRank})의 퀴즈가 없습니다.</div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {quizzes.map((quiz) => (
          <Card key={quiz.quizId} className="border">
            <CardHeader>
              <CardTitle>
                {quiz.quizContent}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* 2지선다 */}
              {quiz.option2 && (
                <div className="space-y-2">
                  {["choiceA", "choiceB"].map((key) => (
                    <label key={key} className="block">
                      <input
                        type="radio"
                        name={`answer-${quiz.quizId}`}
                        value={(quiz.option2 as any)[key]}
                        checked={answers[quiz.quizId] === (quiz.option2 as any)[key]}
                        onChange={(e) =>
                          setAnswers((a) => ({
                            ...a,
                            [quiz.quizId]: e.target.value,
                          }))
                        }
                        className="mr-2"
                      />
                      {(quiz.option2 as any)[key]}
                    </label>
                  ))}
                </div>
              )}
              {/* 4지선다 */}
              {quiz.option4 && (
                <div className="space-y-2">
                  {["choiceA", "choiceB", "choiceC", "choiceD"].map((key) => (
                    <label key={key} className="block">
                      <input
                        type="radio"
                        name={`answer-${quiz.quizId}`}
                        value={(quiz.option4 as any)[key]}
                        checked={answers[quiz.quizId] === (quiz.option4 as any)[key]}
                        onChange={(e) =>
                          setAnswers((a) => ({
                            ...a,
                            [quiz.quizId]: e.target.value,
                          }))
                        }
                        className="mr-2"
                      />
                      {(quiz.option4 as any)[key]}
                    </label>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col items-start">
              <Button
                onClick={() => submitAnswer(quiz.quizId)}
                disabled={!answers[quiz.quizId]}
              >
                제출하기
              </Button>

              {/* 제출 결과 표시 */}
              {results[quiz.quizId] && (
                <p
                  className={`mt-2 ${
                    results[quiz.quizId].correct
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {results[quiz.quizId].message}
                </p>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
