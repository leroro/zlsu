import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getMemberById, referrerApproveMember, referrerRejectMember } from '../lib/api';
import { SWIMMING_LEVELS, SWIMMING_LEVEL_EMOJIS } from '../lib/constants';
import Button from '../components/common/Button';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function ReferrerApprovalPage() {
  useDocumentTitle('추천인 동의 요청');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // 체크박스 상태
  const [agreedToSuitability, setAgreedToSuitability] = useState(false);
  const [agreedToMentoring, setAgreedToMentoring] = useState(false);
  const [agreedToProvideCap, setAgreedToProvideCap] = useState(false);

  // 반려 모달 상태
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedReasonType, setSelectedReasonType] = useState<string>('');
  const [customReason, setCustomReason] = useState('');

  // 동의 확인 모달 상태
  const [showApproveModal, setShowApproveModal] = useState(false);

  // 로딩/에러 상태
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 신청자 정보 조회
  const applicant = id ? getMemberById(id) : null;

  // 유효성 검사
  if (!user) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white md:rounded-lg md:shadow p-6 text-center">
          <p className="text-gray-600">로그인이 필요합니다.</p>
          <Link to="/login" className="mt-4 inline-block">
            <Button>로그인</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white md:rounded-lg md:shadow p-6 text-center">
          <p className="text-gray-600">신청자를 찾을 수 없습니다.</p>
          <Link to="/" className="mt-4 inline-block">
            <Button>홈으로</Button>
          </Link>
        </div>
      </div>
    );
  }

  // 내가 추천인인지 확인
  if (applicant.referrer !== user.name) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white md:rounded-lg md:shadow p-6 text-center">
          <p className="text-gray-600">이 신청에 대한 승인 권한이 없습니다.</p>
          <Link to="/" className="mt-4 inline-block">
            <Button>홈으로</Button>
          </Link>
        </div>
      </div>
    );
  }

  // 이미 처리된 건인지 확인
  if (applicant.referrerApproval?.status !== 'pending') {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white md:rounded-lg md:shadow p-6 text-center">
          <p className="text-gray-600">이미 처리된 신청입니다.</p>
          <Link to="/" className="mt-4 inline-block">
            <Button>홈으로</Button>
          </Link>
        </div>
      </div>
    );
  }

  // 승인 버튼 활성화 조건
  const canApprove = agreedToSuitability && agreedToMentoring && agreedToProvideCap;

  // 동의 버튼 클릭 → 확인 모달 표시
  const handleApproveClick = () => {
    if (!canApprove) return;
    setShowApproveModal(true);
  };

  // 확인 모달에서 최종 동의 처리
  const confirmApprove = async () => {
    setIsLoading(true);
    setError('');

    try {
      const success = referrerApproveMember(id!, agreedToSuitability, agreedToMentoring, agreedToProvideCap);
      if (success) {
        alert(`${applicant.name}님의 가입에 동의했습니다.`);
        navigate('/');
      } else {
        setError('처리 중 오류가 발생했습니다.');
      }
    } catch {
      setError('처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setShowApproveModal(false);
    }
  };

  // 반려 처리
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('반려 사유를 입력해주세요.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const success = referrerRejectMember(id!, rejectReason.trim());
      if (success) {
        alert(`${applicant.name}님의 가입을 반려했습니다.`);
        navigate('/');
      } else {
        setError('반려 처리 중 오류가 발생했습니다.');
      }
    } catch {
      setError('반려 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setShowRejectModal(false);
    }
  };

  // 수영 레벨 라벨
  const swimmingLevelLabel = applicant.swimmingLevel
    ? SWIMMING_LEVELS.find(l => l.id === applicant.swimmingLevel)?.label
    : null;

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white md:rounded-lg md:shadow p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-2 text-center">추천인 동의 요청</h1>
        <p className="text-sm text-gray-500 text-center mb-4">
          <span className="font-bold text-primary-600">{applicant.name}</span>님이 회원 가입을 위해<br />
          <span className="font-bold">{user.name}</span>님을 추천인으로 지정했습니다.
        </p>

        {/* 신청자 정보 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span>👤</span> 신청자 정보
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">이름</span>
              <p className="font-medium text-gray-900">{applicant.name}</p>
            </div>
            <div>
              <span className="text-gray-500">연락처</span>
              <p className="font-medium text-gray-900">{applicant.phone}</p>
            </div>
            {applicant.swimmingLevel && (
              <div>
                <span className="text-gray-500">수영 레벨</span>
                <p className="font-medium text-gray-900">
                  {SWIMMING_LEVEL_EMOJIS[applicant.swimmingLevel]} {swimmingLevelLabel}
                </p>
              </div>
            )}
            {applicant.swimmingAbility && (
              <div>
                <span className="text-gray-500">주종목</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {applicant.swimmingAbility.freestyle && (
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">자유형</span>
                  )}
                  {applicant.swimmingAbility.backstroke && (
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">배영</span>
                  )}
                  {applicant.swimmingAbility.breaststroke && (
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">평영</span>
                  )}
                  {applicant.swimmingAbility.butterfly && (
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">접영</span>
                  )}
                </div>
              </div>
            )}
          </div>
          {applicant.motivation && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <span className="text-gray-500 text-sm">자기소개</span>
              <p className="text-sm text-gray-900 mt-1">{applicant.motivation}</p>
            </div>
          )}
        </div>

        {/* 체크박스 */}
        <div className="space-y-3 mb-6">
          <label
            onClick={() => setAgreedToSuitability(!agreedToSuitability)}
            className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
              agreedToSuitability
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`mt-0.5 h-5 w-5 rounded border flex items-center justify-center flex-shrink-0 ${
              agreedToSuitability
                ? 'bg-primary-600 border-primary-600'
                : 'border-gray-300 bg-white'
            }`}>
              {agreedToSuitability && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                이 분이 동호회에 적합하다고 생각하여 추천합니다.
              </p>
            </div>
          </label>

          <label
            onClick={() => setAgreedToMentoring(!agreedToMentoring)}
            className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
              agreedToMentoring
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`mt-0.5 h-5 w-5 rounded border flex items-center justify-center flex-shrink-0 ${
              agreedToMentoring
                ? 'bg-primary-600 border-primary-600'
                : 'border-gray-300 bg-white'
            }`}>
              {agreedToMentoring && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                승인 후 동호회 규칙과 이용 방법을 안내하고, 모임에 잘 융화될 수 있도록 도와주겠습니다.
              </p>
            </div>
          </label>

          <label
            onClick={() => setAgreedToProvideCap(!agreedToProvideCap)}
            className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
              agreedToProvideCap
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`mt-0.5 h-5 w-5 rounded border flex items-center justify-center flex-shrink-0 ${
              agreedToProvideCap
                ? 'bg-primary-600 border-primary-600'
                : 'border-gray-300 bg-white'
            }`}>
              {agreedToProvideCap && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                수모 담당자(최선숙 회원)에게 수모를 수령하여 신규 회원에게 전달하겠습니다.
              </p>
            </div>
          </label>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm mb-4">{error}</div>
        )}

        {/* 버튼 */}
        <div className="flex gap-3">
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => setShowRejectModal(true)}
            disabled={isLoading}
          >
            반려
          </Button>
          <Button
            className="flex-1"
            onClick={handleApproveClick}
            disabled={!canApprove || isLoading}
          >
            {isLoading ? '처리 중...' : '동의'}
          </Button>
        </div>

        {!canApprove && (
          <p className="text-xs text-gray-500 text-center mt-2">
            위 항목을 모두 체크해야 동의할 수 있습니다
          </p>
        )}
      </div>

      {/* 반려 모달 */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {applicant.name}님의 가입을 반려하시겠습니까?
            </h3>

            {/* 재신청 가능 안내 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                <span className="font-medium">💡 안심하세요!</span> 반려해도 신청자가 정보를 수정하여 다시 신청할 수 있습니다.
              </p>
            </div>

            <p className="text-sm text-gray-600 mb-3">
              반려 사유를 선택해주세요.
            </p>

            {/* 반려 사유 라디오 버튼 */}
            <div className="space-y-2 mb-4">
              {[
                { id: 'not-met', label: '직접 만나본 적이 없습니다.', needsDetail: false },
                { id: 'not-informed', label: '사전에 가입 의사를 전달받지 못했습니다.', needsDetail: false },
                { id: 'wrong-info', label: '신청자 정보가 잘못 입력되었습니다.', needsDetail: true },
                { id: 'other', label: '기타 (직접 입력)', needsDetail: true },
              ].map((option) => (
                <label
                  key={option.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedReasonType === option.id
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="rejectReason"
                    value={option.id}
                    checked={selectedReasonType === option.id}
                    onChange={() => {
                      setSelectedReasonType(option.id);
                      setCustomReason('');
                      if (option.id === 'other') {
                        setRejectReason('');
                      } else if (option.id === 'wrong-info') {
                        setRejectReason(option.label);
                      } else {
                        setRejectReason(option.label);
                      }
                    }}
                    className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                  />
                  <span className={`text-sm ${selectedReasonType === option.id ? 'text-red-700 font-medium' : 'text-gray-700'}`}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>

            {/* wrong-info 또는 other 선택 시 직접 입력 */}
            {(selectedReasonType === 'wrong-info' || selectedReasonType === 'other') && (
              <div className="mb-4">
                <textarea
                  value={customReason}
                  onChange={(e) => {
                    setCustomReason(e.target.value);
                    if (selectedReasonType === 'wrong-info') {
                      // 기본 사유 + 상세 내용
                      setRejectReason(e.target.value ? `신청자 정보가 잘못 입력되었습니다. (${e.target.value})` : '신청자 정보가 잘못 입력되었습니다.');
                    } else {
                      setRejectReason(e.target.value);
                    }
                  }}
                  placeholder={selectedReasonType === 'wrong-info' ? '어떤 정보가 잘못되었는지 입력해주세요' : '반려 사유를 직접 입력해주세요'}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  autoFocus
                />
                {selectedReasonType === 'wrong-info' && (
                  <p className="text-xs text-gray-500 mt-1">예: 이름 오타, 연락처 오류, 수영 레벨 등</p>
                )}
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedReasonType('');
                  setCustomReason('');
                }}
                disabled={isLoading}
              >
                취소
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                disabled={isLoading || !rejectReason.trim()}
              >
                {isLoading ? '처리 중...' : '반려'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 동의 확인 모달 */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {applicant.name}님의 가입에 동의하시겠습니까?
            </h3>

            {/* 가입 절차 안내 */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-amber-800">
                <span className="font-medium">📋 가입 절차 안내</span><br />
                <span className="text-xs">
                  추천인 동의 후, 신청자가 <span className="font-medium">가입비를 납부</span>하면<br />
                  관리자가 납부 확인 후 최종 승인합니다.
                </span>
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="secondary"
                onClick={() => setShowApproveModal(false)}
                disabled={isLoading}
              >
                취소
              </Button>
              <Button
                onClick={confirmApprove}
                disabled={isLoading}
              >
                {isLoading ? '처리 중...' : '동의'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
