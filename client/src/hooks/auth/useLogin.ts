import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../store/auth.store';
import { loginApi } from '../../api/auth.api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useLogin = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);

  const navigate = useNavigate();

  return useMutation({
    mutationFn: loginApi,
    onSuccess: (res) => {
      setUser(res.user);
      toast.success('Welcome back!', {
        description: 'You have successfully signed in.',
      });
      navigate('/issues');
    },
    onError: (error: any) => {
      console.error('Login failed:', error);
      clearUser?.();
      toast.error('Sign in failed', {
        description:
          error?.response?.data?.message ?? 'Invalid email or password.',
      });
    },
  });
};
