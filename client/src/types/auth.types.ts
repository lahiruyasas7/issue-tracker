export interface LoginPayload {
  email: '';
  password: '';
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export type SignupPayload = {
  name: string;
  email: string;
  password: string;
};

export interface AuthResponse {
  message: string;
  user: User;
}
