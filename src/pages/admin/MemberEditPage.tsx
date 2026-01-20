import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMemberById, updateMember, deleteMember } from '../../lib/api';
import { Member, MemberStatus, MemberRole } from '../../lib/types';
import { STATUS_LABELS, ROLE_LABELS } from '../../lib/constants';
import Button from '../../components/common/Button';

export default function MemberEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [member, setMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    email: '',
    phone: '',
    birthDate: '',
    status: 'active' as MemberStatus,
    role: 'member' as MemberRole,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      navigate('/admin/members');
      return;
    }

    const memberData = getMemberById(id);
    if (!memberData) {
      navigate('/admin/members');
      return;
    }

    setMember(memberData);
    setFormData({
      name: memberData.name,
      nickname: memberData.nickname || '',
      email: memberData.email,
      phone: memberData.phone,
      birthDate: memberData.birthDate || '',
      status: memberData.status,
      role: memberData.role,
    });
    setIsLoading(false);
  }, [id, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!member) return;
    setError('');

    try {
      updateMember(member.id, {
        name: formData.name,
        nickname: formData.nickname || undefined,
        phone: formData.phone,
        birthDate: formData.birthDate || undefined,
        status: formData.status,
        role: formData.role,
      });
      navigate('/admin/members');
    } catch {
      setError('저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = () => {
    if (!member) return;

    if (
      confirm(
        `정말로 ${member.name}님을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`
      )
    ) {
      deleteMember(member.id);
      navigate('/admin/members');
    }
  };

  const handleWithdraw = () => {
    if (!member) return;

    if (confirm(`${member.name}님을 탈퇴 처리하시겠습니까?`)) {
      updateMember(member.id, { status: 'withdrawn' });
      navigate('/admin/members');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (!member) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">회원 정보 수정</h1>
          <Button variant="secondary" size="sm" onClick={() => navigate('/admin/members')}>
            목록으로
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm mb-4">{error}</div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                이름
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
                닉네임
              </label>
              <input
                type="text"
                id="nickname"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">이메일은 수정할 수 없습니다</p>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                연락처
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                생년월일
              </label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                상태
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {(Object.keys(STATUS_LABELS) as MemberStatus[]).map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                역할
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {(Object.keys(ROLE_LABELS) as MemberRole[]).map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 border-t space-y-2 text-sm text-gray-500">
            <p>가입일: {member.joinedAt}</p>
            <p>최근 수정: {member.updatedAt}</p>
          </div>

          <div className="flex justify-between pt-6 border-t">
            <div className="flex gap-2">
              <Button onClick={handleSave}>저장</Button>
              <Button variant="secondary" onClick={() => navigate('/admin/members')}>
                취소
              </Button>
            </div>

            <div className="flex gap-2">
              {member.status !== 'withdrawn' && (
                <Button variant="danger" onClick={handleWithdraw}>
                  탈퇴 처리
                </Button>
              )}
              <Button
                variant="danger"
                onClick={handleDelete}
                className="bg-red-800 hover:bg-red-900"
              >
                삭제
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
