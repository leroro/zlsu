import { createHashRouter } from 'react-router-dom';
import App from './App';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ApplyPage from './pages/ApplyPage';
import RulesPage from './pages/RulesPage';
import AboutPage from './pages/AboutPage';
import DevGuidePage from './pages/DevGuidePage';
import OperationsGuidePage from './pages/OperationsGuidePage';
import MyPage from './pages/MyPage';
import MembersPage from './pages/MembersPage';
import ChangeStatusPage from './pages/ChangeStatusPage';
import WithdrawPage from './pages/WithdrawPage';
import ReferrerApprovalPage from './pages/ReferrerApprovalPage';
import AdminHomePage from './pages/admin/AdminHomePage';
import RequestsPage from './pages/admin/RequestsPage';
import MembersManagePage from './pages/admin/MembersManagePage';
import MemberEditPage from './pages/admin/MemberEditPage';
import SettingsPage from './pages/admin/SettingsPage';
import ChecklistManagePage from './pages/admin/ChecklistManagePage';
import ProtectedRoute from './components/common/ProtectedRoute';
import NotFoundPage from './pages/NotFoundPage';
import SwimCapGuidePage from './pages/SwimCapGuidePage';

export const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
        // 비로그인 페이지
        { index: true, element: <HomePage /> },
        { path: 'login', element: <LoginPage /> },
        { path: 'about', element: <AboutPage /> },
        { path: 'apply', element: <ApplyPage /> },
        { path: 'rules', element: <RulesPage /> },
        { path: 'dev-guide', element: <DevGuidePage /> },

        // 로그인 필요 페이지
        {
          path: 'my',
          element: (
            <ProtectedRoute>
              <MyPage />
            </ProtectedRoute>
          ),
        },
        {
          path: 'members',
          element: (
            <ProtectedRoute>
              <MembersPage />
            </ProtectedRoute>
          ),
        },
        {
          path: 'operations',
          element: (
            <ProtectedRoute>
              <OperationsGuidePage />
            </ProtectedRoute>
          ),
        },
        {
          path: 'change-status',
          element: (
            <ProtectedRoute>
              <ChangeStatusPage />
            </ProtectedRoute>
          ),
        },
        {
          path: 'withdraw',
          element: (
            <ProtectedRoute>
              <WithdrawPage />
            </ProtectedRoute>
          ),
        },
        {
          path: 'referrer-approval/:id',
          element: (
            <ProtectedRoute>
              <ReferrerApprovalPage />
            </ProtectedRoute>
          ),
        },
        {
          path: 'request/swim-cap',
          element: (
            <ProtectedRoute>
              <SwimCapGuidePage />
            </ProtectedRoute>
          ),
        },

        // 관리자 페이지
        {
          path: 'admin',
          element: (
            <ProtectedRoute requireAdmin>
              <AdminHomePage />
            </ProtectedRoute>
          ),
        },
        {
          path: 'admin/requests',
          element: (
            <ProtectedRoute requireAdmin>
              <RequestsPage />
            </ProtectedRoute>
          ),
        },
        {
          path: 'admin/members',
          element: (
            <ProtectedRoute requireAdmin>
              <MembersManagePage />
            </ProtectedRoute>
          ),
        },
        {
          path: 'admin/members/:id',
          element: (
            <ProtectedRoute requireAdmin>
              <MemberEditPage />
            </ProtectedRoute>
          ),
        },
        {
          path: 'admin/settings',
          element: (
            <ProtectedRoute requireAdmin>
              <SettingsPage />
            </ProtectedRoute>
          ),
        },
        {
          path: 'admin/checklist',
          element: (
            <ProtectedRoute requireAdmin>
              <ChecklistManagePage />
            </ProtectedRoute>
          ),
        },

      ],
    },
    // 404 페이지 (헤더 없이 전체 화면)
    { path: '*', element: <NotFoundPage /> },
  ],
);
