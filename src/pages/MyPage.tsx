import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateMember } from '../lib/api';
import { ROLE_LABELS } from '../lib/constants';
import { MemberStatusBadge } from '../components/common/StatusBadge';
import Button from '../components/common/Button';

export default function MyPage() {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nickname: user?.nickname || '',
    phone: user?.phone || '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  if (!user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    try {
      updateMember(user.id, {
        nickname: formData.nickname || undefined,
        phone: formData.phone,
      });
      refreshUser();
      setIsEditing(false);
      setMessage({ type: 'success', text: '정보가 수정되었습니다.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch {
      setMessage({ type: 'error', text: '수정 중 오류가 발생했습니다.' });
    }
  };

  const handleCancel = () => {
    setFormData({
      nickname: user.nickname || '',
      phone: user.phone,
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">내 정보</h1>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="secondary" size="sm">
              수정
            </Button>
          )}
        </div>

        {message.text && (
          <div
            className={`p-3 rounded-md text-sm mb-4 ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">이름</label>
              <div className="text-gray-900">{user.name}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">닉네임</label>
              {isEditing ? (
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="닉네임 (선택)"
                />
              ) : (
                <div className="text-gray-900">{user.nickname || '-'}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">이메일</label>
              <div className="text-gray-900">{user.email}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">연락처</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              ) : (
                <div className="text-gray-900">{user.phone}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">생년월일</label>
              <div className="text-gray-900">{user.birthDate || '-'}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">상태</label>
              <MemberStatusBadge status={user.status} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">역할</label>
              <div className="text-gray-900">{ROLE_LABELS[user.role]}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">가입일</label>
              <div className="text-gray-900">{user.joinedAt}</div>
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave}>저장</Button>
              <Button onClick={handleCancel} variant="secondary">
                취소
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 상태 변경 신청 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">활동 상태 변경</h2>
        <p className="text-gray-600 mb-4">
          현재 상태: <MemberStatusBadge status={user.status} />
        </p>
        <p className="text-sm text-gray-500 mb-4">
          활동 상태를 변경하려면 관리자 승인이 필요합니다.
        </p>
        <Link to="/change-status">
          <Button variant="secondary">상태 변경 신청</Button>
        </Link>
      </div>
    </div>
  );
}
