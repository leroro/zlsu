import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getActiveAndInactiveMemberCount, getSettings } from '../lib/api';
import Button from '../components/common/Button';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import AboutContent from '../components/about/AboutContent';

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
  const [isFloating, setIsFloating] = useState(false);
  const joinInfoSectionRef = useRef<HTMLElement>(null);
  const ctaSectionRef = useRef<HTMLElement>(null);

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
    <div className="max-w-2xl mx-auto">
      <AboutContent joinInfoSectionRef={joinInfoSectionRef} />

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
      {remainingSlots > 0 && (
        <div
          className={`fixed bottom-0 left-0 right-0 p-4 md:hidden z-50 transition-transform duration-300 ease-out ${
            isFloating ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <Link to={applyUrl} className="block max-w-md mx-auto">
            <Button size="lg" className="w-full shadow-lg">가입 신청하기</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
