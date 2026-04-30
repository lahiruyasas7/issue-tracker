import type {
  AuthResponse,
  LoginPayload,
  SignupPayload,
} from '../types/auth.types';
import { api } from './axios';

export const loginApi = async (data: LoginPayload): Promise<AuthResponse> => {
  const res = await api.post('/auth/login', data);
  return res.data;
};

export const signupApi = async (data: SignupPayload): Promise<AuthResponse> => {
  const res = await api.post('/auth/register', data);
  return res.data;
};

export const logout = async () => {
  await api.post('/auth/logout');
};

export const refreshToken = async () => {
  const { data } = await api.post('/auth/refresh');
  return data;
};
