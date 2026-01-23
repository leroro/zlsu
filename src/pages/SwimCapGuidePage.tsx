import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMembers } from '../lib/api';
import { BANK_ACCOUNT } from '../lib/constants';
import Button from '../components/common/Button';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function SwimCapGuidePage() {
  useDocumentTitle('수모 추가 구입 안내');
  const navigate = useNavigate();

  // 수모 관리자 찾기 (position에 '수모'가 포함된 회원)
  const members = getMembers();
  const swimCapManager = members.find(m =>
    m.position?.includes('수모') && (m.status === 'active' || m.status === 'inactive')
  );

  // 계좌번호 복사
  const [copied, setCopied] = useState(false);
  const handleCopyAccount = () => {
    navigator.clipboard.writeText(BANK_ACCOUNT.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white md:rounded-lg md:shadow p-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">🏊</span>
          <h1 className="text-xl font-bold text-gray-900">수모 추가 구입 안내</h1>
        </div>

        <div className="space-y-6">
          {/* 1단계 */}
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold">
              1
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">구입 의사 전달 및 재고 확인</h3>
              <p className="text-sm text-gray-600">
                {swimCapManager ? (
                  <>
                    <span className="font-medium text-primary-600">{swimCapManager.name}</span> 회원님께 카톡 또는 대면으로 수모 구입 의사를 전달하고, 남은 수모가 있는지 확인해 주세요.
                  </>
                ) : (
                  <>수모 관리 회원님께 카톡 또는 대면으로 수모 구입 의사를 전달하고, 남은 수모가 있는지 확인해 주세요.</>
                )}
              </p>
            </div>
          </div>

          {/* 2단계 */}
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold">
              2
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">모임 계좌로 입금</h3>
              <p className="text-sm text-gray-600 mb-3">
                수모 1장당 2만원입니다. (2장 구입 시 3만원)
              </p>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">{BANK_ACCOUNT.bank}</p>
                <p className="font-mono font-bold text-gray-900">{BANK_ACCOUNT.accountNumber}</p>
                <p className="text-xs text-gray-500">예금주: {BANK_ACCOUNT.accountHolder}</p>
              </div>
              <button
                onClick={handleCopyAccount}
                className="mt-2 w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    복사 완료!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    계좌번호 복사
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 3단계 */}
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold">
              3
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">수모 수령</h3>
              <p className="text-sm text-gray-600">
                {swimCapManager ? (
                  <>
                    <span className="font-medium text-primary-600">{swimCapManager.name}</span> 회원님께 직접 수모를 받으시면 됩니다.
                  </>
                ) : (
                  <>수모 관리 회원님께 직접 수모를 받으시면 됩니다.</>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Button onClick={() => navigate('/')} variant="secondary" className="w-full">
            돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
}
