#5 Pretendard 웹폰트 적용으로 가독성 강화

## 이슈 유형
- UI·UX 개선
- 접근성 개선

## 배경
현재 시스템 기본 폰트(-apple-system, BlinkMacSystemFont 등)를 사용 중이나
전체적으로 글자 두께가 얇아 보여 가독성이 부족하게 느껴짐

40~50대 이상 사용자를 고려할 때
더 명확한 글자 두께와 일관된 폰트 적용이 필요함

## 문제 사항
- 시스템 폰트의 기본 두께(Regular)가 얇아 보임
- OS/브라우저별로 폰트 렌더링이 달라 일관성 부족
- 중요한 텍스트와 일반 텍스트의 시각적 구분이 부족

## 개선 내용
- Pretendard 웹폰트 적용 (CDN 방식)
- 기본 글꼴 두께: Regular (400)
- 강조 텍스트: Medium (500) 및 Bold (700) 혼용
- Tailwind font-weight 클래스와 연동

## 처리 기준
- 기능 변경 없음
- 전역 폰트 스타일 수정
- 기존 font-weight 클래스(font-medium, font-semibold, font-bold) 유지

## 적용 전략

### 1. CDN 방식 (권장)
```html
<!-- index.html <head>에 추가 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.min.css" />
```

### 2. Tailwind 설정
```js
// tailwind.config.js
fontFamily: {
  sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
}
```

### 3. 두께 활용 가이드
| Tailwind 클래스 | font-weight | Pretendard 두께 | 용도 |
|----------------|-------------|-----------------|------|
| font-normal | 400 | Regular | 본문 텍스트 |
| font-medium | 500 | Medium | 소제목, 강조 |
| font-semibold | 600 | SemiBold | 섹션 제목 |
| font-bold | 700 | Bold | 페이지 제목 |

## 비고
- Pretendard는 한글 최적화 무료 폰트로 가독성이 뛰어남
- Variable 폰트 지원으로 다양한 두께를 효율적으로 사용 가능
- #4 폰트 크기 개선과 연계하여 종합적인 가독성 향상 기대
