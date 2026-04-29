import { useState } from "react";
import { useLogin } from "../hooks/auth/useLogin";
import { useForm } from "react-hook-form";
import { useRegister } from "../hooks/auth/useRegister";

import { Input } from "@/components/ui/input";
//import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, signupSchema, type LoginFormValues, type SignupFormValues } from "@/validations-schema/auth.schema";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const form = useForm<LoginFormValues | SignupFormValues>({
    resolver: zodResolver(isLogin ? loginSchema : signupSchema),
    shouldUnregister: true,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit = (data: any) => {
    if (isLogin) {
      loginMutation.mutate(data);
    } else {
      const { confirmPassword, ...payload } = data;
      registerMutation.mutate(payload);
    }
  };

  const loading = loginMutation.isPending || registerMutation.isPending;
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="flex items-center gap-2 p-4 rounded-lg justify-center mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-black text-white font-bold">
              IO
            </div>
            <span className="text-lg font-semibold">Issue Tracker</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-gray-600">
            {isLogin
              ? "Sign in to access your account"
              : "Join us to start shopping"}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    {...register("full_name")}
                    placeholder="John Doe"
                    className="pl-10"
                  />
                </div>
                <p className="text-red-500 text-sm mt-1">
                  {(errors as any)?.full_name?.message}
                </p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                />
              </div>
              <p className="text-red-500 text-sm mt-1">
                {errors?.email?.message}
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              <p className="text-red-500 text-sm mt-1">
                {errors?.password?.message}
              </p>
            </div>

            {/* Confirm Password */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    {...register("confirmPassword")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10"
                  />
                </div>
                <p className="text-red-500 text-sm mt-1">
                  {(errors as any)?.confirmPassword?.message}
                </p>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  {isLogin ? "Signing in..." : "Creating account..."}
                </>
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </form>
          {/* Toggle between Login/Signup */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-black font-medium cursor-pointer"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
