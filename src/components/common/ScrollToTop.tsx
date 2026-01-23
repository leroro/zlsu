import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  // useLayoutEffect로 DOM 업데이트 전에 실행
  useLayoutEffect(() => {
    // 즉시 스크롤 시도
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    // 즉시 실행
    scrollToTop();

    // iOS Safari를 위한 지연 실행 (주소창 높이 변화 대응)
    requestAnimationFrame(() => {
      scrollToTop();
      // 추가 지연으로 iOS 주소창 애니메이션 완료 후 재시도
      setTimeout(scrollToTop, 50);
    });
  }, [pathname]);

  return null;
}
