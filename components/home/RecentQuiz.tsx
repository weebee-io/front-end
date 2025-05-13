import Link from "next/link"
import { CheckCircle, XCircle } from "lucide-react"

type QuizResult = {
  quizResultId: number
  isCorrect: boolean
  quizDate: string
  quizId: {
    quizId: number
    quizcontent: string
    subject: string
    quizLevel: number
    quizAnswer: string
  }
}

export function RecentQuiz({ quizResults }: { quizResults: QuizResult[] }) {
  // 최근 푼 퀴즈 3개만 표시
  const recentQuizzes = quizResults
    .sort((a, b) => new Date(b.quizDate).getTime() - new Date(a.quizDate).getTime())
    .slice(0, 3)

  if (recentQuizzes.length === 0) {
    return (
      <div className="mt-2">
        <p className="text-gray-500 mb-2">최근 푼 문제가 없습니다.</p>
        <Link
          href="/quiz"
          className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-md text-sm hover:bg-emerald-700 transition-colors"
        >
          퀴즈 풀러 가기
        </Link>
      </div>
    )
  }

  return (
    <div className="mt-2">
      <p className="font-semibold mb-2">최근 푼 문제:</p>
      <ul className="space-y-2">
        {recentQuizzes.map((quiz) => (
          <li key={quiz.quizResultId} className="flex items-center gap-2">
            {quiz.isCorrect ? (
              <CheckCircle className="text-green-500 h-5 w-5" />
            ) : (
              <XCircle className="text-red-500 h-5 w-5" />
            )}
            <span className="truncate">{quiz.quizId.quizcontent}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/quiz"
        className="inline-block mt-3 bg-emerald-600 text-white px-4 py-2 rounded-md text-sm hover:bg-emerald-700 transition-colors"
      >
        더 많은 퀴즈 풀기
      </Link>
    </div>
  )
}
