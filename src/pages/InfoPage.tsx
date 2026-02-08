import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import AboutContent from '../components/about/AboutContent';

/**
 * 외부 공유용 모임 안내 페이지
 * - 신규 회원에게 공유할 수 있는 독립 페이지
 * - 헤더 없음, 미리보기 배너 없음
 * - 하단에 "회칙 자세히 보기" 버튼만 표시
 */
export default function InfoPage() {
  // CTA 플로팅 상태
  const [isFloating, setIsFloating] = useState(false);
  const joinInfoSectionRef = useRef<HTMLElement>(null);
  const ctaSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.title = '모임 소개 - 즐수팀';
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!joinInfoSectionRef.current || !ctaSectionRef.current) return;

      const joinInfoRect = joinInfoSectionRef.current.getBoundingClientRect();
      const ctaRect = ctaSectionRef.current.getBoundingClientRect();

      // 가입 안내 섹션 진입 시 플로팅 활성화, CTA 섹션 도달 시 해제
      const passedJoinInfo = joinInfoRect.top < window.innerHeight * 0.8;
      const reachedCta = ctaRect.top < window.innerHeight;

      setIsFloating(passedJoinInfo && !reachedCta);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 초기 상태 체크
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto py-4">
        <AboutContent joinInfoSectionRef={joinInfoSectionRef} />

        {/* CTA - 회칙 자세히 보기만 */}
        <section ref={ctaSectionRef} className="bg-white md:rounded-lg md:shadow p-6 pb-20 md:pb-6">
          <div className="text-center">
            <p className="text-gray-700 mb-2 font-medium">
              여기까지는 가입 전 알아두실 내용이에요.
            </p>
            <p className="text-gray-500 text-sm mb-4">
              실제 모임 운영 규정은 회칙에 자세히 나와 있어요.<br />
              가입 시 회칙 동의가 필수이니, 꼭 읽어주세요!
            </p>
            <Link to="/info/rules">
              <Button size="lg" className="w-full sm:w-auto">
                회칙 자세히 보기
              </Button>
            </Link>
          </div>
        </section>

        {/* 플로팅 CTA 버튼 (모바일) - 회칙 자세히 보기 */}
        <div
          className={`fixed bottom-0 left-0 right-0 p-4 md:hidden z-50 transition-transform duration-300 ease-out ${
            isFloating ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <Link to="/info/rules" className="block max-w-md mx-auto">
            <Button size="lg" className="w-full shadow-lg">회칙 자세히 보기</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
