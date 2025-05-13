"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// 기본 정보 타입
type BasicInfo = {
  id: string
  password: string
  nickname: string
  name: string
  gender: string
  age: number
  userRank: string
}

type BasicInfoFormProps = {
  initialData: BasicInfo
  onSubmit: (data: BasicInfo) => void
}

export function BasicInfoForm({ initialData, onSubmit }: BasicInfoFormProps) {
  const [formData, setFormData] = useState<BasicInfo>(initialData)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "age" ? Number.parseInt(value) || 0 : value,
    }))
  }

  const handleGenderChange = (value: string) => {
    setFormData((prev) => ({ ...prev, gender: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // 닉네임이 없으면 아이디를 닉네임으로 설정
    const dataToSubmit = {
      ...formData,
      nickname: formData.nickname || formData.id,
    }

    onSubmit(dataToSubmit)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 아이디 */}
      <div className="space-y-2">
        <Label htmlFor="id">아이디 *</Label>
        <Input
          id="id"
          name="id"
          value={formData.id}
          onChange={handleChange}
          required
          placeholder="사용할 아이디를 입력하세요"
        />
      </div>

      {/* 비밀번호 */}
      <div className="space-y-2">
        <Label htmlFor="password">비밀번호 *</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          placeholder="비밀번호를 입력하세요"
        />
      </div>

      {/* 닉네임 */}
      <div className="space-y-2">
        <Label htmlFor="nickname">닉네임 (입력하지 않으면 아이디가 닉네임이 됩니다)</Label>
        <Input
          id="nickname"
          name="nickname"
          value={formData.nickname}
          onChange={handleChange}
          placeholder="사용할 닉네임을 입력하세요"
        />
      </div>

      {/* 이름 */}
      <div className="space-y-2">
        <Label htmlFor="name">이름 *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="이름을 입력하세요"
        />
      </div>

      {/* 성별 */}
      <div className="space-y-2">
        <Label>성별 *</Label>
        <RadioGroup value={formData.gender} onValueChange={handleGenderChange} className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="MALE" id="male" />
            <Label htmlFor="male">남성</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="FEMALE" id="female" />
            <Label htmlFor="female">여성</Label>
          </div>
        </RadioGroup>
      </div>

      {/* 나이 */}
      <div className="space-y-2">
        <Label htmlFor="age">나이 *</Label>
        <Input
          id="age"
          name="age"
          type="number"
          min="1"
          max="120"
          value={formData.age || ""}
          onChange={handleChange}
          required
          placeholder="나이를 입력하세요"
        />
      </div>

      {/* 회원 등급 (숨김 - 기본값 사용) */}
      <input type="hidden" name="userRank" value={formData.userRank} />

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "처리 중..." : "다음 단계로"}
      </Button>
    </form>
  )
}
