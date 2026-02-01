import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { createPendingMember, getMemberByEmail, getActiveChecklistItems, getActiveAndInactiveMemberCount, getSettings, getMembers, getMemberById, deleteMember } from '../lib/api';
import { SwimmingAbility, SwimmingLevel, ChecklistItem, BirthDateType, CompetitionInterest } from '../lib/types';
import { SWIMMING_STROKES, SWIMMING_LEVELS, SWIMMING_LEVEL_EMOJIS, COMPETITION_INTEREST_OPTIONS, canRecommendNewMember, ACTIVITY_LEVEL_LABELS, TERMS } from '../lib/constants';
import Button from '../components/common/Button';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useAuth } from '../contexts/AuthContext';

// 스태프 타입
type Step = 1 | 2 | 3 | 4;

// 스태프 인디케이터 컴포넌트
function StepIndicator({ currentStep }: { currentStep: Step }) {
  const steps = [
    { step: 1, label: '추천인' },
    { step: 2, label: '약관동의' },
    { step: 3, label: '기본정보' },
    { step: 4, label: '부가정보' },
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: currentUser, login } = useAuth();

  // 재신청 모드 체크 (URL 파라미터 또는 로그인된 반려 회원 자동 감지)
  const isReapplyParam = searchParams.get('reapply') === 'true';

  // 로그인된 사용자가 반려된 회원인지 확인
  const existingMemberFromAuth = currentUser ? getMemberById(currentUser.id) : null;
  const isRejectedMember = existingMemberFromAuth && (
    existingMemberFromAuth.referrerApproval?.status === 'rejected' ||
    existingMemberFromAuth.adminApproval?.status === 'rejected'
  );

  // 재신청 모드: URL 파라미터가 있거나, 로그인된 반려 회원이 /apply에 접근한 경우
  const isValidReapply = (isReapplyParam || isRejectedMember) && !!existingMemberFromAuth && !!isRejectedMember;
  const existingMember = isValidReapply ? existingMemberFromAuth : null;

  // 페이지 타이틀 (재신청 모드 여부에 따라)
  useDocumentTitle(isValidReapply ? '가입 재신청' : '가입 신청');

  // URL에서 추천인 파라미터 읽기
  const referrerFromUrl = searchParams.get('ref') || '';

  // URL 추천인의 자격 검증
  const urlReferrerMember = referrerFromUrl ? getMembers().find(m => m.name === referrerFromUrl) : null;
  const isUrlReferrerEligible = urlReferrerMember
    ? urlReferrerMember.status === 'active' && canRecommendNewMember(urlReferrerMember.activityLevel)
    : false;
  const hasValidReferrerFromUrl = !!referrerFromUrl && isUrlReferrerEligible;

  // 재신청 시 추천인 정보 (기존 추천인 사용)
  const reapplyReferrer = isValidReapply && existingMember?.referrer ? existingMember.referrer : '';
  const reapplyReferrerMember = reapplyReferrer ? getMembers().find(m => m.name === reapplyReferrer) : null;
  const isReapplyReferrerEligible = reapplyReferrerMember
    ? reapplyReferrerMember.status === 'active' && canRecommendNewMember(reapplyReferrerMember.activityLevel)
    : false;

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
    devStep === '2' ? 2 : devStep === '3' ? 3 : devStep === '4' ? 4 : 1
  );

  // 체크리스트 항목 (동적으로 불러옴)
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);

  // 체크리스트 항목 불러오기
  useEffect(() => {
    const items = getActiveChecklistItems();
    setChecklistItems(items);
    setChecklist(items.reduce((acc, item) => ({ ...acc, [item.id]: false }), {}));
  }, []);

  // 1단계: 체크리스트 상태
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  // 2단계: 기본 정보 (재신청 시 기존 값으로 초기화)
  const [basicInfo, setBasicInfo] = useState({
    name: isValidReapply && existingMember ? existingMember.name : '',
    email: isValidReapply && existingMember ? existingMember.email : '',
    password: '',
    passwordConfirm: '',
    phone: isValidReapply && existingMember ? existingMember.phone : '',
    birthDate: isValidReapply && existingMember?.birthDate ? existingMember.birthDate : '1980-01-01',
    birthDateType: (isValidReapply && existingMember?.birthDateType ? existingMember.birthDateType : 'solar') as BirthDateType,
  });

  // 3단계: 부가 정보 (재신청 시 기존 값으로 초기화)
  const [additionalInfo, setAdditionalInfo] = useState({
    referrer: isValidReapply ? reapplyReferrer : (referrerFromUrl || (isDevMode ? '홍길동' : '')),
    motivation: isValidReapply && existingMember?.motivation ? existingMember.motivation : '',
  });

  const [swimmingAbility, setSwimmingAbility] = useState<SwimmingAbility>(
    isValidReapply && existingMember?.swimmingAbility
      ? existingMember.swimmingAbility
      : { freestyle: false, backstroke: false, breaststroke: false, butterfly: false }
  );

  const [swimmingLevel, setSwimmingLevel] = useState<SwimmingLevel | ''>(
    isValidReapply && existingMember?.swimmingLevel ? existingMember.swimmingLevel : ''
  );
  const [competitionInterest, setCompetitionInterest] = useState<CompetitionInterest | ''>(
    isValidReapply && existingMember?.competitionInterest ? existingMember.competitionInterest : ''
  );

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(devStep === 'complete');
  const [wasReapply, setWasReapply] = useState(false);  // 재신청으로 완료된 경우
  const [isLoading, setIsLoading] = useState(false);

  // 추천인 확인 완료 여부 (URL로 유효한 추천인이 왔거나, 직접 입력 후 확인 완료, 재신청 시 기존 추천인)
  const [referrerVerified, setReferrerVerified] = useState(
    hasValidReferrerFromUrl || (isValidReapply && isReapplyReferrerEligible)
  );
  // 추천인 입력값 (확인 전)
  const [referrerInput, setReferrerInput] = useState(
    isValidReapply ? reapplyReferrer : (referrerFromUrl || '')
  );
  // 회칙 확인 완료 여부
  const [rulesClicked, setRulesClicked] = useState(false);
  // 회칙 모달 관련 상태
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [rulesContent, setRulesContent] = useState('');
  const [rulesLoading, setRulesLoading] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const rulesScrollRef = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);

  // 회칙 내용 불러오기
  const loadRulesContent = useCallback(async () => {
    if (rulesContent) return; // 이미 로드됨
    setRulesLoading(true);
    try {
      const basePath = import.meta.env.BASE_URL;
      const response = await fetch(`${basePath}${TERMS.RULES.slice(1)}`);
      if (response.ok) {
        const text = await response.text();
        setRulesContent(text);
      }
    } catch {
      // 에러 무시
    } finally {
      setRulesLoading(false);
    }
  }, [rulesContent]);

  // 회칙 모달 열기
  const handleOpenRulesModal = () => {
    setShowRulesModal(true);
    setScrolledToBottom(false);
    loadRulesContent();
    // 배경 스크롤 방지
    document.body.style.overflow = 'hidden';
  };

  // 회칙 모달 닫기 (확인 완료)
  const handleCloseRulesModal = () => {
    setShowRulesModal(false);
    setRulesClicked(true);
    // 배경 스크롤 복원
    document.body.style.overflow = '';
    // 중요사항 확인 섹션으로 스크롤
    setTimeout(() => {
      step2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // 스크롤 감지
  const handleRulesScroll = () => {
    if (!rulesScrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = rulesScrollRef.current;
    // 끝에서 50px 이내면 끝까지 스크롤한 것으로 처리
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      setScrolledToBottom(true);
    }
  };

  // 체크리스트 변경
  const handleChecklistChange = (id: string) => {
    // 회칙 확인 전에는 모든 체크리스트 비활성화
    if (!rulesClicked) {
      return;
    }
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
    // 단, 재신청 모드에서 본인 이메일은 허용
    const existingMemberByEmail = getMemberByEmail(basicInfo.email);
    if (existingMemberByEmail) {
      // 재신청 모드에서 본인인 경우 허용
      const isSamePersonReapply = isValidReapply && existingMember && existingMemberByEmail.id === existingMember.id;
      if (!isSamePersonReapply) {
        if (existingMemberByEmail.status === 'pending') {
          setError('이미 가입 신청이 진행 중입니다. 로그인하여 진행 상황을 확인하세요.');
        } else {
          setError('이미 가입된 이메일입니다.');
        }
        return false;
      }
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
    if (!swimmingLevel) {
      setError('수영 레벨을 선택해주세요.');
      return false;
    }
    const selectedStrokeCount = Object.values(swimmingAbility).filter(Boolean).length;
    if (selectedStrokeCount < 2) {
      setError('주종목을 2개 이상 선택해주세요.');
      return false;
    }
    if (!additionalInfo.motivation.trim()) {
      setError('자기소개를 입력해주세요.');
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

  // 추천인 확인 버튼 클릭
  const handleVerifyReferrer = () => {
    setError('');
    const inputName = referrerInput.trim();

    if (!inputName) {
      setError('추천인 이름을 입력해주세요.');
      return;
    }

    // 전체 회원에서 추천인 찾기
    const allMembers = getMembers();
    const referrerMember = allMembers.find(m => m.name === inputName);

    if (!referrerMember) {
      setError('해당 이름의 회원이 없습니다. 이름을 다시 확인해주세요.');
      return;
    }

    if (referrerMember.status !== 'active') {
      setError('현재 활동 중인 회원이 아닙니다.');
      return;
    }

    if (!canRecommendNewMember(referrerMember.activityLevel)) {
      setError('추천 자격이 없는 회원입니다. 다른 분께 문의해 주세요.');
      return;
    }

    // 확인 성공
    setAdditionalInfo(prev => ({ ...prev, referrer: inputName }));
    setReferrerVerified(true);
  };

  // 추천인 변경 (확인 취소)
  const handleChangeReferrer = () => {
    setReferrerVerified(false);
    setReferrerInput('');
    setAdditionalInfo(prev => ({ ...prev, referrer: '' }));
    setError('');
  };

  // 다음 단계
  const handleNext = () => {
    setError('');
    if (currentStep === 1) {
      if (!referrerVerified) {
        setError('추천인 확인을 먼저 해주세요.');
        return;
      }
      goToStep(2);
    } else if (currentStep === 2) {
      if (!isStep1Complete) {
        setError('모든 항목을 확인하고 체크해주세요.');
        return;
      }
      goToStep(3);
    } else if (currentStep === 3) {
      if (!validateStep2()) return;
      goToStep(4);
    }
  };

  // 이전 단계
  const handlePrev = () => {
    setError('');
    if (currentStep === 2) goToStep(1);
    else if (currentStep === 3) goToStep(2);
    else if (currentStep === 4) goToStep(3);
  };

  // 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateStep3()) return;

    setIsLoading(true);

    try {
      // 재신청 여부 저장
      const isReapplying = !!(isValidReapply && existingMember);

      // 재신청 모드인 경우 기존 회원 삭제
      if (isReapplying) {
        deleteMember(existingMember.id);
      }

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

      // 재신청인 경우 새 계정으로 자동 로그인
      if (isReapplying) {
        await login(basicInfo.email, basicInfo.password);
      }

      setWasReapply(isReapplying);
      setSuccess(true);
    } catch {
      setError('신청 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 성공 화면
  if (success) {
    // 재신청 완료 화면
    if (wasReapply) {
      return (
        <div className="max-w-md mx-auto min-h-[60vh] flex items-center">
          <div className="bg-white md:rounded-lg md:shadow p-6 sm:p-8 w-full">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">🔄</div>
              <h1 className="text-xl font-bold text-gray-900">재신청이 완료되었습니다</h1>
              <p className="text-sm text-gray-500 mt-1">
                다시 추천인 동의부터 진행됩니다
              </p>
            </div>

            {/* 안내 메시지 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                수정된 정보로 재신청되었습니다.<br />
                추천인에게 다시 동의를 요청해 주세요.
              </p>
            </div>

            <Link to="/">
              <Button className="w-full">홈으로 이동</Button>
            </Link>
          </div>
        </div>
      );
    }

    // 일반 신청 완료 화면
    return (
      <div className="max-w-md mx-auto min-h-[60vh] flex items-center">
        <div className="bg-white md:rounded-lg md:shadow p-6 sm:p-8 w-full">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🏊</div>
            <h1 className="text-xl font-bold text-gray-900">거의 다 됐어요!</h1>
            <p className="text-sm text-gray-500 mt-1">
              남은 단계를 완료해 주세요
            </p>
          </div>

          {/* 진행 단계 - 세로 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-green-600 font-medium">신청서 제출 완료</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
                  <span className="text-xs font-bold">2</span>
                </div>
                <span className="text-sm font-bold text-primary-600">추천인 동의</span>
                <span className="text-xs text-primary-500">← 지금 여기</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold">3</span>
                </div>
                <span className="text-sm text-gray-400">가입비 납부 확인</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold">4</span>
                </div>
                <span className="text-sm text-gray-400">팀 카톡방 입장 (가입 완료)</span>
              </div>
            </div>
          </div>

          <Link to="/login">
            <Button className="w-full">로그인 후 계속 진행하기</Button>
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          {isValidReapply ? '가입 재신청' : '가입 신청'}
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          {isValidReapply ? '정보를 수정하고 다시 신청하세요' : '즐수팀 회원이 되어주세요'}
        </p>

        <StepIndicator currentStep={currentStep} />

        {/* 1단계: 추천인 확인 */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                추천인 확인
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                즐수팀은 <span className="font-medium text-primary-600">열정 레벨 이상</span> 회원의 추천이 있어야 가입할 수 있습니다.
              </p>

              {/* 추천인 선택 영역 */}
              <div className="mb-6">
                <label htmlFor="referrer0" className="block text-sm font-medium text-gray-700 mb-2">
                  추천인 <span className="text-red-500">*</span>
                </label>

                {/* URL 추천인이 자격 없는 경우 경고 */}
                {referrerFromUrl && !isUrlReferrerEligible && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                    <div className="flex items-start gap-2">
                      <span className="text-red-600">❌</span>
                      <div className="text-sm text-red-800">
                        <p className="font-medium">{referrerFromUrl}님은 추천인 자격이 없습니다</p>
                        <p className="text-xs text-red-700 mt-1">
                          {!urlReferrerMember
                            ? '존재하지 않는 회원입니다.'
                            : urlReferrerMember.status !== 'active'
                            ? '현재 활동 중인 회원이 아닙니다.'
                            : `열정 레벨 이상만 추천할 수 있습니다. (현재: ${urlReferrerMember.activityLevel ? ACTIVITY_LEVEL_LABELS[urlReferrerMember.activityLevel] : '미지정'})`}
                        </p>
                        <p className="text-xs text-red-700 mt-1">아래에서 다른 추천인을 선택해 주세요.</p>
                      </div>
                    </div>
                  </div>
                )}

                {referrerVerified ? (
                  /* 추천인 확인 완료 상태 */
                  <div className="w-full px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 text-lg">✓</span>
                        <span className="font-medium text-green-700">{additionalInfo.referrer}</span>
                        <span className="text-xs text-green-500">확인됨</span>
                      </div>
                      {!hasValidReferrerFromUrl && (
                        <button
                          type="button"
                          onClick={handleChangeReferrer}
                          className="text-xs text-gray-500 hover:text-gray-700 underline"
                        >
                          변경
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* 추천인 입력 + 확인 버튼 */
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="referrer0"
                      value={referrerInput}
                      onChange={(e) => setReferrerInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleVerifyReferrer()}
                      className="flex-1 min-w-0 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="추천인 이름 입력"
                    />
                    <Button
                      type="button"
                      onClick={handleVerifyReferrer}
                      variant="secondary"
                      className="px-4 whitespace-nowrap"
                    >
                      확인
                    </Button>
                  </div>
                )}
              </div>

              {/* 추천인 역할 안내 (확인 완료 시에만 표시) */}
              {referrerVerified && (
                <div className="bg-primary-50 border border-primary-100 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    가입신청서를 제출하면 <span className="font-semibold text-primary-600">{additionalInfo.referrer}</span>님에게 추천인 동의 요청이 발송됩니다.
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>
            )}

            <Button
              type="button"
              onClick={handleNext}
              disabled={!referrerVerified}
              className="w-full"
            >
              다음 단계
            </Button>
          </div>
        )}

        {/* 2단계: 약관동의 */}
        {currentStep === 2 && (
          <div className="space-y-8">
            {/* STEP 1. 회칙 확인 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-600 text-white text-xs font-bold">1</span>
                회칙 확인
                {rulesClicked && (
                  <span className="ml-1 text-green-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                가입 전 회칙 전문을 반드시 확인해 주세요.
              </p>
              <button
                type="button"
                onClick={handleOpenRulesModal}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  rulesClicked
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {rulesClicked ? (
                  <>회칙 다시 보기</>
                ) : (
                  <>
                    회칙 전문 보기
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            {/* STEP 2. 중요사항 확인 */}
            <div ref={step2Ref} className="scroll-mt-20">
              <h2 className={`text-lg font-semibold mb-2 flex items-center gap-2 ${rulesClicked ? 'text-gray-900' : 'text-gray-400'}`}>
                <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${rulesClicked ? 'bg-primary-600 text-white' : 'bg-gray-300 text-white'}`}>2</span>
                중요사항 확인
                {rulesClicked && (
                  <span className="text-sm font-normal text-gray-500">
                    ({Object.values(checklist).filter((v) => v).length}/{checklistItems.length})
                  </span>
                )}
              </h2>

              {!rulesClicked ? (
                <p className="text-sm text-gray-400">
                  회칙을 먼저 확인해 주세요.
                </p>
              ) : (
                <div className="animate-fadeIn">
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
                        <p className="text-sm font-medium text-gray-900">
                          {item.label}
                        </p>
                        <p className="text-xs mt-0.5 text-gray-500">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
              동의하고 다음 단계
            </Button>
          </div>
        )}

        {/* 3단계: 기본 정보 */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보를 입력해 주세요.</h2>

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
                티타임에서 생일을 축하해 드려요 🎂
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
              <Button type="button" variant="secondary" onClick={handlePrev} className="flex-1 min-w-0">
                이전
              </Button>
              <Button type="button" onClick={handleNext} className="flex-1 min-w-0">
                다음
              </Button>
            </div>
          </div>
        )}

        {/* 4단계: 부가 정보 */}
        {currentStep === 4 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">수영 정보를 입력해 주세요.</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                수영 레벨 <span className="text-red-500">*</span>
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
                    <span className="text-sm">{SWIMMING_LEVEL_EMOJIS[level.id]} {level.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                대회 참가 의향 <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">단체전 등 대회 참가에 대한 관심도를 선택해 주세요.</p>
              <div className="space-y-2">
                {COMPETITION_INTEREST_OPTIONS.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      competitionInterest === option.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="competitionInterest"
                      value={option.id}
                      checked={competitionInterest === option.id}
                      onChange={(e) => setCompetitionInterest(e.target.value as CompetitionInterest)}
                      className="mr-2 h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                주종목 <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">
                자신 있는 종목을 2개 이상 선택해 주세요.<br />
                수영 지도나 대회 종목에 참고합니다.
              </p>
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
                자기소개 <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">가입 동기나 소개를 입력해 주세요. 팀원들에게 공유됩니다.</p>
              <textarea
                id="motivation"
                name="motivation"
                value={additionalInfo.motivation}
                onChange={handleAdditionalInfoChange}
                rows={4}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="예) 수영을 좋아해서 함께 운동할 팀원을 찾고 있어요!"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={handlePrev} className="flex-1 min-w-0">
                이전
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1 min-w-0">
                {isLoading ? '신청 중...' : (isValidReapply ? '재신청' : '신청')}
              </Button>
            </div>
          </form>
        )}

      </div>

      {/* 회칙 전문 보기 풀스크린 모달 */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          {/* 모달 헤더 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
            <h2 className="text-lg font-semibold text-gray-900">회칙 전문</h2>
            <button
              type="button"
              onClick={() => {
                setShowRulesModal(false);
                document.body.style.overflow = '';
              }}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 모달 본문 (스크롤 영역) */}
          <div
            ref={rulesScrollRef}
            onScroll={handleRulesScroll}
            className="flex-1 overflow-y-auto px-4 py-6"
          >
            {rulesLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">불러오는 중...</div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto prose prose-sm prose-gray">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {rulesContent}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* 모달 푸터 */}
          <div className="px-4 py-4 border-t border-gray-200 bg-white">
            <div className="max-w-2xl mx-auto">
              {!scrolledToBottom && (
                <p className="text-center text-sm text-gray-500 mb-3">
                  ↓ 끝까지 스크롤해야 확인 버튼이 활성화됩니다
                </p>
              )}
              <button
                type="button"
                onClick={handleCloseRulesModal}
                disabled={!scrolledToBottom}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  scrolledToBottom
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {scrolledToBottom ? '확인했습니다' : '끝까지 읽어주세요'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
