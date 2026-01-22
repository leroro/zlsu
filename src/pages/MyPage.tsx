import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateMember, getWithdrawalRequests, changePassword } from '../lib/api';
import { SwimmingAbility, SwimmingLevel, BirthDateType } from '../lib/types';
import { ROLE_LABELS, GENDER_LABELS, SWIMMING_LEVEL_LABELS, SWIMMING_LEVEL_EMOJIS, SWIMMING_STROKES } from '../lib/constants';
import Button from '../components/common/Button';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function MyPage() {
  useDocumentTitle('내 정보');
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  const [formData, setFormData] = useState({
    phone: user?.phone || '',
    birthDate: user?.birthDate || '',
    birthDateType: (user?.birthDateType || 'solar') as BirthDateType,
    swimmingLevel: (user?.swimmingLevel || '') as SwimmingLevel | '',
  });

  const [swimmingAbility, setSwimmingAbility] = useState<SwimmingAbility>(
    user?.swimmingAbility || {
      freestyle: false,
      backstroke: false,
      breaststroke: false,
      butterfly: false,
    }
  );

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwimmingAbilityChange = (stroke: keyof SwimmingAbility) => {
    setSwimmingAbility((prev) => ({ ...prev, [stroke]: !prev[stroke] }));
  };

  const handleSave = () => {
    try {
      updateMember(user.id, {
        phone: formData.phone,
        birthDate: formData.birthDate || undefined,
        birthDateType: formData.birthDateType,
        swimmingLevel: formData.swimmingLevel || undefined,
        swimmingAbility,
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
      birthDate: user.birthDate || '',
      birthDateType: user.birthDateType || 'solar',
      swimmingLevel: user.swimmingLevel || '',
    });
    setSwimmingAbility(
      user.swimmingAbility || {
        freestyle: false,
        backstroke: false,
        breaststroke: false,
        butterfly: false,
      }
    );
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

  // 수영 영법 텍스트 생성
  const getSwimmingAbilityText = () => {
    const abilities = [];
    if (user.swimmingAbility?.freestyle) abilities.push('자유형');
    if (user.swimmingAbility?.backstroke) abilities.push('배영');
    if (user.swimmingAbility?.breaststroke) abilities.push('평영');
    if (user.swimmingAbility?.butterfly) abilities.push('접영');
    return abilities.length > 0 ? abilities.join(', ') : '-';
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

      {/* 기본 정보 */}
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
          {/* 이름 - 수정 불가 */}
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">이름</span>
            <span className="text-gray-900 font-medium">{user.name}</span>
          </div>

          {/* 담당 - 수정 불가 (관리자만 변경 가능) */}
          {user.position && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">담당</span>
              <span className="text-gray-900">{user.position}</span>
            </div>
          )}

          {/* 이메일 - 수정 불가 */}
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">이메일</span>
            <span className="text-gray-900">{user.email}</span>
          </div>

          {/* 연락처 - 수정 가능 */}
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-500">연락처</span>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-36 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                placeholder="010-0000-0000"
              />
            ) : (
              <span className="text-gray-900">{user.phone || '-'}</span>
            )}
          </div>

          {/* 성별 - 수정 불가 */}
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">성별</span>
            <span className="text-gray-900">{user.gender ? GENDER_LABELS[user.gender] : '-'}</span>
          </div>

          {/* 생년월일 - 수정 가능 */}
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-500">생년월일</span>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="w-36 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            ) : (
              <span className="text-gray-900">
                {user.birthDate || '-'}
                {user.birthDate && user.birthDateType === 'lunar' && (
                  <span className="text-purple-600 text-sm ml-1">(음력)</span>
                )}
              </span>
            )}
          </div>

          {/* 양력/음력 - 수정 가능 (생년월일 입력 시) */}
          {isEditing && formData.birthDate && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-500">양력/음력</span>
              <div className="flex gap-3">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="birthDateType"
                    value="solar"
                    checked={formData.birthDateType === 'solar'}
                    onChange={handleChange}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">양력</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="birthDateType"
                    value="lunar"
                    checked={formData.birthDateType === 'lunar'}
                    onChange={handleChange}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">음력</span>
                </label>
              </div>
            </div>
          )}

          {/* 추천인 - 수정 불가 */}
          {user.referrer && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">추천인</span>
              <span className="text-gray-900">{user.referrer}</span>
            </div>
          )}

          {/* 가입일 - 수정 불가 */}
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

      {/* 수영 정보 */}
      <div className="bg-white md:rounded-lg md:shadow p-4">
        <h2 className="font-bold text-gray-900 mb-4">수영 정보</h2>

        <div className="space-y-3">
          {/* 수영 레벨 - 수정 가능 */}
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-500">수영 레벨</span>
            {isEditing ? (
              <select
                name="swimmingLevel"
                value={formData.swimmingLevel}
                onChange={handleChange}
                className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="">선택</option>
                <option value="beginner">초급반</option>
                <option value="intermediate">중급반</option>
                <option value="advanced">상급반</option>
                <option value="masters">마스터반</option>
              </select>
            ) : (
              <span className="text-gray-900 flex items-center gap-1">
                {user.swimmingLevel ? (
                  <>
                    <span>{SWIMMING_LEVEL_EMOJIS[user.swimmingLevel]}</span>
                    <span>{SWIMMING_LEVEL_LABELS[user.swimmingLevel]}</span>
                  </>
                ) : (
                  '-'
                )}
              </span>
            )}
          </div>

          {/* 수영 영법 - 수정 가능 */}
          <div className="py-2 border-b border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500">수영 영법</span>
              {!isEditing && (
                <span className="text-gray-900">{getSwimmingAbilityText()}</span>
              )}
            </div>
            {isEditing && (
              <div className="flex flex-wrap gap-2 mt-2">
                {SWIMMING_STROKES.map((stroke) => (
                  <label
                    key={stroke.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                      swimmingAbility[stroke.id as keyof SwimmingAbility]
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={swimmingAbility[stroke.id as keyof SwimmingAbility]}
                      onChange={() => handleSwimmingAbilityChange(stroke.id as keyof SwimmingAbility)}
                      className="sr-only"
                    />
                    <span className="text-sm">{stroke.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* 가입 동기 - 수정 불가 */}
          {user.motivation && (
            <div className="py-2">
              <span className="text-gray-500 block mb-1">가입 동기</span>
              <p className="text-gray-700 text-sm bg-gray-50 rounded p-3">{user.motivation}</p>
            </div>
          )}
        </div>
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
