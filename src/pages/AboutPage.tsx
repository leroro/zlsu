import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getActiveAndInactiveMemberCount, getSettings } from '../lib/api';
import { asset } from '../lib/assets';
import Button from '../components/common/Button';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function AboutPage() {
  useDocumentTitle('모임 소개');
  const stats = getActiveAndInactiveMemberCount();
  const settings = getSettings();
  const remainingSlots = settings.maxCapacity - stats.capacityCount;

  // URL에서 추천인 파라미터 읽기
  const [searchParams] = useSearchParams();
  const referrer = searchParams.get('ref') || '';
  const applyUrl = referrer ? `/apply?ref=${encodeURIComponent(referrer)}` : '/apply';

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
            src={asset('images/logo-simple.svg')}
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
                수영 만렙 선우 코치님과 함께 각자 수준에 맞게 즐겁게 수영해요.
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
              <h3 className="font-semibold text-gray-900">수영 대회 참여</h3>
              <p className="text-gray-600">희망자에 한해 개인전, 단체전(계영, 추발 등) 대회에 함께 출전해요.</p>
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

        <div className="space-y-3 text-gray-700 mb-4">
          <p>
            <strong>'수영을 즐겁게'</strong>는 수영을 통해 배움과 성장을 함께하는 사람들 모임이에요.
            기록이나 성과보다는, 다양한 연령대의 회원들이 함께 화합하며 즐겁게 교류하는 <strong>친목 모임</strong>이에요.
          </p>
        </div>

        <ul className="space-y-3">
          {[
            '수영도 하고, 회원들과 친목도 즐기고 싶은 분',
            '영법을 더 정확하게 배우고 싶은 분',
            '주말 아침을 건강하게 시작하고 싶은 분',
            '수영 대회에 도전해보고 싶은 분',
          ].map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span className="text-gray-700">{item}</span>
            </li>
          ))}
        </ul>

      </section>

      {/* 가입 절차 */}
      <section className="bg-white md:rounded-lg md:shadow p-6 mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">가입 절차</h2>

        <div className="space-y-0">
          {/* Step 1: 게스트로 활동하기 */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center text-sm font-bold">1</div>
              <div className="w-0.5 flex-1 bg-gray-200 my-1" />
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-gray-900">게스트로 활동하기</h3>
                <span className="text-xs text-gray-500">가입 전 체험</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1 mb-2">
                <li>• 당일 빈 자리가 있을 때 참여 가능</li>
                <li>• 4개 영법을 모두 배운 사람</li>
                <li>• 자유형 50m 페이스 유지하며 완주 가능</li>
              </ul>
              <p className="text-xs text-gray-500">💡 친해지면 추천 기회가 생길 수 있어요</p>
            </div>
          </div>

          {/* Step 2: 추천 받고 정식 가입 */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold">2</div>
              <div className="w-0.5 flex-1 bg-primary-200 my-1" />
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-gray-900">추천 받고 정식 가입</h3>
                <span className="text-xs text-gray-500">회원 전환</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>☑ 정원(14명)에 공석이 있어야 함</li>
                <li>☑ 기존 열정 레벨 회원의 추천 필요</li>
                <li>☑ 티타임 등 친목 활동에 참여 의향</li>
              </ul>
            </div>
          </div>

          {/* Step 3-5: 나머지 절차 */}
          {[
            { step: 3, title: '회칙 동의 & 가입비 입금', desc: '회비 + 수모 금액 입금' },
            { step: 4, title: '카톡방 입장하기', desc: '입장 후 자기소개' },
            { step: 5, title: '수모 받고 토요일에 만나요!', desc: '수영 후 티타임에서 인사' },
          ].map((item, index, arr) => (
            <div key={item.step} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold">
                  {item.step}
                </div>
                {index < arr.length - 1 && (
                  <div className="w-0.5 flex-1 bg-primary-200 my-1" />
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
            <p className="text-sm text-gray-600 mb-1">정원 현황</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.capacityCount}/{settings.maxCapacity}자리
            </p>
            <p className="text-xs text-gray-500">
              {remainingSlots > 0 ? `공석 ${remainingSlots}자리` : '정원 마감'}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-2">첫 가입 시 납부 금액</h3>
          <p className="text-gray-600 text-sm">
            첫 달 회비 2만원 + 수모 2만원 = <span className="font-bold text-primary-600">총 4만원</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            * 수모 2장 구매 시 총 5만원 (회비 2만 + 수모 3만)
          </p>
        </div>

        {/* 수모 안내 */}
        <div className="border-t border-gray-100 pt-4">
          <h3 className="font-semibold text-gray-900 mb-1">즐수팀 수모</h3>
          <p className="text-sm text-gray-500 mb-3">
            즐수팀 회원임을 나타내는 수모예요. 수영장에서 서로를 쉽게 알아볼 수 있어요!
          </p>
          <div className="aspect-[2/1] bg-gray-200 rounded-lg overflow-hidden mb-3">
            <img
              src={asset('images/swim-cap.jpg')}
              alt="즐수팀 수모"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
            <span>• 메시 소재</span>
            <span>• 1장 2만원 / 2장 3만원</span>
            <span>• 필수 구매 및 착용</span>
          </div>
        </div>
      </section>

      {/* 자주 묻는 질문 */}
      <section className="bg-white md:rounded-lg md:shadow p-6 mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">자주 묻는 질문</h2>

        <div className="space-y-4">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="font-semibold text-gray-900 mb-1">
              Q. 수영만 하고 싶어요. 가입해야 하나요?
            </h3>
            <p className="text-gray-600 text-sm">
              수영만 하시려면 게스트로 충분해요.
              당일 빈 자리가 있을 때 참여 가능하니 편하게 오세요.
            </p>
          </div>

          <div className="border-b border-gray-100 pb-4">
            <h3 className="font-semibold text-gray-900 mb-1">
              Q. 게스트인데 수모만 살 수 있나요?
            </h3>
            <p className="text-gray-600 text-sm">
              즐수팀 수모는 회원 전용이라 게스트는 구입이 어려워요.
              가입하시면 필수로 구매하시게 되고, 연습 시 꼭 착용해야 해요.
            </p>
          </div>

          <div className="border-b border-gray-100 pb-4">
            <h3 className="font-semibold text-gray-900 mb-1">
              Q. 수영 초보도 가입할 수 있나요?
            </h3>
            <p className="text-gray-600 text-sm">
              4개 영법을 모두 배우고, 자유형 50m를 일정한 페이스로 완주할 수 있어야 해요.
            </p>
          </div>

          <div className="border-b border-gray-100 pb-4">
            <h3 className="font-semibold text-gray-900 mb-1">
              Q. 가입하고 싶은데 추천은 어떻게 받나요?
            </h3>
            <p className="text-gray-600 text-sm">
              게스트로 꾸준히 참여하고 인사를 나눠 보세요.
              공석이 발생하면 자연스럽게 추천인이 생길 거에요.
            </p>
          </div>

          <div className="border-b border-gray-100 pb-4">
            <h3 className="font-semibold text-gray-900 mb-1">
              Q. 회비는 어디에 쓰이나요?
            </h3>
            <p className="text-gray-600 text-sm">
              대부분 수영 후 티타임 커피값으로 사용해요.
              그 외 송년회 등 이벤트, 수모 제작 등 모임 운영에 활용돼요.
              이벤트 비용이 부족할 때는 별도로 걷기도 해요.
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

          <div className="border-b border-gray-100 pb-4">
            <h3 className="font-semibold text-gray-900 mb-1">
              Q. 못 가는 날은 어떻게 하나요?
            </h3>
            <p className="text-gray-600 text-sm">
              매주 금요일 카톡방 <strong>달력(일정)</strong>에서 출석체크해야 해요.
              토요일 새벽 4시까지 미응답 시 무단불참 처리돼요.
            </p>
          </div>

          <div className="border-b border-gray-100 pb-4">
            <h3 className="font-semibold text-gray-900 mb-1">
              Q. 무단 불참하면 어떻게 되나요?
            </h3>
            <p className="text-gray-600 text-sm">
              출석체크 미응답, 또는 출석하겠다고 하고 안 나오면 1만원 벌금이 있어요.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Q. 지각하면 어떻게 되나요?
            </h3>
            <p className="text-gray-600 text-sm">
              1분당 500원 벌금이 있어요 (최대 1만원).
              8시 정각 입수 기준이에요!
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
              <Link to={applyUrl}>
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
          <Link to={applyUrl} className="block">
            <Button size="lg" className="w-full">가입 신청하기</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
