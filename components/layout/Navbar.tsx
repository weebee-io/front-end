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

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* 로고 */}
          <Link href="/" className="flex items-center">
            <Image src="/placeholder.svg?height=40&width=40" alt="로고" width={40} height={40} className="mr-2" />
            <span className="font-bold text-xl">금융 서비스</span>
          </Link>

          {/* 네비게이션 링크 */}
          <div className="flex items-center space-x-4">
            <Link href="/profile" className="px-3 py-2 rounded-md hover:bg-gray-100">
              내 정보
            </Link>
            <Link href="/quiz" className="px-3 py-2 rounded-md hover:bg-gray-100">
              퀴즈 풀기
            </Link>

            {/* 로그인/로그아웃 버튼 */}
            {isAuthenticated ? (
              <Button variant="outline" onClick={() => setShowLogoutDialog(true)} className="flex items-center gap-1">
                <LogOut className="h-4 w-4" />
                로그아웃
              </Button>
            ) : (
              <Link href="/login">
                <Button variant="default">로그인</Button>
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
