import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateMember, getWithdrawalRequests, changePassword } from '../lib/api';
import { SwimmingAbility, SwimmingLevel, BirthDateType, CompetitionInterest } from '../lib/types';
import { GENDER_LABELS, SWIMMING_LEVEL_LABELS, SWIMMING_LEVEL_EMOJIS, SWIMMING_STROKES, COMPETITION_INTEREST_OPTIONS, COMPETITION_INTEREST_LABELS } from '../lib/constants';
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
    competitionInterest: (user?.competitionInterest || '') as CompetitionInterest | '',
    motivation: user?.motivation || '',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
        competitionInterest: formData.competitionInterest || undefined,
        motivation: formData.motivation || undefined,
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
      competitionInterest: user.competitionInterest || '',
      motivation: user.motivation || '',
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

  // 주종목 텍스트 생성
  const getSwimmingAbilityText = () => {
    const abilities = [];
    if (user.swimmingAbility?.freestyle) abilities.push('자유형');
    if (user.swimmingAbility?.backstroke) abilities.push('배영');
    if (user.swimmingAbility?.breaststroke) abilities.push('평영');
    if (user.swimmingAbility?.butterfly) abilities.push('접영');
    return abilities.length > 0 ? abilities.join(', ') : '-';
  };

  // 정보 행 컴포넌트
  const InfoRow = ({ label, value, children }: { label: string; value?: React.ReactNode; children?: React.ReactNode }) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
      <span className="text-gray-500 text-sm">{label}</span>
      {children || <span className="text-gray-900">{value || '-'}</span>}
    </div>
  );

  return (
    <div className="max-w-lg mx-auto">
      {/* 메시지 */}
      {message.text && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white md:rounded-lg md:shadow">
        {/* 헤더 */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">내 정보</h1>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                수정
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  저장
                </button>
                <button
                  onClick={handleCancel}
                  className="text-sm text-gray-500 hover:text-gray-600"
                >
                  취소
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 기본 정보 */}
        <div className="px-5 py-4">
          <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">기본 정보</h2>
          <div className="space-y-0">
            <InfoRow label="이름" value={user.name} />
            {user.position && <InfoRow label="담당" value={user.position} />}
            <InfoRow label="이메일" value={user.email} />
            <InfoRow label="연락처">
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-40 px-2 py-1 border border-gray-300 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="010-0000-0000"
                />
              ) : (
                <span className="text-gray-900">{user.phone || '-'}</span>
              )}
            </InfoRow>
            <InfoRow label="성별" value={user.gender ? GENDER_LABELS[user.gender] : '-'} />
            <InfoRow label="생년월일">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className="w-36 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  {formData.birthDate && (
                    <select
                      name="birthDateType"
                      value={formData.birthDateType}
                      onChange={handleChange}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="solar">양력</option>
                      <option value="lunar">음력</option>
                    </select>
                  )}
                </div>
              ) : (
                <span className="text-gray-900">
                  {user.birthDate || '-'}
                  {user.birthDate && user.birthDateType === 'lunar' && (
                    <span className="text-purple-600 text-sm ml-1">(음력)</span>
                  )}
                </span>
              )}
            </InfoRow>
            {user.referrer && <InfoRow label="추천인" value={user.referrer} />}
            <InfoRow label="가입일" value={user.joinedAt} />
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-t border-gray-100" />

        {/* 수영 정보 */}
        <div className="px-5 py-4">
          <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">수영 정보</h2>
          <div className="space-y-0">
            <InfoRow label="수영 레벨">
              {isEditing ? (
                <select
                  name="swimmingLevel"
                  value={formData.swimmingLevel}
                  onChange={handleChange}
                  className="w-32 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">선택</option>
                  <option value="beginner">초급</option>
                  <option value="intermediate">중급</option>
                  <option value="advanced">상급</option>
                  <option value="masters">마스터</option>
                  <option value="competition">대회수상</option>
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
            </InfoRow>

            {/* 주종목 */}
            <div className="py-3 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">주종목</span>
                {!isEditing && <span className="text-gray-900">{getSwimmingAbilityText()}</span>}
              </div>
              {isEditing && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {SWIMMING_STROKES.map((stroke) => (
                    <button
                      key={stroke.id}
                      type="button"
                      onClick={() => handleSwimmingAbilityChange(stroke.id as keyof SwimmingAbility)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        swimmingAbility[stroke.id as keyof SwimmingAbility]
                          ? 'bg-primary-100 text-primary-700 border border-primary-300'
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}
                    >
                      {stroke.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <InfoRow label="대회 참가 의향">
              {isEditing ? (
                <select
                  name="competitionInterest"
                  value={formData.competitionInterest}
                  onChange={handleChange}
                  className="w-36 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">선택</option>
                  {COMPETITION_INTEREST_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-gray-900">
                  {user.competitionInterest ? COMPETITION_INTEREST_LABELS[user.competitionInterest] : '-'}
                </span>
              )}
            </InfoRow>

            {/* 자기소개 */}
            <div className="py-3">
              <span className="text-gray-500 text-sm block mb-2">자기소개</span>
              {isEditing ? (
                <textarea
                  name="motivation"
                  value={formData.motivation}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="가입 동기나 소개를 입력해 주세요"
                />
              ) : (
                <p className="text-gray-700 text-sm bg-gray-50 rounded-lg p-3">
                  {user.motivation || '-'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-t border-gray-100" />

        {/* 계정 설정 */}
        <div className="px-5 py-4">
          <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">계정 설정</h2>

          {/* 비밀번호 변경 */}
          <div className="py-3 border-b border-gray-100">
            <button
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              className="flex justify-between items-center w-full text-left"
            >
              <span className="text-gray-900">비밀번호 변경</span>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${showPasswordChange ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showPasswordChange && (
              <div className="mt-4 space-y-3">
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="현재 비밀번호"
                />
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="새 비밀번호 (6자 이상)"
                />
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
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
          <div className="py-3">
            {pendingWithdrawal ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
                <span className="text-red-600">탈퇴 신청 대기중</span>
                <span className="text-red-500 ml-2">({pendingWithdrawal.createdAt})</span>
              </div>
            ) : (
              <Link
                to="/withdraw"
                className="flex justify-between items-center text-gray-500 hover:text-red-600 transition-colors"
              >
                <span>탈퇴 신청</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
