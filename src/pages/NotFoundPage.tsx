import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function NotFoundPage() {
  useDocumentTitle('페이지를 찾을 수 없습니다');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center px-4">
        <div className="text-6xl mb-4">🏊</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="text-gray-500 mb-6">
          요청하신 페이지가 존재하지 않거나<br />
          이동되었을 수 있습니다.
        </p>
        <Link to="/">
          <Button>홈으로 돌아가기</Button>
        </Link>
      </div>
    </div>
  );
}
