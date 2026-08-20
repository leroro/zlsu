import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { RULES_VERSIONS } from '../lib/constants';
import Button from '../components/common/Button';

/**
 * 외부 공유용 회칙 페이지
 * - InfoPage에서 연결되는 회칙 상세 페이지
 * - 헤더 없음, 미리보기 배너 없음
 * - /info/rules: 항상 최신 버전 / /info/rules/:version: 지난 회칙 아카이브
 */
export default function InfoRulesPage() {
  const { version } = useParams();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 버전 파라미터가 없으면 최신 버전, 있으면 해당 아카이브 버전
  const rulesVersion = version
    ? RULES_VERSIONS.find((v) => v.version === version)
    : RULES_VERSIONS[0];
  const isArchived = !!version && rulesVersion !== RULES_VERSIONS[0];

  useEffect(() => {
    document.title = rulesVersion && isArchived
      ? `회칙 ${rulesVersion.version} - 즐수팀`
      : '회칙 - 즐수팀';
  }, [rulesVersion, isArchived]);

  useEffect(() => {
    const loadRules = async () => {
      setIsLoading(true);
      setError('');

      if (!rulesVersion) {
        setError('존재하지 않는 회칙 버전이에요.');
        setIsLoading(false);
        return;
      }

      try {
        const basePath = import.meta.env.BASE_URL;
        const response = await fetch(`${basePath}${rulesVersion.path.slice(1)}`);
        if (!response.ok) {
          throw new Error('회칙을 불러올 수 없습니다.');
        }
        const text = await response.text();
        setContent(text);
      } catch {
        setError('회칙을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadRules();
  }, [version]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-2xl mx-auto py-4">
          <div className="bg-white md:rounded-lg md:shadow p-6">
            <div className="text-center py-8 text-gray-500">로딩 중...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-2xl mx-auto py-4">
          <div className="bg-white md:rounded-lg md:shadow p-6">
            <div className="text-center py-8 text-red-500">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto py-4">
        <div className="bg-white md:rounded-lg md:shadow p-6">
          <div className="prose prose-gray max-w-none prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-4 prose-h2:text-xl prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-2 prose-h2:bg-blue-50 prose-h2:px-3 prose-h2:py-1.5 prose-h2:rounded-md prose-h2:-mx-1 prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-4 prose-h3:mb-1 prose-h3:text-blue-800 prose-h3:border-l-4 prose-h3:border-blue-400 prose-h3:pl-2 prose-h4:text-base prose-h4:font-semibold prose-h4:mt-3 prose-h4:mb-1 prose-h4:text-gray-800 prose-p:text-gray-700 prose-p:my-0.5 prose-li:text-gray-700 prose-li:my-0 prose-ul:my-0.5 prose-ol:my-0.5 prose-strong:text-gray-900 prose-table:text-sm prose-hr:hidden">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        </div>

        {/* 하단 네비게이션 */}
        <div className="bg-white md:rounded-lg md:shadow p-6 mt-4">
          <div className="text-center">
            {isArchived ? (
              <>
                <p className="text-gray-500 text-sm mb-4">
                  지금 보신 문서는 지난 회칙이에요.
                </p>
                <Link to="/info/rules">
                  <Button size="lg" className="w-full sm:w-auto">
                    현행 회칙 보기
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <p className="text-gray-500 text-sm mb-4">
                  회칙을 모두 읽으셨나요?
                </p>
                <Link to="/info">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    모임 소개로 돌아가기
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
