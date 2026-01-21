import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateMember, getWithdrawalRequests, changePassword } from '../lib/api';
import { ROLE_LABELS } from '../lib/constants';
import Button from '../components/common/Button';

export default function MyPage() {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [formData, setFormData] = useState({
    phone: user?.phone || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  if (!user) return null;

  // 대기 중인 탈퇴 신청 확인
  const pendingWithdrawal = getWithdrawalRequests().find(
    (wr) => wr.memberId === user.id && wr.status === 'pending'
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    try {
      updateMember(user.id, {
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
      phone: user.phone,
    });
    setIsEditing(false);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = () => {
    if (!passwordData.currentPassword) {
      setMessage({ type: 'error', text: '현재 비밀번호를 입력해주세요.' });
      return;
    }
    if (!passwordData.newPassword) {
      setMessage({ type: 'error', text: '새 비밀번호를 입력해주세요.' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: '새 비밀번호는 6자 이상이어야 합니다.' });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' });
      return;
    }

    const result = changePassword(user.id, passwordData.currentPassword, passwordData.newPassword);
    if (result.success) {
      setMessage({ type: 'success', text: '비밀번호가 변경되었습니다.' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordChange(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } else {
      setMessage({ type: 'error', text: result.error || '비밀번호 변경에 실패했습니다.' });
    }
  };

  const handlePasswordCancel = () => {
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordChange(false);
  };

  return (
    <div className="space-y-4">
      {/* 메시지 */}
      {message.text && (
        <div
          className={`p-3 rounded-md text-sm ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 내 정보 */}
      <div className="bg-white md:rounded-lg md:shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-900">내 정보</h1>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="secondary" size="sm">
              수정
            </Button>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">이름</span>
            <span className="text-gray-900 font-medium">{user.name}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">담당</span>
            <span className="text-gray-900">{user.position || '-'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">이메일</span>
            <span className="text-gray-900">{user.email}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-500">연락처</span>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-32 px-2 py-1 border border-gray-300 rounded text-sm text-right"
              />
            ) : (
              <span className="text-gray-900">{user.phone}</span>
            )}
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">가입일</span>
            <span className="text-gray-900">{user.joinedAt}</span>
          </div>
          {user.role === 'admin' && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">권한</span>
              <span className="text-gray-900">{ROLE_LABELS[user.role]}</span>
            </div>
          )}
        </div>

        {isEditing && (
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSave} size="sm">저장</Button>
            <Button onClick={handleCancel} variant="secondary" size="sm">취소</Button>
          </div>
        )}
      </div>

      {/* 비밀번호 변경 */}
      <div className="bg-white md:rounded-lg md:shadow p-4">
        <button
          onClick={() => setShowPasswordChange(!showPasswordChange)}
          className="flex justify-between items-center w-full text-left"
        >
          <h2 className="font-bold text-gray-900">비밀번호 변경</h2>
          <span className="text-gray-400 text-sm">{showPasswordChange ? '닫기' : '열기'}</span>
        </button>

        {showPasswordChange && (
          <div className="mt-4 space-y-3">
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="현재 비밀번호"
            />
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="새 비밀번호 (6자 이상)"
            />
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="새 비밀번호 확인"
            />
            <div className="flex gap-2">
              <Button onClick={handlePasswordSubmit} size="sm">변경</Button>
              <Button onClick={handlePasswordCancel} variant="secondary" size="sm">취소</Button>
            </div>
          </div>
        )}
      </div>

      {/* 탈퇴 */}
      <div className="bg-white md:rounded-lg md:shadow p-4">
        {pendingWithdrawal ? (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm">
            <span className="text-red-600">⏳</span>{' '}
            <span className="text-red-800">탈퇴 승인 대기중</span>
            <span className="text-red-700 ml-2">({pendingWithdrawal.createdAt})</span>
          </div>
        ) : (
          <Link to="/withdraw" className="text-sm text-gray-500 hover:text-red-600">
            탈퇴 신청 →
          </Link>
        )}
      </div>
    </div>
  );
}
