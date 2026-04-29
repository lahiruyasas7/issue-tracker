import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../../store/auth.store";
import { signupApi } from "../../api/auth.api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useRegister = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);

  const navigate = useNavigate();

  return useMutation({
    mutationFn: signupApi,
    onSuccess: (res) => {
      setUser(res.user);
      toast.success("Account created!", {
        description: "Welcome! Your account is ready.",
      });
      navigate("/products");
    },
    onError: (error: any) => {
      // Handle error: show toast, log, etc.
      console.error("Register failed:", error);
      clearUser?.();
      toast.error("Registration failed", {
        description:
          error?.response?.data?.message ??
          "Something went wrong. Please try again.",
      });
    },
  });
};
