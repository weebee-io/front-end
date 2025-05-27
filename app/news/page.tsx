"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import {
  getNews,
  getNewsById,
  checkNewsQuizAnswer,
} from "@/lib/api"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// 뉴스 타입 정의
type News = {
  newsId: number
  title: string
  description: string
  url: string
  publishedDate: string
  source: string
  createdAt: string
  newsQuizzes: NewsQuiz[]
  isExpanded?: boolean
}

// 뉴스 퀴즈 타입 정의
type NewsQuiz = {
  newsquizId: number
  newsquizScore: number
  newsquizContent: string
  newsquizChoiceA: string
  newsquizChoiceB: string
  newsquizChoiceC: string
  newsquizChoiceD: string
  newsquizCorrectAns: string
}

// 퀴즈 결과 타입 정의
type QuizResult = {
  bonusPoints?: number
  newsQuizId: number
  luckStat?: number
  totalPoints?: number
  originalPoints?: number
  message: string
  userId: number
  isCorrect: boolean
}

export default function NewsPage() {
  const { isAuthenticated, loading } = useAuth()
  const [news, setNews] = useState<News[]>([])
  const [loadingNews, setLoadingNews] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  
  // 사용자가 선택한 답
  const [answers, setAnswers] = useState<{ [id: number]: string }>({})
  
  // 제출 완료된 퀴즈 ID 집합
  const [completed, setCompleted] = useState<Set<number>>(new Set())
  
  // 결과 모달 관련 상태
  const [showResultModal, setShowResultModal] = useState(false)
  const [currentResult, setCurrentResult] = useState<{
    quizId: number,
    correct: boolean,
    message: string,
    points?: number
  } | null>(null)
  
  // AI 해설 표시 상태
  const [showAiExplanation, setShowAiExplanation] = useState<number | null>(null)

  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/")
      } else {
        loadNews()
      }
    }
  }, [isAuthenticated, loading, currentPage])

  // 뉴스 로딩
  async function loadNews() {
    setLoadingNews(true)
    try {
      const response = await getNews(currentPage, 10)
      setNews(response.content.map((item: News) => ({
        ...item,
        isExpanded: false
      })))
      setTotalPages(response.totalPages)
    } catch (e) {
      console.error("뉴스 로드 실패", e)
    } finally {
      setLoadingNews(false)
    }
  }

  // 뉴스 펼침/접기 핸들러
  const toggleNews = async (newsItem: News) => {
    // 이미 펼쳐진 뉴스를 접는 경우
    if (newsItem.isExpanded) {
      setNews(news.map(n => 
        n.newsId === newsItem.newsId 
          ? { ...n, isExpanded: false } 
          : n
      ))
      return
    }
    
    // 새로운 뉴스를 펼치는 경우
    setNews(news.map(n => 
      n.newsId === newsItem.newsId 
        ? { ...n, isExpanded: true } 
        : { ...n, isExpanded: false }
    ))
    
    // 이미 newsQuizzes가 있으면 다시 로드할 필요 없음
    if (!newsItem.newsQuizzes || newsItem.newsQuizzes.length === 0) {
      try {
        const fullNews = await getNewsById(newsItem.newsId)
        setNews(news.map(n => 
          n.newsId === newsItem.newsId 
            ? { ...n, newsQuizzes: fullNews.newsQuizzes || [], isExpanded: true } 
            : n
        ))
      } catch (e) {
        console.error("뉴스 상세 로드 실패", e)
      }
    }
  }
  
  // AI 해설 토글
  const toggleAiExplanation = (newsId: number) => {
    if (showAiExplanation === newsId) {
      setShowAiExplanation(null)
    } else {
      setShowAiExplanation(newsId)
    }
  }

  // 퀴즈 제출 핸들러
  const submitAnswer = async (quizId: number, answer: string) => {
    if (!answer) return

    try {
      const result: QuizResult = await checkNewsQuizAnswer(quizId, answer)
      
      // 결과 모달 표시
      setCurrentResult({
        quizId,
        correct: result.isCorrect,
        message: result.message,
        points: result.isCorrect ? (result.totalPoints || result.originalPoints) : undefined
      })
      setShowResultModal(true)
      
      if (result.isCorrect) {
        setCompleted(prev => new Set(prev).add(quizId))
      }
    } catch (e) {
      // 오류 모달 표시
      setCurrentResult({
        quizId,
        correct: false,
        message: "제출 오류가 발생했습니다."
      })
      setShowResultModal(true)
    }
  }

  if (loading || loadingNews) {
    return <div className="p-8 text-center">로딩 중...</div>
  }
  if (!isAuthenticated) return null

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-8 px-4">
      <h1 className="text-2xl font-bold">금융 뉴스</h1>

      {/* 페이지네이션 */}
      <div className="flex justify-between items-center">
        <Button 
          onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
          disabled={currentPage === 0}
          variant="outline"
        >
          이전
        </Button>
        <span>
          페이지 {currentPage + 1} / {totalPages || 1}
        </span>
        <Button 
          onClick={() => setCurrentPage(p => p + 1)}
          disabled={currentPage >= totalPages - 1}
          variant="outline"
        >
          다음
        </Button>
      </div>

      {/* 뉴스가 없으면 */}
      {news.length === 0 && !loadingNews && (
        <div className="text-gray-500 text-center py-8">
          현재 뉴스가 없습니다.
        </div>
      )}

      {/* 뉴스 목록 */}
      <div className="space-y-4">
        {news.map((newsItem) => (
          <Card key={newsItem.newsId} className="border">
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-center">
                <span>{newsItem.title}</span>
                <span className="text-sm text-gray-500">{new Date(newsItem.publishedDate).toLocaleDateString()}</span>
              </CardTitle>
            </CardHeader>

            {!newsItem.isExpanded ? (
              <CardFooter className="pt-2">
                <Button
                  onClick={() => toggleNews(newsItem)}
                  className="w-full"
                >
                  기사 읽기
                </Button>
              </CardFooter>
            ) : (
              <>
                <CardContent>
                  <div className="prose max-w-none">
                    <div className="mb-4">
                      <h3 className="text-sm text-gray-500 mb-2">출처: {newsItem.source}</h3>
                      <p className="whitespace-pre-line">{newsItem.description}</p>
                      <a href={newsItem.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mt-2 inline-block">
                        원문 보기
                      </a>
                    </div>
                    
                    {/* 액션 버튼 */}
                    <div className="flex gap-2 mt-4">
                      <Button 
                        onClick={() => toggleAiExplanation(newsItem.newsId)}
                        variant="outline"
                        className="flex-1"
                      >
                        {showAiExplanation === newsItem.newsId ? "AI 해설 닫기" : "AI 해설 보기"}
                      </Button>
                    </div>
                    
                    {/* AI 해설 영역 */}
                    {showAiExplanation === newsItem.newsId && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-md">
                        <h3 className="font-semibold mb-2">AI 해설</h3>
                        <p className="text-gray-600">
                          현재 AI 해설 기능은 개발 중입니다. 곧 제공될 예정입니다.
                        </p>
                      </div>
                    )}
                    
                    {/* 퀴즈 섹션 */}
                    {newsItem.newsQuizzes && newsItem.newsQuizzes.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-4">뉴스 퀴즈</h3>
                        
                        {newsItem.newsQuizzes.map((quiz) => {
                          const isDone = completed.has(quiz.newsquizId);
                          return (
                            <div key={quiz.newsquizId} className="border rounded-md p-4 mb-4">
                              <div className="font-medium mb-3">{quiz.newsquizContent}</div>
                              
                              <div className="space-y-2">
                                {[
                                  { value: "A", text: quiz.newsquizChoiceA },
                                  { value: "B", text: quiz.newsquizChoiceB },
                                  { value: "C", text: quiz.newsquizChoiceC },
                                  { value: "D", text: quiz.newsquizChoiceD }
                                ].map(({ value, text }) => (
                                  <label key={value} className="block">
                                    <input
                                      type="radio"
                                      name={`answer-${quiz.newsquizId}`}
                                      value={value}
                                      disabled={isDone}
                                      checked={answers[quiz.newsquizId] === value}
                                      onChange={() =>
                                        setAnswers(a => ({ ...a, [quiz.newsquizId]: value }))
                                      }
                                      className="mr-2"
                                    />
                                    {text}
                                  </label>
                                ))}
                              </div>
                              
                              <div className="mt-4">
                                <Button
                                  onClick={() => submitAnswer(quiz.newsquizId, answers[quiz.newsquizId])}
                                  disabled={isDone || !answers[quiz.newsquizId]}
                                  size="sm"
                                >
                                  {isDone ? "제출 완료" : "제출하기"}
                                </Button>
                                
                                {isDone && (
                                  <span className="ml-2 text-sm text-green-600">
                                    ✓ 정답 완료 (+{quiz.newsquizScore}점)
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {(!newsItem.newsQuizzes || newsItem.newsQuizzes.length === 0) && (
                      <div className="mt-6 text-center py-4 text-gray-500">
                        이 뉴스에 대한 퀴즈가 없습니다.
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    onClick={() => toggleNews(newsItem)}
                    variant="outline"
                    className="w-full"
                  >
                    닫기
                  </Button>
                </CardFooter>
              </>
            )}
          </Card>
        ))}
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
                  {currentResult.points && (
                    <p className="text-lg font-bold text-green-600">+{currentResult.points}점</p>
                  )}
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
