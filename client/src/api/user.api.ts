import { api } from './axios';

export interface UserOption {
  id: number;
  name: string;
  email: string;
}

export const userService = {
  getAll: async (): Promise<{ success: boolean; data: UserOption[] }> => {
    const { data } = await api.get('/users');
    return data;
  },
};
