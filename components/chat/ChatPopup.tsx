"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"
import { MessageCircle, X, Send, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { sendChatMessage } from "@/lib/api"
import { logEvent } from "@/lib/analytics"

// 채팅 메시지 타입 정의
type Message = {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

type ChatPopupProps = {
  currentQuizId: number | null
  onChatUsed?: (quizId: number) => void
}

export function ChatPopup({ currentQuizId, onChatUsed }: ChatPopupProps) {
  const { isAuthenticated, user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [hasChatInteractionOccurredForCurrentQuiz, setHasChatInteractionOccurredForCurrentQuiz] = useState(false)

  // console.log(`[ChatPopup] 렌더링 - quizId: ${currentQuizId}, messages: ${messages.length}, inputValue: ${inputValue.length}`);

  useEffect(() => {
    console.log(`[ChatPopup] mounted - quizId: ${currentQuizId}`);
  }, []);

  // inputValue 변경 추적
  useEffect(() => {
    // console.log(`[ChatPopup] inputValue 변경됨: ${inputValue.length}자`);
  }, [inputValue]);

  // messages 변경 추적
  useEffect(() => {
    // console.log(`[ChatPopup] messages 변경됨: ${messages.length}개`);
  }, [messages]);

  // 채팅창이 열릴 때 인사 메시지 추가
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          content: "안녕하세요! 금융 관련 질문이 있으시면 언제든지 물어보세요.",
          isUser: false,
          timestamp: new Date(),
        },
      ])
    }
  }, [isOpen, messages.length])

  // 메시지가 추가될 때마다 스크롤을 아래로 이동
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 채팅창이 열릴 때 입력 필드에 포커스
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  // onChatUsed prop의 변경을 추적 (디버깅용)
  useEffect(() => {
    console.log(`[ChatPopup] onChatUsed prop changed. onChatUsed: ${!!onChatUsed}, typeof onChatUsed: ${typeof onChatUsed}`);
  }, [onChatUsed]);

  // 퀴즈가 변경될 때마다 상호작용 상태 초기화
  useEffect(() => {
    setHasChatInteractionOccurredForCurrentQuiz(false)
    // console.log(`[ChatPopup] currentQuizId changed to ${currentQuizId}, hasChatInteractionOccurredForCurrentQuiz reset to false`);
  }, [currentQuizId])

  // 스크롤을 맨 아래로 이동하는 함수
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // 채팅창 토글 함수
  const toggleChat = () => {
    const newIsOpen = !isOpen
    setIsOpen(newIsOpen)

    // 챗봇 사용 여부 로깅 (한 퀴즈당 한 번만)
    if (typeof currentQuizId === 'number') {
      // currentQuizId가 있을 때만 해당 퀴즈에 대한 chatPopupToggled 이벤트를 로깅
      logEvent("chatPopupToggled", {
        isOpen: newIsOpen,
        messageCount: messages.length,
        currentQuizId: currentQuizId,
      });
      // console.log(`[ChatPopup] chatPopupToggled event logged for quizId: ${currentQuizId}. isOpen: ${newIsOpen}`);
    } else {
      // currentQuizId가 없을 때도 chatPopupToggled 이벤트를 로깅하되, currentQuizId는 포함하지 않음
      logEvent("chatPopupToggled", {
        isOpen: newIsOpen,
        messageCount: messages.length,
      });
      // console.log(`[ChatPopup] chatPopupToggled event. currentQuizId is undefined. isOpen: ${newIsOpen}`);
    }
  }

  // 메시지 전송 함수
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log(`[ChatPopup] handleSendMessage called. onChatUsed: ${onChatUsed}, typeof onChatUsed: ${typeof onChatUsed}, currentQuizId: ${currentQuizId}, hasChatInteractionOccurredForCurrentQuiz: ${hasChatInteractionOccurredForCurrentQuiz}`);
    if (!inputValue.trim() || isLoading) return

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // 챗봇 사용 여부 로깅 (한 퀴즈당 한 번만)
    if (onChatUsed && typeof currentQuizId === 'number' && !hasChatInteractionOccurredForCurrentQuiz) {
      console.log(`[ChatPopup] Calling onChatUsed for quizId: ${currentQuizId}, hasChatInteractionOccurredForCurrentQuiz: ${hasChatInteractionOccurredForCurrentQuiz}`);
      onChatUsed(currentQuizId)
      setHasChatInteractionOccurredForCurrentQuiz(true)
    } else {
      console.log(`[ChatPopup] Not calling onChatUsed. onChatUsed: ${!!onChatUsed}, currentQuizId: ${currentQuizId}, hasChatInteractionOccurredForCurrentQuiz: ${hasChatInteractionOccurredForCurrentQuiz}`);
    }

    try {
      const startTime = Date.now()
      // API 호출
      const response = await sendChatMessage(inputValue)

      if (response.success) {
        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          content: response.answer,
          isUser: false,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, botMessage])

        // 메시지 전송 로그
        logEvent("chatMessageSent", {
          messageLength: inputValue.length,
          responseTimeMs: Date.now() - startTime,
          messageCount: messages.length + 2, // 사용자 메시지 + 봇 응답
          currentQuizId: currentQuizId || undefined,
          userId: user?.userId || undefined,
        })
      } else {
        throw new Error(response.error || "알 수 없는 오류 발생")
      }
    } catch (error: any) {
      console.error("채팅 메시지 전송 오류:", error)

      // 오류 메시지 추가
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: "죄송합니다. 메시지를 처리하는 중에 오류가 발생했습니다.",
        isUser: false,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])

      // 오류 로그
      logEvent("chatMessageError", {
        error: error.message,
        currentQuizId: currentQuizId || undefined,
        userId: user?.userId || undefined,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 인증되지 않은 사용자에게는 채팅창을 표시하지 않음
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* 채팅 버튼 */}
      <button
        onClick={toggleChat}
        className={`flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-colors ${
          isOpen ? "bg-red-500 hover:bg-red-600" : "bg-emerald-500 hover:bg-emerald-600"
        }`}
      >
        {isOpen ? <X className="text-white" /> : <MessageCircle className="text-white" />}
      </button>

      {/* 채팅창 */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 h-96 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden border border-gray-200">
          {/* 채팅창 헤더 */}
          <div className="bg-emerald-500 text-white p-3 flex justify-between items-center">
            <h3 className="font-medium">금융 도우미</h3>
            <button onClick={toggleChat} className="text-white hover:text-gray-200">
              <X size={18} />
            </button>
          </div>

          {/* 채팅 메시지 영역 */}
          <div className="flex-1 p-3 overflow-y-auto bg-gray-50">
            <div className="space-y-3">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.isUser
                        ? "bg-emerald-500 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-800 rounded-lg rounded-bl-none p-3 max-w-[80%]">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <p className="text-sm">답변 생성 중...</p>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* 메시지 입력 영역 */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200 flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="메시지를 입력하세요..."
              className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`p-2 rounded-r-md ${
                isLoading || !inputValue.trim()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-emerald-500 text-white hover:bg-emerald-600"
              }`}
              disabled={isLoading || !inputValue.trim()}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default React.memo(ChatPopup);