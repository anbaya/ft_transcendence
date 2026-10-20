import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';

import { AuthLayout } from '@/components/layout/AuthLayout';

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';

// Protected Pages
import DashboardPage from '@/pages/dashboard/DashboardPage';
import ProjectsPage from '@/pages/projects/ProjectsPage';
import ProjectDetailsPage from '@/pages/projects/ProjectDetailsPage';
import TasksPage from '@/pages/tasks/TasksPage';
import ChatPage from '@/pages/chat/ChatPage';
import { NotificationsPage } from '@/pages/notifications/NotificationsPage';
import { DocumentsPage } from '@/pages/documents/DocumentsPage';
import AIAssistantPage from '@/pages/ai/AIAssistantPage';
import AnalyticsPage from '@/pages/analytics/AnalyticsPage';
import ProfilePage from '@/pages/profile/ProfilePage';

import PrivacyPolicyPage from '@/pages/legal/PrivacyPolicyPage';
import TermsOfServicePage from '@/pages/legal/TermsOfServicePage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Legal Pages (Accessible to everyone) */}
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsOfServicePage />} />
      <Route path="/privacy-policy" element={<Navigate to="/privacy" replace />} />
      <Route path="/terms-of-service" element={<Navigate to="/terms" replace />} />

      {/* Public Routes with AuthLayout */}
      <Route element={<AuthLayout />}>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Core feature routes */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/ai" element={<AIAssistantPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          

        </Route>
      </Route>

      {/* Fallback / 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
