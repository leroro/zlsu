import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { createPendingMember, getMemberByEmail, getActiveChecklistItems, getActiveAndInactiveMemberCount, getSettings, getMembers } from '../lib/api';
import { SwimmingAbility, SwimmingLevel, ChecklistItem, Member, BirthDateType } from '../lib/types';
import { SWIMMING_STROKES, SWIMMING_LEVELS, BANK_ACCOUNT } from '../lib/constants';
import Button from '../components/common/Button';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

// 스텝 타입
type Step = 1 | 2 | 3;

// 스텝 인디케이터 컴포넌트
function StepIndicator({ currentStep }: { currentStep: Step }) {
  const steps = [
    { step: 1, label: '가입동의' },
    { step: 2, label: '기본정보' },
    { step: 3, label: '부가정보' },
  ];

  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((s, index) => (
        <div key={s.step} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                currentStep === s.step
                  ? 'bg-primary-600 text-white'
                  : currentStep > s.step
                  ? 'bg-primary-100 text-primary-600'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {currentStep > s.step ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                s.step
              )}
            </div>
            <span
              className={`mt-2 text-xs font-medium ${
                currentStep === s.step ? 'text-primary-600' : 'text-gray-400'
              }`}
            >
              {s.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-6 sm:w-10 h-0.5 mx-1 mb-6 ${
                currentStep > s.step ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function ApplyPage() {
  useDocumentTitle('가입 신청');
  const [searchParams, setSearchParams] = useSearchParams();

  // 개발용: URL 파라미터로 단계 지정 (?step=1,2,3,4,complete,full)
  // 프로덕션 빌드에서는 step 파라미터 무시 (보안)
  const isDev = import.meta.env.DEV;
  const devStep = isDev ? searchParams.get('step') : null;
  const isDevMode = devStep !== null;

  // 정원 체크
  const stats = getActiveAndInactiveMemberCount();
  const settings = getSettings();
  const isFull = devStep === 'full' ? true : stats.capacityCount >= settings.maxCapacity;

  const [currentStep, setCurrentStep] = useState<Step>(
    devStep === '2' ? 2 : devStep === '3' ? 3 : 1
  );

  // 체크리스트 항목 (동적으로 불러옴)
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);

  // 추천인 선택용 회원 목록 (활성/휴면 회원만)
  const [memberList, setMemberList] = useState<Member[]>([]);

  // 체크리스트, 회원목록 불러오기
  useEffect(() => {
    // 체크리스트 항목 불러오기
    const items = getActiveChecklistItems();
    setChecklistItems(items);
    setChecklist(items.reduce((acc, item) => ({ ...acc, [item.id]: false }), {}));

    // 추천인 선택용 회원 목록 불러오기 (활성/휴면 회원만)
    const members = getMembers().filter(m => m.status === 'active' || m.status === 'inactive');
    setMemberList(members.sort((a, b) => a.name.localeCompare(b.name)));
  }, []);

  // 1단계: 체크리스트 상태
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  // 2단계: 기본 정보
  const [basicInfo, setBasicInfo] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phone: '',
    birthDate: '',
    birthDateType: 'solar' as BirthDateType,
  });

  // 3단계: 부가 정보
  const [additionalInfo, setAdditionalInfo] = useState({
    referrer: isDevMode ? '홍길동' : '',
    motivation: '',
  });

  const [swimmingAbility, setSwimmingAbility] = useState<SwimmingAbility>({
    freestyle: false,
    backstroke: false,
    breaststroke: false,
    butterfly: false,
  });

  const [swimmingLevel, setSwimmingLevel] = useState<SwimmingLevel | ''>('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(devStep === 'complete');
  const [isLoading, setIsLoading] = useState(false);

  // 체크리스트 변경
  const handleChecklistChange = (id: string) => {
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
    setError('');
  };

  // 1단계 완료 여부
  const isStep1Complete = Object.values(checklist).every((v) => v);

  // 2단계 입력 핸들러
  const handleBasicInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBasicInfo((prev) => ({ ...prev, [name]: value }));
  };

  // 2단계 유효성 검사
  const validateStep2 = (): boolean => {
    if (!basicInfo.name.trim()) {
      setError('이름을 입력해주세요.');
      return false;
    }
    if (!basicInfo.email.trim()) {
      setError('이메일을 입력해주세요.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(basicInfo.email)) {
      setError('올바른 이메일 형식이 아닙니다.');
      return false;
    }
    if (!basicInfo.password) {
      setError('비밀번호를 입력해주세요.');
      return false;
    }
    if (basicInfo.password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return false;
    }
    if (basicInfo.password !== basicInfo.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return false;
    }
    if (!basicInfo.phone.trim()) {
      setError('휴대폰 번호를 입력해주세요.');
      return false;
    }
    if (!/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(basicInfo.phone.replace(/\s/g, ''))) {
      setError('올바른 휴대폰 번호 형식이 아닙니다. (예: 010-1234-5678)');
      return false;
    }
    if (!basicInfo.birthDate) {
      setError('생년월일을 입력해주세요.');
      return false;
    }

    // 이메일 중복 체크 (기존 회원 및 승인대기 회원 포함)
    const existingMember = getMemberByEmail(basicInfo.email);
    if (existingMember) {
      if (existingMember.status === 'pending') {
        setError('이미 가입 신청이 진행 중입니다. 로그인하여 진행 상황을 확인하세요.');
      } else {
        setError('이미 가입된 이메일입니다.');
      }
      return false;
    }

    return true;
  };

  // 3단계 입력 핸들러
  const handleAdditionalInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setAdditionalInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwimmingChange = (stroke: keyof SwimmingAbility) => {
    setSwimmingAbility((prev) => ({ ...prev, [stroke]: !prev[stroke] }));
  };

  // 3단계 유효성 검사
  const validateStep3 = (): boolean => {
    if (!additionalInfo.referrer) {
      setError('추천인을 선택해주세요.');
      return false;
    }
    if (!swimmingLevel) {
      setError('평소 다니는 반을 선택해주세요.');
      return false;
    }
    const hasAnyStroke = Object.values(swimmingAbility).some((v) => v);
    if (!hasAnyStroke) {
      setError('할 수 있는 영법을 1개 이상 선택해주세요.');
      return false;
    }
    if (!additionalInfo.motivation.trim()) {
      setError('가입 동기를 입력해주세요.');
      return false;
    }
    return true;
  };

  // 단계 변경 (URL 파라미터도 업데이트)
  const goToStep = (step: Step) => {
    setCurrentStep(step);
    setSearchParams({ step: String(step) }, { replace: true });
    window.scrollTo(0, 0);
  };

  // 다음 단계
  const handleNext = () => {
    setError('');
    if (currentStep === 1) {
      if (!isStep1Complete) {
        setError('모든 항목을 확인하고 체크해주세요.');
        return;
      }
      goToStep(2);
    } else if (currentStep === 2) {
      if (!validateStep2()) return;
      goToStep(3);
    }
  };

  // 이전 단계
  const handlePrev = () => {
    setError('');
    if (currentStep === 2) goToStep(1);
    else if (currentStep === 3) goToStep(2);
  };

  // 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateStep3()) return;

    setIsLoading(true);

    try {
      // 바로 pending 상태의 Member로 등록
      createPendingMember({
        name: basicInfo.name,
        email: basicInfo.email,
        password: basicInfo.password,
        phone: basicInfo.phone,
        birthDate: basicInfo.birthDate,
        birthDateType: basicInfo.birthDateType,
        referrer: additionalInfo.referrer,
        swimmingAbility,
        swimmingLevel: swimmingLevel || undefined,
        motivation: additionalInfo.motivation,
      });

      setSuccess(true);
    } catch {
      setError('신청 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 계좌번호 복사
  const [copied, setCopied] = useState(false);
  const handleCopyAccount = () => {
    navigator.clipboard.writeText(BANK_ACCOUNT.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 성공 화면
  if (success) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white md:rounded-lg md:shadow p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🎉</div>
            <h1 className="text-2xl font-bold text-gray-900">가입 신청이 완료되었어요!</h1>
          </div>

          {/* 가입비 납부 안내 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <span>💰</span> 가입비를 납부해주세요
            </h2>
            <div className="text-sm text-blue-800 space-y-2">
              <p>첫 달 회비 2만원 + 수모 2만원 = <span className="font-bold">총 4만원</span></p>
              <div className="bg-white rounded-lg p-3 mt-3">
                <p className="text-gray-600 text-xs mb-1">{BANK_ACCOUNT.bank}</p>
                <p className="font-mono font-bold text-lg text-gray-900">{BANK_ACCOUNT.accountNumber}</p>
                <p className="text-gray-600 text-xs">예금주: {BANK_ACCOUNT.accountHolder}</p>
              </div>
              <button
                onClick={handleCopyAccount}
                className="w-full mt-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
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

          {/* 진행 순서 안내 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>📋</span> 입금 후 진행 순서
            </h2>
            <ol className="text-sm text-gray-600 space-y-2">
              <li className="flex gap-2">
                <span className="font-medium text-primary-600">1.</span>
                <span>총무가 입금 확인 후 승인</span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-primary-600">2.</span>
                <span>카카오톡 단톡방 + 모임통장 초대</span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-primary-600">3.</span>
                <span>추천인에게 수모 수령</span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-primary-600">4.</span>
                <span>토요일 수영장에서 만나요! 🏊</span>
              </li>
            </ol>
          </div>

          {/* 문의 안내 - 추천인 강조 */}
          <div className="text-sm text-gray-600 mb-6 p-3 bg-gray-50 rounded-lg">
            {additionalInfo.referrer && additionalInfo.referrer !== '없음' ? (
              <p>
                문의사항은 <span className="font-bold text-primary-600">{additionalInfo.referrer}</span>님(추천인)에게 연락해주세요.
              </p>
            ) : (
              <p>문의사항은 총무에게 연락해주세요.</p>
            )}
          </div>

          {/* 로그인 안내 */}
          <div className="text-xs text-gray-500 text-center mb-4">
            ※ 이제 로그인하여 승인 상태를 확인할 수 있어요.
          </div>

          <Link to="/login">
            <Button className="w-full">로그인하기</Button>
          </Link>
        </div>
      </div>
    );
  }

  // 정원이 꽉 찬 경우
  if (isFull) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white md:rounded-lg md:shadow p-6 sm:p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">정원이 꽉 찼습니다</h1>
          <p className="text-gray-600 mb-6">
            현재 즐수팀 정원이 가득 차서 신규 가입을 받지 않고 있습니다.<br />
            <span className="text-sm text-gray-500">
              현재 인원: {stats.capacityCount}/{settings.maxCapacity}명
            </span>
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/" className="block">
              <Button variant="primary" className="w-full">홈으로 돌아가기</Button>
            </Link>
            <Link to="/rules" className="block">
              <Button variant="secondary" className="w-full">회칙 확인하기</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white md:rounded-lg md:shadow p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">가입 신청</h1>
        <p className="text-sm text-gray-500 text-center mb-6">즐수팀 회원이 되어주세요</p>

        <StepIndicator currentStep={currentStep} />

        {/* 1단계: 가입동의 */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* 체크리스트 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                가입 전 확인사항
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({Object.values(checklist).filter((v) => v).length}/{checklistItems.length})
                </span>
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                아래 항목을 확인하고 동의해 주세요.
              </p>
              <div className="space-y-3">
                {checklistItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleChecklistChange(item.id)}
                    className={`flex items-start gap-3 p-3 border rounded-lg transition-colors ${
                      checklist[item.id]
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                    }`}
                  >
                    <div className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center flex-shrink-0 ${
                      checklist[item.id]
                        ? 'bg-primary-600 border-primary-600'
                        : 'border-gray-300 bg-white'
                    }`}>
                      {checklist[item.id] && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>
            )}

            <Button
              type="button"
              onClick={handleNext}
              disabled={!isStep1Complete}
              className="w-full"
            >
              다음 단계
            </Button>
          </div>
        )}

        {/* 2단계: 기본 정보 */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보 입력</h2>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                autoComplete="name"
                value={basicInfo.name}
                onChange={handleBasicInfoChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="실명을 입력해주세요"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                이메일 (아이디) <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                value={basicInfo.email}
                onChange={handleBasicInfoChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                autoComplete="new-password"
                value={basicInfo.password}
                onChange={handleBasicInfoChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="6자 이상"
              />
            </div>

            <div>
              <label
                htmlFor="passwordConfirm"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                비밀번호 확인 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="passwordConfirm"
                name="passwordConfirm"
                autoComplete="new-password"
                value={basicInfo.passwordConfirm}
                onChange={handleBasicInfoChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="비밀번호를 다시 입력해주세요"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                휴대폰 번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                autoComplete="tel"
                value={basicInfo.phone}
                onChange={handleBasicInfoChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="010-1234-5678"
              />
            </div>

            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                생년월일 <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-500 mb-2">
                회원분들의 생일을 축하해 드리기 위해 수집해요 🎂
              </p>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                autoComplete="bday"
                value={basicInfo.birthDate}
                onChange={handleBasicInfoChange}
                placeholder="YYYY-MM-DD"
                className="w-full max-w-full box-border px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-left"
              />
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="birthDateType"
                    value="solar"
                    checked={basicInfo.birthDateType === 'solar'}
                    onChange={handleBasicInfoChange}
                    className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">양력</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="birthDateType"
                    value="lunar"
                    checked={basicInfo.birthDateType === 'lunar'}
                    onChange={handleBasicInfoChange}
                    className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">음력</span>
                </label>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={handlePrev} className="flex-1">
                이전
              </Button>
              <Button type="button" onClick={handleNext} className="flex-1">
                다음 단계
              </Button>
            </div>
          </div>
        )}

        {/* 3단계: 부가 정보 */}
        {currentStep === 3 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">부가 정보 입력</h2>

            <div>
              <label htmlFor="referrer" className="block text-sm font-medium text-gray-700 mb-1">
                추천인 <span className="text-red-500">*</span>
              </label>
              <select
                id="referrer"
                name="referrer"
                value={additionalInfo.referrer}
                onChange={handleAdditionalInfoChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">추천인을 선택해주세요</option>
                <option value="없음">없음</option>
                {memberList.map((member) => (
                  <option key={member.id} value={member.name}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                평소 다니는 반 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SWIMMING_LEVELS.map((level) => (
                  <label
                    key={level.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      swimmingLevel === level.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="swimmingLevel"
                      value={level.id}
                      checked={swimmingLevel === level.id}
                      onChange={(e) => setSwimmingLevel(e.target.value as SwimmingLevel)}
                      className="mr-2 h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">{level.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                할 수 있는 영법 <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-2">(복수 선택 가능)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SWIMMING_STROKES.map((stroke) => (
                  <label
                    key={stroke.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      swimmingAbility[stroke.id as keyof SwimmingAbility]
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={swimmingAbility[stroke.id as keyof SwimmingAbility]}
                      onChange={() => handleSwimmingChange(stroke.id as keyof SwimmingAbility)}
                      className="mr-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">{stroke.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="motivation" className="block text-sm font-medium text-gray-700 mb-1">
                가입 동기 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="motivation"
                name="motivation"
                value={additionalInfo.motivation}
                onChange={handleAdditionalInfoChange}
                rows={4}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="가입 이유를 적어주세요. 팀원들에게 공개됩니다."
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={handlePrev} className="flex-1">
                이전
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? '신청 중...' : '가입 신청'}
              </Button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          이미 회원이신가요?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
