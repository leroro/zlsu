import { useState, useEffect } from 'react';
import { RULES_VERSIONS } from '../lib/constants';
import Button from '../components/common/Button';

export default function RulesPage() {
  const [selectedVersion, setSelectedVersion] = useState(RULES_VERSIONS[0]);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRules = async () => {
      setIsLoading(true);
      setError('');

      try {
        const basePath = import.meta.env.BASE_URL;
        const response = await fetch(`${basePath}rules/${selectedVersion.version}.md`);
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
  }, [selectedVersion]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">회칙</h1>

        {/* 버전 선택 */}
        <div className="flex gap-2 mb-6">
          {RULES_VERSIONS.map((version) => (
            <Button
              key={version.version}
              variant={selectedVersion.version === version.version ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedVersion(version)}
            >
              {version.label}
            </Button>
          ))}
        </div>

        {/* 내용 */}
        <div className="border rounded-lg p-6 bg-gray-50">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">로딩 중...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
                {content}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
