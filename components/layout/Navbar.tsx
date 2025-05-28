"use client"

import { useAuth } from "@/components/auth/AuthProvider"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const handleLogout = () => {
    logout()
    setShowLogoutDialog(false)
  }

  // 로그인하지 않은 경우 네비게이션 바 숨기기
  if (!isAuthenticated) {
    return null
  }
  
  return (
    <nav className="bg-white shadow-sm pixel-border">
      <div className="container mx-auto px-4 py-5">
        <div className="flex justify-between items-center">
          {/* 로고 */}
          <Link href="/" className="flex items-center">
            <div className="mr-3 bg-black p-1 pixel-shadow">
              {/*<Image src="images/characters/weebeefriends.png" alt="로고" width={40} height={40} className="pixelated" />*/}
            </div>
            <span className="font-bold text-xl text-black">금융 학습 플랫폼</span>
          </Link>

          {/* 네비게이션 링크 */}
          <div className="flex items-center space-x-8">
            <Link href="/profile" className="px-4 py-2 rounded-none bg-white border-2 border-black pixel-shadow hover:translate-y-1 hover:translate-x-1 hover:shadow-sm transition-transform font-medium">
              내 정보
            </Link>
            <Link href="/quiz" className="px-4 py-2 rounded-none bg-white border-2 border-black pixel-shadow hover:translate-y-1 hover:translate-x-1 hover:shadow-sm transition-transform font-medium">
              퀴즈 풀기
            </Link>
            <Link href="/news" className="px-4 py-2 rounded-none bg-white border-2 border-black pixel-shadow hover:translate-y-1 hover:translate-x-1 hover:shadow-sm transition-transform font-medium">
              뉴스
            </Link>

            {/* 로그인/로그아웃 버튼 */}
            {isAuthenticated ? (
              <Button variant="outline" onClick={() => setShowLogoutDialog(true)} className="flex items-center gap-1 rounded-none bg-black text-white border-2 border-black hover:bg-gray-800 pixel-shadow">
                <LogOut className="h-4 w-4" />
                로그아웃
              </Button>
            ) : (
              <Link href="/login">
                <Button variant="default" className="rounded-none bg-black text-white border-2 border-black hover:bg-gray-800 pixel-shadow">로그인</Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 로그아웃 확인 다이얼로그 */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>로그아웃</DialogTitle>
            <DialogDescription>로그아웃 하시겠습니까?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
              취소
            </Button>
            <Button onClick={handleLogout}>로그아웃</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </nav>
  )
}
