import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSettings, updateSettings } from '../../lib/api';
import Button from '../../components/common/Button';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function SettingsPage() {
  useDocumentTitle('시스템 설정');
  const navigate = useNavigate();

  // 원본 설정 (저장된 값)
  const [savedSettings, setSavedSettings] = useState(getSettings);
  // 편집 중인 설정 (로컬 state)
  const [editSettings, setEditSettings] = useState(getSettings);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 변경사항 있는지 확인
  const hasChanges = useMemo(() => {
    return (
      savedSettings.maxCapacity !== editSettings.maxCapacity ||
      savedSettings.includeInactiveInCapacity !== editSettings.includeInactiveInCapacity ||
      savedSettings.dormancyPeriodWeeks !== editSettings.dormancyPeriodWeeks
    );
  }, [savedSettings, editSettings]);

  const handleCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= 100) {
      setEditSettings(prev => ({ ...prev, maxCapacity: value }));
    }
  };

  const handleToggleCapacityMode = () => {
    setEditSettings(prev => ({
      ...prev,
      includeInactiveInCapacity: !prev.includeInactiveInCapacity
    }));
  };

  const handleDormancyPeriodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= 12) {
      setEditSettings(prev => ({ ...prev, dormancyPeriodWeeks: value }));
    }
  };

  const handleSave = () => {
    const newSettings = updateSettings(editSettings);
    setSavedSettings(newSettings);
    setMessage({ type: 'success', text: '설정이 저장되었습니다.' });
    setTimeout(() => setMessage({ type: '', text: '' }), 2000);
  };

  const handleCancel = () => {
    setEditSettings(savedSettings);
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white md:rounded-lg md:shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">시스템 설정</h1>
          <Button variant="secondary" size="sm" onClick={() => navigate('/admin')}>
            돌아가기
          </Button>
        </div>

        <div className="divide-y divide-gray-200">
          {/* 정원 설정 */}
          <section className="pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">정원 설정</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="maxCapacity" className="block text-sm font-medium text-gray-700 mb-2">
                  최대 정원
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    id="maxCapacity"
                    value={editSettings.maxCapacity}
                    onChange={handleCapacityChange}
                    min="1"
                    max="100"
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-gray-600">명</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  회칙에 따라 정원을 조정할 수 있습니다.
                </p>
              </div>
            </div>
          </section>

          {/* 정원 계산 기준 */}
          <section className="py-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">정원 계산 기준</h2>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">휴면 회원 정원 포함</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {editSettings.includeInactiveInCapacity
                      ? '휴면 회원도 정원에 포함됩니다 (활성 + 휴면)'
                      : '활성 회원만 정원에 포함됩니다'}
                  </p>
                </div>
                <button
                  onClick={handleToggleCapacityMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    editSettings.includeInactiveInCapacity ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      editSettings.includeInactiveInCapacity ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex gap-6 text-sm">
                  <div className={!editSettings.includeInactiveInCapacity ? 'font-semibold text-primary-600' : 'text-gray-500'}>
                    활성 회원만
                  </div>
                  <div className={editSettings.includeInactiveInCapacity ? 'font-semibold text-primary-600' : 'text-gray-500'}>
                    활성 + 휴면
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">가입 신청 기준</h4>
              <p className="text-sm text-blue-700">
                {editSettings.includeInactiveInCapacity
                  ? '휴면 회원도 자리를 차지하므로, 휴면 회원이 있어도 신규 가입이 제한될 수 있습니다.'
                  : '활성 회원만 정원에 포함되므로, 휴면 회원이 있어도 신규 가입이 가능합니다.'}
              </p>
            </div>
          </section>

          {/* 휴면 설정 */}
          <section className="py-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">휴면 설정</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="dormancyPeriod" className="block text-sm font-medium text-gray-700 mb-2">
                  휴면 신청 기준 기간
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    id="dormancyPeriod"
                    value={editSettings.dormancyPeriodWeeks}
                    onChange={handleDormancyPeriodChange}
                    min="1"
                    max="12"
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-gray-600">주 이상 불참 시</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  이 기간 이상 모임에 참석하지 못할 회원에게 휴면 신청을 안내합니다.
                </p>
              </div>
            </div>
          </section>

          {/* 가입 체크리스트 관리 */}
          <section className="pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">가입 체크리스트</h2>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">가입 시 확인 항목 관리</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    가입 신청 시 확인해야 할 항목들을 추가, 수정, 삭제할 수 있습니다.
                  </p>
                </div>
                <Button size="sm" onClick={() => navigate('/admin/checklist')}>
                  관리하기
                </Button>
              </div>
            </div>
          </section>
        </div>

        {/* 저장/취소 버튼 */}
        {(hasChanges || message.text) && (
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
            {/* 상태 메시지 */}
            {message.text ? (
              <div className={`p-3 rounded-md text-sm text-center ${
                message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {message.text}
              </div>
            ) : (
              <p className="text-sm text-amber-600 font-medium text-center">
                ⚠️ 저장하지 않은 변경사항이 있습니다
              </p>
            )}

            {/* 버튼 */}
            {hasChanges && (
              <div className="flex gap-2 justify-end">
                <Button variant="secondary" size="sm" onClick={handleCancel}>
                  취소
                </Button>
                <Button size="sm" onClick={handleSave}>
                  저장
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
