import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { ACTIVITY_LEVELS, ACTIVITY_LEVEL_LABELS, ACTIVITY_LEVEL_ICONS, ACTIVITY_LEVEL_DESCRIPTIONS } from '../lib/constants';

export default function GuidePage() {
  useDocumentTitle('필독! 모임 가이드');

  return (
    <div className="max-w-2xl mx-auto">
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
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">활동지수는 이렇게 바뀌어요</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span><strong>가입 승인</strong> → 뉴비로 시작</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span><strong>2개월 후</strong> → 자동으로 일반 회원</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span><strong>휴면 복귀</strong> → 일반으로 리셋 (스태프는 유지)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span><strong>열정/핵심</strong> → 관리자가 승급</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Link
            to="/members"
            className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            회원 명단 보러가기
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* 휴면과 활동 섹션 */}
      <section className="bg-white md:rounded-lg md:shadow p-6 mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">휴면과 활동</h2>

        <p className="text-gray-600 text-sm mb-4">
          사정이 생기면 휴면 상태로 전환할 수 있어요. 휴면 중에는 회비 납부 의무가 없습니다.
        </p>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <span className="text-xl">🟢</span>
            <div className="flex-1">
              <span className="font-semibold text-gray-900">활동</span>
              <p className="text-sm text-gray-600">정기적으로 모임에 참여하는 상태. 매월 회비 납부</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
            <span className="text-xl">🟡</span>
            <div className="flex-1">
              <span className="font-semibold text-gray-900">휴면</span>
              <p className="text-sm text-gray-600">일시적으로 쉬는 상태. 회비 면제, 정원에서 제외</p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-2 text-sm">알아두세요</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• 휴면에서 활동으로 돌아오려면 정원에 여유가 있어야 해요</li>
            <li>• 복귀 시 활동지수는 "일반"으로 리셋됩니다 (스태프 제외)</li>
          </ul>
        </div>

        <div className="flex justify-end">
          <Link
            to="/change-status"
            className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            상태 변경 신청하기
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* 생일 축하 */}
      <section className="bg-white md:rounded-lg md:shadow p-6 mb-4">
        <div className="flex gap-3">
          <span className="text-2xl">🎂</span>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-2">생일 축하</h2>
            <p className="text-gray-600 text-sm mb-3">
              이번 달 생일인 회원을 확인하고 축하해 주세요.
              음력 생일도 자동으로 양력 변환되어 표시됩니다.
            </p>
            <Link
              to="/members?tab=birthday"
              className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              생일 보러가기
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 대회 참가 */}
      <section className="bg-white md:rounded-lg md:shadow p-6 mb-4">
        <div className="flex gap-3">
          <span className="text-2xl">🏆</span>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-2">대회 참가</h2>
            <p className="text-gray-600 text-sm mb-3">
              즐수팀은 다양한 수영 대회에 참가하고 있어요.
              대회 일정은 카카오톡 단톡방에서 안내됩니다.
              참가는 자율이니 부담 없이 도전해 보세요!
            </p>
            <p className="text-gray-600 text-sm">
              회원 명단에서 각 회원의 주종목을 확인할 수 있어요.
            </p>
            <Link
              to="/members"
              className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium mt-2"
            >
              회원 명단 보러가기
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 수모 추가 구입 */}
      <section className="bg-white md:rounded-lg md:shadow p-6 mb-4">
        <div className="flex gap-3">
          <span className="text-2xl">🧢</span>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-2">수모 추가 구입</h2>
            <p className="text-gray-600 text-sm mb-3">
              수모가 추가로 필요하신가요?
              수모 담당자를 통해 구입할 수 있어요. (1장 2만원, 2장 3만원)
            </p>
            <Link
              to="/request/swim-cap"
              className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              수모 구입 안내
              <span>→</span>
            </Link>
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
              매월 8일에 단톡방에 회비 미납자 명단이 공개됩니다.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Q. 탈퇴는 어떻게 하나요?
            </h3>
            <p className="text-gray-600 text-sm mb-2">
              탈퇴 시 납부한 회비는 환불되지 않습니다.
            </p>
            <Link to="/withdraw" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              탈퇴 신청하기 →
            </Link>
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
  );
}
