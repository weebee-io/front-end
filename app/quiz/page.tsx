"use client"

import { QuizRank } from "@/lib/types"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { getQuizzes, getUserQuizResults, checkQuizAnswer } from "@/lib/api"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle, XCircle } from "lucide-react"

// 퀴즈 타입
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

// 퀴즈 결과 타입
type QuizResult = {
  quizResultId: number
  isCorrect: boolean
  quizDate: string
  quizId: Quiz
}

// 과목 목록 예시
const SUBJECTS = ["finance", "invest", "credit"]

export default function QuizPage() {
  const { isAuthenticated, loading } = useAuth()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [quizResults, setQuizResults] = useState<QuizResult[]>([])
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string>("")
  const [loadingQuizzes, setLoadingQuizzes] = useState(false)
  const [userRank, setUserRank] = useState("BRONZE") // 기본값
  const [activeTab, setActiveTab] = useState("1") // 기본
  const [userInfo, setUserInfo] = useState(null)
  const [subject, setSubject] = useState(SUBJECTS[0])
  const [quiz_rank, setLevel] = useState(1)

  const [resultDialog, setResultDialog] = useState({
    open: false,
    correct: false,
    message: "",
  })
  const router = useRouter()

  useEffect(() => {
    // 인증 상태 확인 후 리다이렉트 또는 데이터 로드
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/")
      } else {
        loadQuizData()
      }
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    // 사용자 정보 가져오기
    fetch("http://localhost:8080/users/getUserinfo", {
      method: "GET",
      credentials: "include"
    })
      .then(res => {
        if (!res.ok) throw new Error("유저 정보 불러오기 실패");
        return res.json();
      })
      .then(data => {
        setUserInfo(data)
        if (data.success) {
          setUserRank(data.data.userrank)
        }
      })
      .catch(err => {
        console.error(err);
        // 에러 처리
      });
  }, []);

  // 퀴즈 데이터 로드
  const loadQuizData = async () => {
    setLoadingQuizzes(true)
    try {
      const quizData = await getQuizzes(subject, userRank as QuizRank)
      const rankMap = { 1: "BRONZE", 2: "SILVER", 3: "GOLD" } as const;
      const filteredQuizzes = quizData.filter(
        (quiz: Quiz) => quiz.quizRank === rankMap[quiz_rank as keyof typeof rankMap]
      );
      setQuizzes(filteredQuizzes)
      //const resultsData = await getUserQuizResults()
      //setQuizResults(resultsData)
    } catch (err) {
      console.error("퀴즈 데이터 로딩 실패:", err)
    } finally {
      setLoadingQuizzes(false)
    }
  }

  // subject, level이 바뀔 때마다 퀴즈 다시 로드
  useEffect(() => {
    if (isAuthenticated && !loading) {
      loadQuizData()
    }
  }, [subject, quiz_rank, isAuthenticated, loading])

  // 퀴즈 선택 처리
  const handleSelectQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz)
    setSelectedAnswer("")
  }

  // 퀴즈 답변 제출
  const handleSubmitAnswer = async () => {
    if (!selectedQuiz || !selectedAnswer) return
    try {
      const result = await checkQuizAnswer(selectedQuiz.quizId, selectedAnswer)
      setResultDialog({
        open: true,
        correct: result.isCorrect,
        message: result.isCorrect ? "정답입니다!" : "오답입니다. 다시 시도해보세요.",
      })

      // 퀴즈 결과 업데이트
      await loadQuizData()
    } catch (err) {
      setResultDialog({
        open: true,
        correct: false,
        message: "정답 제출 중 오류가 발생했습니다.",
      })
    }
  }

  // 퀴즈 레벨에 따른 접근 권한 확인
  const canAccessLevel = (level: number) => {
    if (userRank === "GOLD") return level <= 3
    if (userRank === "SILVER") return level <= 2
    return level <= 1 // BRONZE
  }

  // 이미 푼 퀴즈인지 확인
  const getQuizResult = (quizId: number) => {
    return quizResults.find((result) => result.quizId.quizId === quizId)
  }

  // 로딩 중일 때 표시할 UI
  if (loading || loadingQuizzes) {
    return <div className="flex justify-center items-center min-h-[60vh]">로딩 중...</div>
  }

  // 인증되지 않은 경우 (리다이렉트 전)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">퀴즈 풀기</h1>

      {/* 과목 선택 드롭다운 */}
      <div className="mb-4">
        <label>과목 선택: </label>
        <select value={subject} onChange={e => setSubject(e.target.value)}>
          {SUBJECTS.map(subj => (
            <option key={subj} value={subj}>{subj}</option>
          ))}
        </select>
        <label className="ml-4">레벨: </label>
        <select value={quiz_rank} onChange={e => setLevel(Number(e.target.value))}>
          {[1, 2, 3].map(lv => (
            <option key={lv} value={lv}>{lv}</option>
          ))}
        </select>
      </div>

      <Tabs value={quiz_rank.toString()} onValueChange={val => setLevel(Number(val))}>
        <TabsList className="mb-4">
          <TabsTrigger value="1">레벨 1</TabsTrigger>
          <TabsTrigger value="2" disabled={!canAccessLevel(2)}>
            레벨 2
          </TabsTrigger>
          <TabsTrigger value="3" disabled={!canAccessLevel(3)}>
            레벨 3
          </TabsTrigger>
        </TabsList>

        {[1, 2, 3].map((level) => (
          <TabsContent key={level} value={level.toString()} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quizzes
                .filter((quiz) => quiz.quizLevel === level)
                .map((quiz) => {
                  const result = getQuizResult(quiz.quizId)
                  const resultColor = result ? (result.isCorrect ? "border-green-500" : "border-red-500") : ""

                  return (
                    <Card
                      key={quiz.quizId}
                      className={`cursor-pointer hover:shadow-md transition-shadow ${resultColor} ${selectedQuiz?.quizId === quiz.quizId ? "ring-2 ring-emerald-500" : ""}`}
                      onClick={() => handleSelectQuiz(quiz)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {result &&
                            (result.isCorrect ? (
                              <CheckCircle className="text-green-500 h-5 w-5" />
                            ) : (
                              <XCircle className="text-red-500 h-5 w-5" />
                            ))}
                          {quiz.quizContent}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="truncate">{quiz.quizContent}</p>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* 선택한 퀴즈 풀기 */}
      {selectedQuiz && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>{selectedQuiz.quizContent}</CardTitle>
            <CardDescription>레벨 {selectedQuiz.quizLevel} 퀴즈</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{selectedQuiz.quizContent}</p>
            <div className="space-y-2">
              {/* 2지선다 */}
              {selectedQuiz.option2 && (
                <div>
                  <label htmlFor={`quiz-${selectedQuiz.quizId}-choiceA`} className="block font-medium">
                    {selectedQuiz.option2.choiceA}
                  </label>
                  <input
                    id={`quiz-${selectedQuiz.quizId}-choiceA`}
                    type="radio"
                    name={`quiz-${selectedQuiz.quizId}-choice`}
                    value={selectedQuiz.option2.choiceA}
                    checked={selectedAnswer === selectedQuiz.option2.choiceA}
                    onChange={(e) => { handleSelectQuiz(selectedQuiz); setSelectedAnswer(e.target.value) }}
                  />
                </div>
              )}
              {/* 4지선다 */}
              {selectedQuiz.option4 && (
                <div>
                  <label htmlFor={`quiz-${selectedQuiz.quizId}-choiceA`} className="block font-medium">
                    {selectedQuiz.option4.choiceA}
                  </label>
                  <input
                    id={`quiz-${selectedQuiz.quizId}-choiceA`}
                    type="radio"
                    name={`quiz-${selectedQuiz.quizId}-choice`}
                    value={selectedQuiz.option4.choiceA}
                    checked={selectedAnswer === selectedQuiz.option4.choiceA}
                    onChange={(e) => { handleSelectQuiz(selectedQuiz); setSelectedAnswer(e.target.value) }}
                  />
                  <label htmlFor={`quiz-${selectedQuiz.quizId}-choiceB`} className="block font-medium ml-4">
                    {selectedQuiz.option4.choiceB}
                  </label>
                  <input
                    id={`quiz-${selectedQuiz.quizId}-choiceB`}
                    type="radio"
                    name={`quiz-${selectedQuiz.quizId}-choice`}
                    value={selectedQuiz.option4.choiceB}
                    checked={selectedAnswer === selectedQuiz.option4.choiceB}
                    onChange={(e) => { handleSelectQuiz(selectedQuiz); setSelectedAnswer(e.target.value) }}
                  />
                  <label htmlFor={`quiz-${selectedQuiz.quizId}-choiceC`} className="block font-medium ml-4">
                    {selectedQuiz.option4.choiceC}
                  </label>
                  <input
                    id={`quiz-${selectedQuiz.quizId}-choiceC`}
                    type="radio"
                    name={`quiz-${selectedQuiz.quizId}-choice`}
                    value={selectedQuiz.option4.choiceC}
                    checked={selectedAnswer === selectedQuiz.option4.choiceC}
                    onChange={(e) => { handleSelectQuiz(selectedQuiz); setSelectedAnswer(e.target.value) }}
                  />
                  <label htmlFor={`quiz-${selectedQuiz.quizId}-choiceD`} className="block font-medium ml-4">
                    {selectedQuiz.option4.choiceD}
                  </label>
                  <input
                    id={`quiz-${selectedQuiz.quizId}-choiceD`}
                    type="radio"
                    name={`quiz-${selectedQuiz.quizId}-choice`}
                    value={selectedQuiz.option4.choiceD}
                    checked={selectedAnswer === selectedQuiz.option4.choiceD}
                    onChange={(e) => { handleSelectQuiz(selectedQuiz); setSelectedAnswer(e.target.value) }}
                  />
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSubmitAnswer} disabled={!selectedAnswer}>
              제출하기
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* 결과 다이얼로그 */}
      <Dialog open={resultDialog.open} onOpenChange={open => setResultDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{resultDialog.correct ? "정답입니다!" : "오답입니다."}</DialogTitle>
          </DialogHeader>
          <div>{resultDialog.message}</div>
          <DialogFooter>
            <Button onClick={() => setResultDialog(prev => ({ ...prev, open: false }))}>확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
