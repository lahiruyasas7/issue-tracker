import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../../store/auth.store";
import { loginApi } from "../../api/auth.api";
import { useNavigate } from "react-router-dom";

export const useLogin = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);

  const navigate = useNavigate();

  return useMutation({
    mutationFn: loginApi,
    onSuccess: (res) => {
      setUser(res.user);
      navigate("/products");
    },
    onError: (error: any) => {
      console.error("Login failed:", error);
      clearUser?.();
    },
  });
};
