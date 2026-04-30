import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../store/auth.store';
import { logout as logoutApi } from '../../api/auth.api';

/**
 * Hook to handle user logout
 * - Calls the logout API to clear server-side session
 * - Clears user data from zustand store
 * - Handles errors gracefully
 */
export const useLogout = () => {
  const clearUser = useAuthStore((s) => s.clearUser);

  return useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      // Clear user data from store on successful logout
      clearUser();
    },
    onError: (error) => {
      // Log error for debugging
      console.error('Logout failed:', error);
      // Still clear user on error for security purposes
      // The server session is already terminated, so we should clear local state
      clearUser();
    },
  });
};
