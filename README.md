# AI 프로젝트: **Weebee Frontend**

> 금융 이해도 분석 / 랭크 배정 / 예측 모델링을 시각화·인터랙션으로 제공하는 **Next.js** 기반 프런트엔드

---

## 📂 프로젝트 구조

> **추후 변경 시 이 섹션을 업데이트하세요.**

```bash
weebee-frontend/
├── app/                       # Next.js App Router (페이지별 라우트)
│   ├── (auth)/                # 인증 관련 세그먼트
│   ├── dashboard/             # 금융 이해도 대시보드
│   └── layout.tsx             # 루트 레이아웃
├── components/                # 재사용 컴포넌트 (shadcn/ui 래핑 포함)
├── hooks/                     # 커스텀 React 훅
├── lib/                       # API 클라이언트 · 유틸 함수
├── public/                    # 정적 자산
├── styles/                    # 글로벌 스타일(Tailwind)·폰트
├── .eslintrc.cjs
├── next.config.mjs
├── tailwind.config.ts
└── yarn.lock
```

---

## 👥 팀원 소개

| 이름   | 역할                 | GitHub |
|--------|----------------------|--------|
| 박혁준 | 프런트엔드 · API 연동| [@hyukjunmon](https://github.com/hyukjunmon) |
| 오세현 | 데이터 시각화        | [@MoominHunter](https://github.com/MoominHunter) |

---

## 🎯 프로젝트 목표

- ✅ 금융 소비자 **금융 이해도 시각화 & 랭크 UI** 제공  
- ✅ 백엔드 FastAPI 예측 API ↔ **프런트 연동**  
- ✅ 사용자 맞춤 **금융 퀴즈·추천** 인터랙션

---

## 🚀 실행 방법 (로컬 개발)

```bash
# 1. 의존성 설치
yarn install

# 2. 개발 서버 실행
yarn dev            # http://localhost:3000
```

프로덕션 빌드 & 실행:

```bash
yarn build          # .next/ 생성
yarn start          # NODE_ENV=production, 기본 PORT=3000
```

---

## 📊 사용 기술

| 영역        | 스택 |
|-------------|------|
| **프레임워크** | Next.js 14 (App Router) |
| **언어**    | TypeScript |
| **스타일**  | Tailwind CSS · shadcn/ui |
| **상태 관리** | React Query |
| **테스트**  | Jest · React Testing Library |
| **품질**    | ESLint · Prettier |
| **배포**    | Vercel / Docker (선택) |

---

## 🧪 테스트

```bash
yarn test
```

> **CI** 구축 시 PR 생성 시점에 자동 실행될 예정입니다.

---

## 📁 데이터 & API

- 백엔드 **FastAPI** 서비스에서 `/predict`, `/quiz` 등 엔드포인트 호출  
- 로컬 개발 시 `.env.local` 에 다음과 같이 설정:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🛠 향후 개선 계획

- [ ] **i18n**(국/영) 다국어 지원
- [ ] 접근성(A11y) 감사 자동화
- [ ] 실시간 소켓 기반 퀴즈 랭킹보드
- [ ] Lighthouse 기준 성능 90⁺ 유지

---

## 📄 라이선스

MIT License © 2025 AI Team
