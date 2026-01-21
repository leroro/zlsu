import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function OperationsGuidePage() {
  useDocumentTitle('운영 가이드');
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
      <div className="prose prose-sm prose-gray max-w-none prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-4 prose-h2:text-lg prose-h2:font-semibold prose-h2:mt-5 prose-h2:mb-2 prose-h3:text-base prose-h3:font-medium prose-h3:mt-3 prose-h3:mb-1 prose-p:text-gray-700 prose-p:my-1 prose-li:text-gray-700 prose-li:my-0.5 prose-ul:my-1 prose-ol:my-1 prose-strong:text-gray-900 prose-table:text-sm prose-hr:hidden">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
