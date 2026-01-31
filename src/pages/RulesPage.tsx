import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { TERMS } from '../lib/constants';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function RulesPage() {
  useDocumentTitle('회칙');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRules = async () => {
      setIsLoading(true);
      setError('');

      try {
        const basePath = import.meta.env.BASE_URL;
        const response = await fetch(`${basePath}${TERMS.RULES.slice(1)}`);
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
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white md:rounded-lg md:shadow p-6">
        <div className="text-center py-8 text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white md:rounded-lg md:shadow p-6">
        <div className="text-center py-8 text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white md:rounded-lg md:shadow p-6">
      <div className="prose prose-gray max-w-none prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-4 prose-h2:text-xl prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-2 prose-h2:bg-blue-50 prose-h2:px-3 prose-h2:py-1.5 prose-h2:rounded-md prose-h2:-mx-1 prose-h3:text-base prose-h3:font-medium prose-h3:mt-3 prose-h3:mb-1 prose-p:text-gray-700 prose-p:my-0.5 prose-li:text-gray-700 prose-li:my-0 prose-ul:my-0.5 prose-ol:my-0.5 prose-strong:text-gray-900 prose-table:text-sm prose-hr:hidden">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
