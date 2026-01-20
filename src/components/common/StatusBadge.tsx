import { MemberStatus, ApplicationStatus, StateChangeStatus } from '../../lib/types';
import {
  STATUS_LABELS,
  STATUS_COLORS,
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
  STATE_CHANGE_STATUS_LABELS,
} from '../../lib/constants';

interface MemberStatusBadgeProps {
  status: MemberStatus;
}

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
}

interface StateChangeStatusBadgeProps {
  status: StateChangeStatus;
}

export function MemberStatusBadge({ status }: MemberStatusBadgeProps) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function ApplicationStatusBadge({ status }: ApplicationStatusBadgeProps) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${APPLICATION_STATUS_COLORS[status]}`}>
      {APPLICATION_STATUS_LABELS[status]}
    </span>
  );
}

export function StateChangeStatusBadge({ status }: StateChangeStatusBadgeProps) {
  const colors: Record<StateChangeStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
      {STATE_CHANGE_STATUS_LABELS[status]}
    </span>
  );
}
