import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import apiClient from '@/services/api/client';

export function useAuth() {
  const authState = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      // Read directly from the store state to avoid dependency loops in useEffect
      const { token, refreshToken, isAuthenticated, login } = useAuthStore.getState();
      
      // If the app boots up and Zustand persist has loaded a token
      if (token && isAuthenticated) {
        try {
          // Fetch the freshest profile data
          const response = await apiClient.get('/api/auth/me/');
          
          if (mounted) {
            // Update the store with the fresh user data and preserve tokens
            login(response.data, token, refreshToken);
          }
        } catch (error) {
          // If this fails (e.g. 401 Unauthorized), the interceptor in apiClient.ts
          // automatically calls useAuthStore.getState().logout()
          console.error("Failed to rehydrate user session", error);
        }
      }
      
      if (mounted) {
        setIsInitializing(false);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array ensures this only runs once on app load

  return { 
    ...authState,
    isInitializing 
  };
}
