import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  // useLayoutEffect로 DOM 렌더링 전에 먼저 실행
  useLayoutEffect(() => {
    // 강제로 맨 위로 스크롤
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  // useEffect로 렌더링 후 추가 보정 (iOS Safari 주소창 대응)
  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // visualViewport API 사용 (iOS Safari 지원)
      if (window.visualViewport) {
        window.scrollTo(0, -window.visualViewport.offsetTop);
      }
    };

    // 즉시 실행
    scrollToTop();

    // iOS Safari 주소창 애니메이션 완료 대기 (여러 시점에서 재시도)
    const timers = [
      setTimeout(scrollToTop, 0),
      setTimeout(scrollToTop, 50),
      setTimeout(scrollToTop, 100),
      setTimeout(scrollToTop, 200),
    ];

    return () => timers.forEach(clearTimeout);
  }, [pathname]);

  return null;
}
