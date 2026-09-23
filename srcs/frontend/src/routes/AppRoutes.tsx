import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';

import { AuthLayout } from '@/components/layout/AuthLayout';

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import UnauthorizedPage from '@/pages/auth/UnauthorizedPage';

// Protected Pages
import DashboardPage from '@/pages/dashboard/DashboardPage';
import ProjectsPage from '@/pages/projects/ProjectsPage';
import ProjectDetailsPage from '@/pages/projects/ProjectDetailsPage';
import TasksPage from '@/pages/tasks/TasksPage';
import ChatPage from '@/pages/chat/ChatPage';
import OrganizationListPage from '@/pages/organizations/OrganizationListPage';
import OrganizationDetailsPage from '@/pages/organizations/OrganizationDetailsPage';
import { NotificationsPage } from '@/pages/notifications/NotificationsPage';
import { DocumentsPage } from '@/pages/documents/DocumentsPage';
import AIAssistantPage from '@/pages/ai/AIAssistantPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes with AuthLayout */}
      <Route element={<AuthLayout />}>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Core feature routes */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/organizations" element={<OrganizationListPage />} />
          <Route path="/organizations/:id" element={<OrganizationDetailsPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/ai" element={<AIAssistantPage />} />
        </Route>
      </Route>

      {/* Fallback / 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
