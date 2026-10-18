import { useProjectStore } from './projectStore';
import { useTaskStore } from './taskStore';
import { useDocumentStore } from './documentStore';
import { useNotificationStore } from './notificationStore';
import { useAIStore } from './aiStore';
import { useAnalyticsStore } from './analyticsStore';

export function resetAllStores() {
  useProjectStore.getState().reset?.();
  useTaskStore.getState().reset?.();
  useDocumentStore.getState().reset?.();
  useNotificationStore.getState().reset?.();
  useAIStore.getState().reset?.();
  useAnalyticsStore.getState().reset?.();
}
