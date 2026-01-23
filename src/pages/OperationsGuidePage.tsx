import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function OperationsGuidePage() {
  useDocumentTitle('운영자 가이드');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadGuide = async () => {
      setIsLoading(true);
      setError('');

      try {
        const basePath = import.meta.env.BASE_URL;
        const response = await fetch(`${basePath}rules/operations-guide.md`);
        if (!response.ok) {
          throw new Error('운영 가이드를 불러올 수 없습니다.');
        }
        const text = await response.text();
        setContent(text);
      } catch {
        setError('운영 가이드를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadGuide();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white md:rounded-lg md:shadow p-6">
          <div className="text-center py-8 text-gray-500">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white md:rounded-lg md:shadow p-6">
          <div className="text-center py-8 text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* 마크다운 콘텐츠 */}
      <div className="bg-white md:rounded-lg md:shadow p-6 mb-4">
        <div className="prose prose-sm prose-gray max-w-none prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-4 prose-h2:text-lg prose-h2:font-semibold prose-h2:mt-5 prose-h2:mb-2 prose-h3:text-base prose-h3:font-medium prose-h3:mt-3 prose-h3:mb-1 prose-p:text-gray-700 prose-p:my-1 prose-li:text-gray-700 prose-li:my-0.5 prose-ul:my-1 prose-ol:my-1 prose-strong:text-gray-900 prose-table:text-sm prose-hr:hidden">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      </div>

      {/* 자주 묻는 질문 */}
      <section className="bg-white md:rounded-lg md:shadow p-6 mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">자주 묻는 질문</h2>

        <div className="space-y-4">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="font-semibold text-gray-900 mb-1">
              Q. 추천인 동의는 어디서 하나요?
            </h3>
            <p className="text-gray-600 text-sm">
              홈 화면의 "할 일" 섹션에 대기 중인 신청이 표시돼요.
              신청자 정보를 확인하고 3가지 항목에 동의하면 됩니다.
            </p>
          </div>

          <div className="border-b border-gray-100 pb-4">
            <h3 className="font-semibold text-gray-900 mb-1">
              Q. 수모는 어디서 받나요?
            </h3>
            <p className="text-gray-600 text-sm">
              수모 관리자(최선숙 회원)에게 연락해서 받으시면 돼요.
              주로 토요일 수영 시간 전후에 전달받습니다.
            </p>
          </div>

          <div className="border-b border-gray-100 pb-4">
            <h3 className="font-semibold text-gray-900 mb-1">
              Q. 신규 회원 승인은 누가 하나요?
            </h3>
            <p className="text-gray-600 text-sm">
              총무(관리자)가 합니다.
              추천인 동의 완료 + 가입비 입금 확인 후 승인 처리해요.
            </p>
          </div>

          <div className="border-b border-gray-100 pb-4">
            <h3 className="font-semibold text-gray-900 mb-1">
              Q. 카톡방 초대는 어떻게 하나요?
            </h3>
            <p className="text-gray-600 text-sm">
              별도 초대가 필요 없어요!
              승인 완료 후 신규 회원이 로그인하면 카톡방 입장 버튼이 표시됩니다.
            </p>
          </div>

          <div className="border-b border-gray-100 pb-4">
            <h3 className="font-semibold text-gray-900 mb-1">
              Q. 벌금은 어떻게 관리하나요?
            </h3>
            <p className="text-gray-600 text-sm">
              지각/무단불참 벌금은 당일 즐수팀 모임통장으로 자진 입금해요.
              총무가 별도로 수금하지 않습니다.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Q. 회원 정보 수정은 어떻게 하나요?
            </h3>
            <p className="text-gray-600 text-sm">
              관리자 페이지의 "회원 관리"에서 수정할 수 있어요.
              활동지수, 담당 역할 등을 변경할 수 있습니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
