"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import Cookies from "js-cookie"
import {
  getNews,
  getNewsById,
  checkNewsQuizAnswer,
  getNewsExplanation,
} from "@/lib/api"
import { logEvent } from "@/lib/analytics"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ReactConfetti from 'react-confetti'
import { useWindowSize } from 'react-use'

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
  newsquizLevel: number    // DB 컬럼 매핑
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
  const { isAuthenticated, loading, user } = useAuth()
  const [news, setNews] = useState<News[]>([])
  const [loadingNews, setLoadingNews] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [showHint, setShowHint] = useState<{[key: number]: boolean}>({})
  
  // 랭크 승급 관련 상태
  const [prevRank, setPrevRank] = useState<string | null>(null)
  const [showRankUpModal, setShowRankUpModal] = useState(false)
  const [newRank, setNewRank] = useState<string>("") 
  const [showConfetti, setShowConfetti] = useState(false)
  const { width, height } = useWindowSize()
  
  // 사용자가 선택한 답
  const [answers, setAnswers] = useState<{ [id: number]: string }>({})
  
  // 제출 완료된 퀴즈 ID 집합
  const [completed, setCompleted] = useState<Set<number>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('completedQuizzes')
      return saved ? new Set(JSON.parse(saved)) : new Set()
    }
    return new Set()
  })
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('completedQuizzes', JSON.stringify(Array.from(completed)))
    }
  }, [completed])
  
  // 결과 모달 관련 상태
  const [showResultModal, setShowResultModal] = useState(false)
  const [currentResult, setCurrentResult] = useState<{
    quizId: number,
    correct: boolean,
    message: string,
    points?: number
  } | null>(null)
  
  // AI 해설 관련 상태
  const [showAiExplanation, setShowAiExplanation] = useState<number | null>(null)
  const [aiExplanations, setAiExplanations] = useState<{[key: number]: string}>({})
  const [loadingAiExplanation, setLoadingAiExplanation] = useState<boolean>(false)

  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/")
      } else {
        loadNews()
        loadUserRank()
      }
    }
  }, [isAuthenticated, loading, currentPage])
  
  const loadUserRank = async () => {
    try {
      const token = Cookies.get("jwt_token");
      const response = await fetch("http://52.78.4.114:8085/users/getUserinfo", {
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const userInfo = await response.json();
      if (userInfo.success) {
        setPrevRank(userInfo.data.userrank)
      }
    } catch {
      // 무시
    }
  }

  // 뉴스 로딩 (로그는 펼치기/접기에서만 처리)
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

  // 1) 뉴스 펼침/접기 핸들러
  const toggleNews = async (newsItem: News) => {
    // 접기
    if (newsItem.isExpanded) {
      setNews(news.map(n =>
        n.newsId === newsItem.newsId
          ? { ...n, isExpanded: false }
          : n
      ))
      // 📌 로그: 뉴스 접기
      await logEvent("newsCollapsed", { newsId: String(newsItem.newsId) })
      return
    }

    // 이전 열린 글 접기
    const prev = news.find(n => n.isExpanded)
    if (prev) {
      // 📌 로그: 이전 뉴스 접기
      await logEvent("newsCollapsed", { newsId: String(prev.newsId) })
    }

    // 새로 펼치기
    setNews(news.map(n =>
      n.newsId === newsItem.newsId
        ? { ...n, isExpanded: true }
        : { ...n, isExpanded: false }
    ))
    // 📌 로그: 뉴스 펼치기
    await logEvent("newsExpanded", { newsId: String(newsItem.newsId), experimentNewsLayout: "default" })

    // 상세 및 퀴즈 로드
    if (!newsItem.newsQuizzes?.length) {
      try {
        const full = await getNewsById(newsItem.newsId)
        setNews(n =>
          n.map(x =>
            x.newsId === newsItem.newsId
              ? { ...x, newsQuizzes: full.newsQuizzes || [], isExpanded: true }
              : x
          )
        )
      } catch {
        // 무시
      }
    }
  }

  // 2) AI 요약 토글 + 호출 시간 측정
  const toggleAiExplanation = async (newsId: number) => {
    if (showAiExplanation === newsId) {
      setShowAiExplanation(null)
      return
    }
    setShowAiExplanation(newsId)
    setLoadingAiExplanation(true)
    const item = news.find(n => n.newsId === newsId)
    if (!item) return

    const start = performance.now()
    try {
      const resp = await fetch("http://43.202.154.216:8000/api/news/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ news: item.description })
      })
      const data = await resp.json()
      const duration = Math.round(performance.now() - start)

      // 📌 로그: AI 위젯 호출
      await logEvent("aiWidgetCalled", { 
        newsId: String(newsId), 
        summaryLength: item.description.length, 
        summaryStyle: "bullet", 
        experimentNewsLayout: "default", 
        summaryRequestTimeMs: duration 
      })

      setAiExplanations(p => ({
        ...p,
        [newsId]: data.summary || data.explanation || ""
      }))
      
      // 힌트 사용 여부 업데이트
      setShowHint(p => ({
        ...p,
        [newsId]: true
      }))
    } catch (e) {
      console.error("AI 해설 오류:", e)
      setAiExplanations(p => ({
        ...p,
        [newsId]: "AI가 이 뉴스에 대한 내용을 분석하지 못했습니다. 다시 시도해주세요."
      }))
    } finally {
      setLoadingAiExplanation(false)
    }
  }

  // 3) 뉴스 퀴즈 제출 핸들러
  const submitAnswer = async (quizId: number, answer: string) => {
    if (!answer) return
    try {
      const result = await checkNewsQuizAnswer(quizId, answer)
      setAnswers(prev => ({ ...prev, [quizId]: answer }))
      setCompleted(prev => {
        const newSet = new Set(prev)
        if (result.isCorrect) {
          newSet.add(quizId)
        }
        return newSet
      })

      // 결과 모달 표시
      setCurrentResult({
        quizId: result.newsQuizId,
        correct: result.isCorrect,
        message: result.message,
        points: result.bonusPoints
      })
      setShowResultModal(true)

      // 랭크 업데이트 확인
      if (result.isCorrect) {
        try {
          const token = Cookies.get("jwt_token");
          const response = await fetch("http://52.78.4.114:8085/users/getUserinfo", {
            credentials: "include",
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          const userInfo = await response.json();
          if (userInfo.success) {
            const currentRank = userInfo.data.userrank;
            if (prevRank && prevRank !== currentRank) {
              setNewRank(currentRank);
              setShowConfetti(true);
              setShowRankUpModal(true);
              setTimeout(() => setShowConfetti(false), 5000);
              setPrevRank(currentRank); // 랭크 업데이트 후 현재 랭크를 이전 랭크로 저장
            }
          }
        } catch (error) {
          console.error("랭크 정보 가져오기 실패:", error);
        }
      }
      
      // 📌 로그: 퀴즈 제출
      await logEvent("newsQuizClicked", { 
        newsId: result.newsQuizId, // 해당 퀴즈가 속한 뉴스 ID가 필요할 경우
        quizId: quizId, 
        quizLevel: result.newsQuizLevel, 
        isCorrect: result.isCorrect, 
        bonusPoints: result.bonusPoints, 
        totalPoints: result.totalPoints, 
        originalPoints: result.originalPoints, 
        luckStat: result.luckStat, 
        hintUsed: !!showHint[quizId]
      })

    } catch (e) {
      console.error("퀴즈 제출 오류:", e)
    }
  }

  const logNewsViewed = (newsItem: News) => {
    logEvent("newsViewed", { newsId: newsItem.newsId, experimentNewsLayout: "default" })
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
                    
                    {/* AI 요약/해설 */}
                    <div className="mt-4 p-4 border rounded-md bg-gray-50">
                      <h3 className="font-bold mb-2">AI 요약 & 해설</h3>
                      {aiExplanations[newsItem.newsId] ? (
                        <p className="text-sm whitespace-pre-line">{aiExplanations[newsItem.newsId]}</p>
                      ) : loadingAiExplanation ? (
                        <div className="text-center text-gray-500 flex items-center justify-center"><svg className="animate-spin h-5 w-5 mr-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> AI 분석 중...</div>
                      ) : (
                        <p className="text-sm text-gray-500">AI가 이 뉴스에 대한 내용을 분석하지 못했습니다. 다시 시도해주세요.</p>
                      )}
                    </div>
                    <Button onClick={() => toggleAiExplanation(newsItem.newsId)} variant="outline" className="mt-2">
                      {showAiExplanation === newsItem.newsId ? "AI 요약/해설 닫기" : "AI 요약/해설 보기"}
                    </Button>
                    
                    {/* 뉴스 퀴즈 */}
                    {newsItem.newsQuizzes && newsItem.newsQuizzes.length > 0 && (
                      <div className="mt-6 space-y-4">
                        <h3 className="text-md font-semibold">뉴스 퀴즈</h3>
                        {newsItem.newsQuizzes.map(quiz => {
                          const isDone = completed.has(quiz.newsquizId);
                          return (
                            <Card key={quiz.newsquizId} className="border p-4">
                              <p className="font-medium mb-2">{quiz.newsquizContent}</p>
                              <div className="space-y-2">
                                {[quiz.newsquizChoiceA, quiz.newsquizChoiceB, quiz.newsquizChoiceC, quiz.newsquizChoiceD].map((choice, idx) => (
                                  <label key={idx} className="block">
                                    <input
                                      type="radio"
                                      name={`quiz-${quiz.newsquizId}`}
                                      value={`${idx + 1}`}
                                      disabled={isDone}
                                      checked={answers[quiz.newsquizId] === `${idx + 1}`}
                                      onChange={() => setAnswers(a => ({ ...a, [quiz.newsquizId]: `${idx + 1}` })) }
                                      className="mr-2"
                                    />
                                    {choice}
                                  </label>
                                ))}
                              </div>
                              <Button
                                onClick={() => submitAnswer(quiz.newsquizId, answers[quiz.newsquizId])}
                                disabled={isDone || !answers[quiz.newsquizId]}
                                className="mt-4"
                              >
                                {isDone ? "제출 완료" : "제출하기"}
                              </Button>
                            </Card>
                          );
                        })}
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
                  <p className="text-lg font-bold text-green-600">+{currentResult.points || 0}점</p>
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
