import { useProjectStore } from './projectStore';
import { useTaskStore } from './taskStore';
import { useDocumentStore } from './documentStore';
import { useNotificationStore } from './notificationStore';
import { useAIStore } from './aiStore';
import { useAnalyticsStore } from './analyticsStore';
import { useAdminUserStore } from './adminUserStore';
import { useRoleStore } from './roleStore';

export function resetAllStores() {
  useProjectStore.getState().reset?.();
  useTaskStore.getState().reset?.();
  useDocumentStore.getState().reset?.();
  useNotificationStore.getState().reset?.();
  useAIStore.getState().reset?.();
  useAnalyticsStore.getState().reset?.();
  useAdminUserStore.getState().reset?.();
  useRoleStore.getState().reset?.();
}
