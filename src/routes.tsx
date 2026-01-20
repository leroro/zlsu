import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ApplyPage from './pages/ApplyPage';
import RulesPage from './pages/RulesPage';
import MyPage from './pages/MyPage';
import MembersPage from './pages/MembersPage';
import ChangeStatusPage from './pages/ChangeStatusPage';
import AdminHomePage from './pages/admin/AdminHomePage';
import ApplicationsPage from './pages/admin/ApplicationsPage';
import MembersManagePage from './pages/admin/MembersManagePage';
import MemberEditPage from './pages/admin/MemberEditPage';
import ProtectedRoute from './components/common/ProtectedRoute';

const basename = import.meta.env.BASE_URL;

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <App />,
      children: [
        // 비로그인 페이지
        { index: true, element: <HomePage /> },
        { path: 'login', element: <LoginPage /> },
        { path: 'apply', element: <ApplyPage /> },
        { path: 'rules', element: <RulesPage /> },

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
          path: 'change-status',
          element: (
            <ProtectedRoute>
              <ChangeStatusPage />
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
          path: 'admin/applications',
          element: (
            <ProtectedRoute requireAdmin>
              <ApplicationsPage />
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
      ],
    },
  ],
  { basename }
);
