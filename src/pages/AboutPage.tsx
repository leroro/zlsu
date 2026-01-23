import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getActiveAndInactiveMemberCount, getSettings } from '../lib/api';
import Button from '../components/common/Button';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function AboutPage() {
  useDocumentTitle('모임 소개');
  const stats = getActiveAndInactiveMemberCount();
  const settings = getSettings();
  const remainingSlots = settings.maxCapacity - stats.capacityCount;

  // 링크 복사 상태
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/about`;
    await navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // CTA 플로팅 상태
  const [isFloating, setIsFloating] = useState(true);
  const ctaSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!ctaSectionRef.current) return;
      const rect = ctaSectionRef.current.getBoundingClientRect();
      // CTA 섹션이 화면에 보이기 시작하면 플로팅 해제
      const isAtBottom = rect.top < window.innerHeight;
      setIsFloating(!isAtBottom);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 초기 상태 체크
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 text-white md:rounded-lg p-6 sm:p-8 mb-4">
        <div className="text-center">
          <img
            src="./images/logo-simple.svg"
            alt="즐수팀 로고"
            className="w-24 h-24 mx-auto mb-4 rounded-lg"
          />
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-white">
            수영을 즐겁게!
          </h1>
          <p className="text-primary-200 text-sm">
            매주 토요일 아침, 함께 즐겁게 수영하는 사람들
          </p>
        </div>
      </section>

      {/* 활동 소개 */}
      <section className="bg-white md:rounded-lg md:shadow p-6 mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">활동 소개</h2>

        <div className="space-y-4">
          <div className="flex gap-3">
            <span className="text-2xl">📅</span>
            <div>
              <h3 className="font-semibold text-gray-900">언제?</h3>
              <p className="text-gray-600">매주 토요일 아침 8:00 ~ 8:50 (50분)</p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-2xl">📍</span>
            <div>
              <h3 className="font-semibold text-gray-900">어디서?</h3>
              <p className="text-gray-600">트윈스포츠센터 (끝에서 3번째 레인)</p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-2xl">🏊</span>
            <div>
              <h3 className="font-semibold text-gray-900">뭘 하나요?</h3>
              <p className="text-gray-600">
                수영 만렙 선우 코치님 지도하에 각자 수준에 맞게 즐겁게 수영해요.
                <br />
                다양한 연령대, 다양한 실력의 회원들이 편하게 배우고 즐기는 친목 모임이에요.
                <br />
                수영 후에는 메가커피에서 티타임도 해요. (자율 참석)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 이벤트 및 대외 활동 */}
      <section className="bg-white md:rounded-lg md:shadow p-6 mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">이벤트 및 대외 활동</h2>

        <div className="space-y-4">
          <div className="flex gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <h3 className="font-semibold text-gray-900">오프라인 친목 행사</h3>
              <p className="text-gray-600">연말 송년회 등 회원들과 함께하는 친목 행사를 진행해요.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-2xl">🎂</span>
            <div>
              <h3 className="font-semibold text-gray-900">생일 축하</h3>
              <p className="text-gray-600">생일에 가까운 토요일 티타임에서 케이크와 함께 축하해요.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <h3 className="font-semibold text-gray-900">수영 대회 단체 출전</h3>
              <p className="text-gray-600">연중 수영 대회 개최 시 희망자에 한해 단체로 개인전에 출전해요.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-2xl">🤝</span>
            <div>
              <h3 className="font-semibold text-gray-900">단체전 대회 참여</h3>
              <p className="text-gray-600">단체전 형태의 추발, 계영 대회 등에 함께 참여한 경험이 있어요.</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-4 bg-gray-50 rounded-lg p-3">
          💡 모든 대회 및 행사는 <strong>자율 참여</strong>예요. 부담 없이 원하는 활동에만 참여하세요!
        </p>
      </section>

      {/* 이런 분께 추천 */}
      <section className="bg-white md:rounded-lg md:shadow p-6 mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">이런 분께 추천해요</h2>

        <ul className="space-y-3">
          {[
            '영법을 더 정확하게 배우고 싶은 분',
            '수영 대회에 도전해보고 싶은 분',
            '주말 아침을 건강하게 시작하고 싶은 분',
            '수영 친구를 만들고 싶은 분',
          ].map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span className="text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 수모 안내 */}
      <section className="bg-white md:rounded-lg md:shadow p-6 mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">즐수팀 수모</h2>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          {/* 수모 이미지 */}
          <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-4">
            <img
              src="./images/swim-cap.jpg"
              alt="즐수팀 수모"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-sm text-gray-600 space-y-2">
            <p>• <strong>소재:</strong> 메시 소재 (통기성 좋음)</p>
            <p>• <strong>가격:</strong> 1장 2만원 / 2장 3만원</p>
            <p>• <strong>구매:</strong> 가입 시 필수 구매</p>
          </div>
        </div>

        <p className="text-sm text-gray-500">
          즐수팀 회원임을 나타내는 수모예요. 수영장에서 서로를 쉽게 알아볼 수 있어요!
        </p>
      </section>

      {/* 가입 안내 */}
      <section className="bg-white md:rounded-lg md:shadow p-6 mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">가입 안내</h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">월 회비</p>
            <p className="text-2xl font-bold text-blue-600">2만원</p>
            <p className="text-xs text-gray-500">매월 1일 납부</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">현재 인원</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.capacityCount}/{settings.maxCapacity}명
            </p>
            <p className="text-xs text-gray-500">
              {remainingSlots > 0 ? `${remainingSlots}자리 남음` : '정원 마감'}
            </p>
          </div>
        </div>

        {/* 초대 링크 복사 버튼 */}
        <button
          onClick={handleCopyLink}
          className="w-full mb-6 py-3 px-4 bg-primary-50 hover:bg-primary-100 border border-primary-200 text-primary-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          {linkCopied ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              링크가 복사되었습니다!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              초대 링크 복사하기
            </>
          )}
        </button>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-2">첫 가입 시 납부 금액</h3>
          <p className="text-gray-600 text-sm">
            첫 달 회비 2만원 + 수모 2만원 = <span className="font-bold text-primary-600">총 4만원</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            * 수모 2장 구매 시 총 5만원 (회비 2만 + 수모 3만)
          </p>
        </div>

        <div className="text-sm text-gray-600">
          <p className="flex items-center gap-2 mb-1">
            <span>💡</span>
            <span>기존 회원의 추천이 필요해요</span>
          </p>
          <p className="flex items-center gap-2">
            <span>💡</span>
            <span>첫 1회는 무료 체험 가능해요</span>
          </p>
        </div>
      </section>

      {/* 가입 절차 */}
      <section className="bg-white md:rounded-lg md:shadow p-6 mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">가입 절차</h2>

        <div className="space-y-4">
          {[
            { step: 1, title: '가입 신청서 작성하기', desc: '추천인(기존 회원)에게 링크 받아서 신청' },
            { step: 2, title: '가입비 입금하기', desc: '회비 + 수모 금액 입금' },
            { step: 3, title: '카톡방 & 모임통장 입장하기', desc: '로그인 후 카톡방 입장하기 버튼 클릭' },
            { step: 4, title: '첫 수영 참석 신청하기', desc: '카톡방 일정(달력)에서 참석할 토요일에 출석체크' },
            { step: 5, title: '수모 수령하기', desc: '추천인에게 수령' },
            { step: 6, title: '토요일에 만나요!', desc: '수영장에서 함께해요 🏊' },
          ].map((item, index, arr) => (
            <div key={item.step} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold">
                  {item.step}
                </div>
                {index < arr.length - 1 && (
                  <div className="w-0.5 h-full bg-primary-200 my-1" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 자주 묻는 질문 */}
      <section className="bg-white md:rounded-lg md:shadow p-6 mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">자주 묻는 질문</h2>

        <div className="space-y-4">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="font-semibold text-gray-900 mb-1">
              Q. 수영 초보도 가입할 수 있나요?
            </h3>
            <p className="text-gray-600 text-sm">
              초급반부터 마스터반까지 다양한 레벨의 회원이 있어요.
              코치님이 수준에 맞게 지도해주세요.
            </p>
          </div>

          <div className="border-b border-gray-100 pb-4">
            <h3 className="font-semibold text-gray-900 mb-1">
              Q. 지각하면 어떻게 되나요?
            </h3>
            <p className="text-gray-600 text-sm">
              1분당 500원 벌금이 있어요 (최대 1만원).
              8시 정각 입수 기준이에요!
            </p>
          </div>

          <div className="border-b border-gray-100 pb-4">
            <h3 className="font-semibold text-gray-900 mb-1">
              Q. 무단 불참하면 어떻게 되나요?
            </h3>
            <p className="text-gray-600 text-sm">
              사전에 불참 표시 없이 결석하면 1만원 벌금이 있어요.
            </p>
          </div>

          <div className="border-b border-gray-100 pb-4">
            <h3 className="font-semibold text-gray-900 mb-1">
              Q. 못 가는 날은 어떻게 하나요?
            </h3>
            <p className="text-gray-600 text-sm">
              금요일 자정까지 카톡방의 <strong>달력(캘린더)</strong>에서 불참 표시하면 돼요.
              채팅으로만 말씀하시면 인원 파악이 어려워요!
            </p>
          </div>

          <div className="border-b border-gray-100 pb-4">
            <h3 className="font-semibold text-gray-900 mb-1">
              Q. 회비는 어디에 쓰이나요?
            </h3>
            <p className="text-gray-600 text-sm">
              대부분 수영 후 티타임 커피값으로 사용해요.
              그 외 송년회 등 이벤트, 수모 제작 등 모임 운영에 활용돼요.
            </p>
          </div>

          <div className="border-b border-gray-100 pb-4">
            <h3 className="font-semibold text-gray-900 mb-1">
              Q. 티타임 불참시 회비를 안 내도 되나요?
            </h3>
            <p className="text-gray-600 text-sm">
              아니에요, 회비는 참여 여부와 관계없이 납부해요.
              그러니까 티타임에 자주 와주세요! ☕
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Q. 수모는 꼭 사야 하나요?
            </h3>
            <p className="text-gray-600 text-sm">
              네, 가입 시 필수 구매예요.
              즐수팀 회원임을 나타내고 수영장에서 서로 알아볼 수 있어요!
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section ref={ctaSectionRef} className="bg-white md:rounded-lg md:shadow p-6 pb-20 md:pb-6">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            함께 즐겁게 수영해요!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {remainingSlots > 0 ? (
              <Link to="/apply">
                <Button size="lg" className="w-full sm:w-auto">가입 신청하기</Button>
              </Link>
            ) : (
              <Button size="lg" disabled className="w-full sm:w-auto">
                정원 마감
              </Button>
            )}
            <Link to="/rules">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                회칙 자세히 보기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 플로팅 CTA 버튼 (모바일) */}
      {isFloating && remainingSlots > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg md:hidden z-50">
          <Link to="/apply" className="block">
            <Button size="lg" className="w-full">가입 신청하기</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
