import React from "react";

interface RankProgressBarProps {
  currentStat: number;
  currentRank: string;
  nextRankThreshold: number;
}

// 랜크별 임계값 정의 (백엔드 로직과 일치)
const RANK_THRESHOLDS = {
  BRONZE: 0,
  SILVER: 900,
  GOLD: 1200,
};

// 다음 랭크 매핑
const NEXT_RANK_MAP: { [key: string]: string } = {
  "BRONZE": "SILVER",
  "SILVER": "GOLD",
};

export const RankProgressBar: React.FC<RankProgressBarProps> = ({
  currentStat,
  currentRank,
  nextRankThreshold, // 이 매개변수는 유지하되 아래에서 내부적으로 계산한 값을 사용
}) => {
  // 현재 랜크에 해당하는 임계값
  const previousRankThreshold = RANK_THRESHOLDS[currentRank as keyof typeof RANK_THRESHOLDS] || 0;
  
  // 다음 랜크 결정 및 해당 임계값 가져오기
  const nextRank = NEXT_RANK_MAP[currentRank] || currentRank;
  const calculatedNextThreshold = RANK_THRESHOLDS[nextRank as keyof typeof RANK_THRESHOLDS] || previousRankThreshold;
  
  // 다음 랜크와의 차이
  const thresholdDifference = calculatedNextThreshold - previousRankThreshold;
  
  // 현재 스탯과 현재 랜크 임계값의 차이
  const statDifference = Math.max(0, currentStat - previousRankThreshold);
  
  // 진행률 계산 (0~100% 사이로 제한)
  const progress = thresholdDifference > 0 
    ? Math.min(Math.floor((statDifference / thresholdDifference) * 100), 100) 
    : 0;
  
  // 8칸으로 표시하기 위한 블록 계산
  const filledBlocks = Math.floor((progress / 100) * 8);
  
  // 다음 랜크까지 필요한 스탯 계산
  const remainingStats = Math.max(0, calculatedNextThreshold - currentStat);
  
  return (
    <div className="mt-2 mb-3">
      <div className="flex items-center">
        <div className="text-sm font-medium text-gray-700 mr-2">다음 랭크까지:</div>
        <div className="flex-1 h-5 bg-gray-200 rounded-full overflow-hidden">
          <div className="flex">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`h-5 border-r border-gray-100 ${
                  i < filledBlocks ? "bg-emerald-600" : "bg-gray-300"
                }`}
                style={{ width: "12.5%" }}
              ></div>
            ))}
          </div>
        </div>
        <div className="ml-2 text-sm font-medium text-gray-700">
          {progress}% | 남은 스탯: {remainingStats}
        </div>
      </div>
      
      <div className="mt-1 text-xs text-gray-500 flex justify-between">
        <span>{currentRank}</span>
        <span>
          {currentRank === "BRONZE" ? "SILVER" : 
           currentRank === "SILVER" ? "GOLD" : 
           currentRank === "GOLD" ? "PLATINUM" : "다음 랭크"}
        </span>
      </div>
    </div>
  );
};

export default RankProgressBar;
