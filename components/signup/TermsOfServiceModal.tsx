import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onAgree: (consents: {
    privacy: boolean;
    marketing: boolean;
    myData: boolean;
    thirdParty: boolean;
  }) => void;
  onDecline: () => void;
}

export function TermsOfServiceModal({
  isOpen,
  onAgree,
  onDecline,
}: TermsOfServiceModalProps) {
  // ❶ 동의 체크 상태
  const [privacyChecked, setPrivacyChecked] = useState(false);       // 필수
  const [marketingChecked, setMarketingChecked] = useState(false);   // 선택
  const [thirdPartyChecked, setThirdPartyChecked] = useState(false); // 선택

  // ❷ "동의함" 버튼 활성화 여부 (필수 항목이 체크되어야 활성화)
  const [canAgree, setCanAgree] = useState(false);

  useEffect(() => {
    setCanAgree(privacyChecked); // 개인정보 동의만 필수
  }, [privacyChecked]);

  // ❸ 실제 동의 버튼 클릭 시, 부모에게 최종 동의 상태 전달
  const handleAgree = () => {
    if (!canAgree) return;
    onAgree({
      privacy: privacyChecked,
      marketing: marketingChecked,
      myData: false, // 마이데이터 항목 제거됨
      thirdParty: thirdPartyChecked,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>정보이용 동의</DialogTitle>
          <DialogDescription>
            서비스를 이용하기 위해 아래 각 항목에 동의해 주세요.
          </DialogDescription>
        </DialogHeader>

        {/* ❹ 동의 항목 리스트 */}
        <div className="max-h-[350px] overflow-y-auto my-4 text-sm p-4 border rounded-md space-y-4">
          {/* 1) 개인정보 수집·이용 (필수) */}
          <div>
            <h4 className="text-lg font-bold">■ 개인정보 수집·이용 동의 (필수)</h4>
            <p className="mt-2 text-gray-700">
              - 수집항목: 이름, 아이디, 비밀번호, 닉네임, 성별, 나이 <br />
              - 이용목적: 회원 식별, 콘텐츠 제공, 맞춤형 금융 교육, 서비스 개선, 통계 분석 <br />
              - 보유기간: 회원 탈퇴 시 까지 (관계법령 별도 보관 의무 시 해당 기간)
            </p>
            <label className="inline-flex items-center mt-2">
              <input
                type="checkbox"
                checked={privacyChecked}
                onChange={(e) => setPrivacyChecked(e.target.checked)}
                className="mr-2"
              />
              <span>위 1) 개인정보 수집·이용 내용에 동의합니다. (필수)</span>
            </label>
          </div>

          {/* 2) 마케팅 정보 수신 동의 (선택) */}
          <div>
            <h4 className="text-lg font-bold">■ 마케팅 정보 수신 동의 (선택)</h4>
            <p className="mt-2 text-gray-700">
              - 수집항목: 이메일, 휴대폰번호, SMS·푸시 수신여부 <br />
              - 이용목적: 이벤트/프로모션 안내, 신규 서비스 안내, 혜택 정보 제공 <br />
              - 보유기간: 동의 철회 전까지
            </p>
            <label className="inline-flex items-center mt-2">
              <input
                type="checkbox"
                checked={marketingChecked}
                onChange={(e) => setMarketingChecked(e.target.checked)}
                className="mr-2"
              />
              <span>위 2) 마케팅 정보 수신에 동의합니다. (선택)</span>
            </label>
          </div>


          {/* 3) 가명정보 제3자 제공 동의 (선택) */}
          <div>
            <h4 className="text-lg font-bold">■ 가명정보 제3자 제공 동의 (선택)</h4>
            <p className="mt-2 text-gray-700">
              - 제공내용: 가명 처리된 통계/분석 결과 (연령대, 성별, 소비 패턴, 투자 성향 등) <br />
              - 제공받는 자: ○○리서치, ○○광고사 등 <br />
              - 제공목적: 시장 조사, 통계 분석, 광고 타겟팅 향상 <br />
              - 보유기간: 제공 목적 달성 시까지 (최대 2년)
            </p>
            <label className="inline-flex items-center mt-2">
              <input
                type="checkbox"
                checked={thirdPartyChecked}
                onChange={(e) => setThirdPartyChecked(e.target.checked)}
                className="mr-2"
              />
              <span>위 3) 가명정보 제3자 제공에 동의합니다. (선택)</span>
            </label>
          </div>
        </div>

        {/* 버튼 영역 */}
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onDecline}>
            동의하지 않음
          </Button>
          <Button
            onClick={handleAgree}
            disabled={!canAgree} // 필수 동의 둘 다 체크되어야 활성화
          >
            동의함
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ServiceUnavailableMessageProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ServiceUnavailableMessage({
  isOpen,
  onClose,
}: ServiceUnavailableMessageProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>서비스 이용 제한</DialogTitle>
          <DialogDescription>
            서비스 이용이 불가합니다.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 text-sm text-gray-700">
          <p>
            필수 동의를 완료하지 않으셨습니다.<br />
            서비스를 이용하시려면 필수 항목(개인정보 수집·이용)에 동의하셔야 합니다.
          </p>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
