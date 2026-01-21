import { useState, useEffect } from 'react';
import Button from './Button';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  termsPath: string;
}

export default function TermsModal({ isOpen, onClose, title, termsPath }: TermsModalProps) {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && termsPath) {
      setIsLoading(true);
      fetch(termsPath)
        .then((res) => res.text())
        .then((text) => {
          setContent(text);
          setIsLoading(false);
        })
        .catch(() => {
          setContent('약관을 불러올 수 없습니다.');
          setIsLoading(false);
        });
    }
  }, [isOpen, termsPath]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* 모달 */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] mx-4 flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* 내용 */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">불러오는 중...</div>
          ) : (
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-700">
              {content}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="p-4 border-t">
          <Button onClick={onClose} className="w-full">
            확인
          </Button>
        </div>
      </div>
    </div>
  );
}
