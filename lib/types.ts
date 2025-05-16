export enum QuizRank {
    BRONZE = "BRONZE",
    SILVER = "SILVER",
    GOLD = "GOLD",
  }

  export interface LeaderboardDto {
    userId: number
    nickname: string
    statSum: number
  }

  export interface Page<T> {
    content: T[]
    totalPages: number
    totalElements: number
    size: number
    number: number           // 현재 페이지 (0부터 시작)
    numberOfElements: number // 이 페이지에 담긴 요소 개수
    first: boolean
    last: boolean
  }