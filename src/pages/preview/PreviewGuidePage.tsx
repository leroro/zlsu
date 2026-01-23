import { useEffect } from 'react';
import { ACTIVITY_LEVELS, ACTIVITY_LEVEL_LABELS, ACTIVITY_LEVEL_ICONS, ACTIVITY_LEVEL_DESCRIPTIONS } from '../../lib/constants';
import { getSettings } from '../../lib/api';

export default function PreviewGuidePage() {
  const settings = getSettings();

  useEffect(() => {
    document.title = '필독! 모임 가이드 - 즐수팀 (미리보기)';
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 미리보기 배너 */}
      <div className="bg-yellow-400 text-yellow-900 text-center py-2 text-sm font-medium">
        이 페이지는 컨펌용 미리보기입니다
      </div>

      <div className="max-w-2xl mx-auto py-4">
        {/* 히어로 섹션 */}
        <section className="bg-gradient-to-br from-primary-500 to-primary-700 text-white md:rounded-lg p-6 sm:p-8 mb-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-4xl">📖</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-white">
              필독! 모임 가이드
            </h1>
            <p className="text-primary-200 text-sm">
              즐수팀 활동에 필요한 정보를 확인하세요
            </p>
          </div>
        </section>

        {/* 활동지수 레벨 섹션 */}
        <section className="bg-white md:rounded-lg md:shadow p-6 mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">활동지수 레벨</h2>

          <p className="text-gray-600 text-sm mb-4">
            활동지수는 모임 참여도와 기여도를 나타내는 지표예요.
            회원 명단에서 이름 옆 아이콘으로 표시됩니다.
          </p>

          {/* 활동지수 레벨 목록 */}
          <div className="space-y-3 mb-6">
            {ACTIVITY_LEVELS.map((level) => (
              <div key={level} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl w-10 text-center">{ACTIVITY_LEVEL_ICONS[level]}</span>
                <div className="flex-1">
                  <span className="font-semibold text-gray-900">{ACTIVITY_LEVEL_LABELS[level]}</span>
                  <p className="text-sm text-gray-600">{ACTIVITY_LEVEL_DESCRIPTIONS[level]}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 활동지수 규칙 */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">활동지수는 이렇게 바뀌어요</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span><strong>가입 승인</strong> → 뉴비로 시작</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span><strong>연습 4회 참여</strong> → 일반 회원</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span><strong>휴면 복귀</strong> → 일반 회원 (스태프는 유지)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span><strong>열정/핵심</strong> → 관리자가 승급</span>
              </div>
            </div>
          </div>
        </section>

        {/* 휴면과 활성 섹션 */}
        <section className="bg-white md:rounded-lg md:shadow p-6 mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">휴면과 활성</h2>

          <div className="text-sm text-gray-600 mb-4 space-y-2">
            <p>사정이 생기면 휴면 상태로 전환할 수 있어요. 휴면 중에는 회비 납부 의무가 없습니다.</p>
            <p><strong className="text-gray-700">연속 {settings.dormancyPeriodWeeks}주 이상</strong> 불참이 예상되면 직접 휴면 신청해 주세요.</p>
            <p className="text-red-600">회비를 미납하거나, 2주 연속 무단불참시 강제 휴면으로 전환되고, 회비는 반환되지 않아요.</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <span className="text-xl">🟢</span>
              <div className="flex-1">
                <span className="font-semibold text-gray-900">활성</span>
                <p className="text-sm text-gray-600">매주 토요일 연습에 참여하는 상태. 매월 회비 납부</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <span className="text-xl">🟡</span>
              <div className="flex-1">
                <span className="font-semibold text-gray-900">휴면</span>
                <p className="text-sm text-gray-600">토요일 연습에 참여하지 못하는 상태. 회비 면제, 정원에서 제외</p>
              </div>
            </div>
          </div>
        </section>

        {/* 생일 축하 */}
        <section className="bg-white md:rounded-lg md:shadow p-6 mb-4">
          <div className="flex gap-3">
            <span className="text-2xl">🎂</span>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">생일 축하</h2>
              <p className="text-gray-600 text-sm">
                이번 달 생일인 회원을 확인하고 축하해 주세요.
                음력 생일도 자동으로 양력 변환되어 표시됩니다.
              </p>
            </div>
          </div>
        </section>

        {/* 대회 참가 */}
        <section className="bg-white md:rounded-lg md:shadow p-6 mb-4">
          <div className="flex gap-3">
            <span className="text-2xl">🏆</span>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">대회 참가</h2>
              <p className="text-gray-600 text-sm">
                즐수팀은 다양한 수영 대회에 참가하고 있어요.
                대회 일정은 카카오톡 단톡방에서 안내됩니다.
                참가는 자율이니 부담 없이 도전해 보세요!
              </p>
            </div>
          </div>
        </section>

        {/* 수모 추가 구입 */}
        <section className="bg-white md:rounded-lg md:shadow p-6 mb-4">
          <div className="flex gap-3">
            <span className="text-2xl">🧢</span>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">수모 추가 구입</h2>
              <p className="text-gray-600 text-sm">
                수모가 추가로 필요하신가요?
                수모 관리자를 통해 구입할 수 있어요. (1장 2만원, 2장 3만원)
              </p>
            </div>
          </div>
        </section>

        {/* 자주 묻는 질문 */}
        <section className="bg-white md:rounded-lg md:shadow p-6 mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">자주 묻는 질문</h2>

          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="font-semibold text-gray-900 mb-1">
                Q. 불참 표시는 어디서 하나요?
              </h3>
              <p className="text-gray-600 text-sm">
                카카오톡 단톡방의 <strong>달력(캘린더)</strong>에서 해당 토요일에 불참 표시하면 돼요.
                채팅으로만 말씀하시면 인원 파악이 어려워요!
              </p>
            </div>

            <div className="border-b border-gray-100 pb-4">
              <h3 className="font-semibold text-gray-900 mb-1">
                Q. 회비는 언제까지 내야 하나요?
              </h3>
              <p className="text-gray-600 text-sm">
                매월 1일에 납부해 주세요.
                즐수팀 모임통장으로 2만원을 입금하시면 됩니다.
                매월 10일에 단톡방에 회비 미납자 명단이 공개됩니다.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Q. 탈퇴는 어떻게 하나요?
              </h3>
              <p className="text-gray-600 text-sm">
                탈퇴 시 납부한 회비는 환불되지 않습니다.
              </p>
            </div>
          </div>
        </section>

        {/* 더 궁금한 점 */}
        <section className="bg-gray-50 md:rounded-lg p-6 pb-10 text-center">
          <p className="text-gray-600 text-sm">
            더 궁금한 점이 있으신가요?<br /> 팀 카톡방에서 질문해 주세요!
          </p>
        </section>
      </div>
    </div>
  );
}
