import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChecklistItems, saveChecklistItems } from '../../lib/api';
import { ChecklistItem } from '../../lib/types';
import Button from '../../components/common/Button';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function ChecklistManagePage() {
  useDocumentTitle('체크리스트 관리');
  const navigate = useNavigate();

  // 원본 데이터와 수정 중인 데이터를 분리
  const [originalItems, setOriginalItems] = useState<ChecklistItem[]>([]);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ label: '', description: '', isActive: true });
  const [message, setMessage] = useState({ type: '', text: '' });

  // 초기 데이터 로드
  useEffect(() => {
    const loaded = getChecklistItems().sort((a, b) => a.order - b.order);
    setOriginalItems(loaded);
    setItems(loaded);
  }, []);

  // 변경 감지
  useEffect(() => {
    const changed = JSON.stringify(items) !== JSON.stringify(originalItems);
    setHasChanges(changed);
  }, [items, originalItems]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  // 새 항목 ID 생성
  const generateId = () => `checklist_${Date.now()}`;

  // 항목 추가 시작
  const handleStartAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({ label: '', description: '', isActive: true });
  };

  // 항목 수정 시작
  const handleStartEdit = (item: ChecklistItem) => {
    setEditingId(item.id);
    setIsAdding(false);
    setFormData({ label: item.label, description: item.description, isActive: item.isActive });
  };

  // 폼 저장 (로컬 상태에만 반영)
  const handleFormSave = () => {
    if (!formData.label.trim()) {
      showMessage('error', '제목을 입력해주세요.');
      return;
    }

    if (isAdding) {
      const newItem: ChecklistItem = {
        id: generateId(),
        label: formData.label.trim(),
        description: formData.description.trim(),
        isActive: formData.isActive,
        order: items.length,
      };
      setItems([...items, newItem]);
    } else if (editingId) {
      setItems(items.map(item =>
        item.id === editingId
          ? { ...item, label: formData.label.trim(), description: formData.description.trim(), isActive: formData.isActive }
          : item
      ));
    }

    setIsAdding(false);
    setEditingId(null);
    setFormData({ label: '', description: '', isActive: true });
  };

  // 폼 취소
  const handleFormCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ label: '', description: '', isActive: true });
  };

  // 항목 삭제 (로컬)
  const handleDelete = (id: string) => {
    if (confirm('이 항목을 삭제하시겠습니까?')) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  // 사용 토글 (로컬)
  const handleToggleActive = (id: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, isActive: !item.isActive } : item
    ));
  };

  // 순서 이동 (로컬)
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    setItems(newItems);
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    setItems(newItems);
  };

  // 전체 저장 (서버에 반영)
  const handleSaveAll = () => {
    // order 재정렬
    const orderedItems = items.map((item, index) => ({ ...item, order: index }));
    saveChecklistItems(orderedItems);
    setOriginalItems(orderedItems);
    setItems(orderedItems);
    showMessage('success', '변경사항이 저장되었습니다.');
  };

  // 변경 취소
  const handleDiscardChanges = () => {
    if (confirm('변경사항을 모두 취소하시겠습니까?')) {
      setItems([...originalItems]);
      setIsAdding(false);
      setEditingId(null);
      setFormData({ label: '', description: '', isActive: true });
    }
  };

  // 돌아가기 (변경사항 확인)
  const handleGoBack = () => {
    if (hasChanges) {
      if (confirm('저장하지 않은 변경사항이 있습니다. 정말 나가시겠습니까?')) {
        navigate('/admin/settings');
      }
    } else {
      navigate('/admin/settings');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white md:rounded-lg md:shadow p-4 md:p-6">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">가입 체크리스트 관리</h1>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleGoBack}>
              돌아가기
            </Button>
            <Button size="sm" onClick={handleStartAdd} disabled={isAdding || !!editingId}>
              추가
            </Button>
          </div>
        </div>

        {/* 메시지 */}
        {message.text && (
          <div className={`p-3 rounded-md text-sm mb-4 ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* 변경사항 알림 바 */}
        {hasChanges && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="text-sm text-yellow-800">저장하지 않은 변경사항이 있습니다.</span>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={handleDiscardChanges}>
                취소
              </Button>
              <Button size="sm" onClick={handleSaveAll}>
                저장
              </Button>
            </div>
          </div>
        )}

        <p className="text-sm text-gray-500 mb-6">
          가입 신청 시 확인해야 할 항목들을 관리합니다.
        </p>

        {/* 추가/수정 폼 */}
        {(isAdding || editingId) && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-4">
              {isAdding ? '새 항목 추가' : '항목 수정'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  제목
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="예: 매주 토요일 8시 정각 도착"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  보조 설명 (선택)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="예: 수영장 시계 기준"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary-600"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  사용
                </label>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleFormSave}>확인</Button>
                <Button size="sm" variant="secondary" onClick={handleFormCancel}>취소</Button>
              </div>
            </div>
          </div>
        )}

        {/* 항목 목록 */}
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`p-3 md:p-4 rounded-lg border ${
                item.isActive
                  ? 'bg-white border-gray-200'
                  : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              {/* 모바일: 세로 배치 / 데스크톱: 가로 배치 */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-gray-400 font-mono flex-shrink-0">{index + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`font-medium break-words ${item.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                          {item.label}
                        </span>
                        {!item.isActive && (
                          <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded flex-shrink-0">미사용</span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-500 mt-1 break-words">{item.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 컨트롤 버튼 - 모바일에서는 하단에 가로로 배치 */}
                <div className="flex items-center justify-end gap-1 flex-shrink-0 border-t md:border-t-0 pt-2 md:pt-0 mt-1 md:mt-0">
                  {/* 순서 이동 */}
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
                    title="위로"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === items.length - 1}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
                    title="아래로"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <div className="w-px h-6 bg-gray-200 mx-1" />

                  {/* 사용 토글 */}
                  <button
                    onClick={() => handleToggleActive(item.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      item.isActive ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                    title={item.isActive ? '미사용으로 변경' : '사용으로 변경'}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        item.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>

                  <div className="w-px h-6 bg-gray-200 mx-1" />

                  {/* 수정/삭제 */}
                  <button
                    onClick={() => handleStartEdit(item)}
                    disabled={isAdding || !!editingId}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded disabled:opacity-30"
                    title="수정"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded"
                    title="삭제"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            등록된 항목이 없습니다. 항목을 추가해주세요.
          </div>
        )}

        {/* 미리보기 안내 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-1">미리보기</h4>
          <p className="text-sm text-blue-700">
            '사용' 상태인 {items.filter(i => i.isActive).length}개 항목이 가입 신청 페이지에 표시됩니다.
          </p>
        </div>

        {/* 하단 저장 버튼 */}
        {hasChanges && (
          <div className="mt-6 pt-4 border-t flex justify-end gap-2">
            <Button variant="secondary" onClick={handleDiscardChanges}>
              변경 취소
            </Button>
            <Button onClick={handleSaveAll}>
              변경사항 저장
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
