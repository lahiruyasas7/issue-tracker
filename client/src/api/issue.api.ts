import type { GetIssuesResponse, IssueFilters } from '@/types/issue.types';
import { api } from './axios';

export const issueService = {
  getAll: async (filters: IssueFilters): Promise<GetIssuesResponse> => {
    // strip empty strings and undefined — don't send ?status= to the API
    const params = Object.fromEntries(
      Object.entries(filters).filter(
        ([, v]) => v !== '' && v !== undefined && v !== null,
      ),
    );
    const { data } = await api.get('/issues', { params });
    return data;
  },

  getById: async (id: number) => {
    const { data } = await api.get(`/issues/${id}`);
    return data;
  },

  create: async (payload: unknown) => {
    const { data } = await api.post('/issues/create', payload);
    return data;
  },

  update: async (id: number, payload: unknown) => {
    const { data } = await api.patch(`/issues/update/${id}`, payload);
    return data;
  },

  updateStatus: async (id: number, payload: unknown) => {
    const { data } = await api.patch(`/issues/${id}/status`, payload);
    return data;
  },

  delete: async (id: number) => {
    await api.delete(`/issues/${id}`);
  },

  addComment: async (
    issueId: number,
    body: string,
  ): Promise<{ success: boolean; data: Comment }> => {
    const { data } = await api.post(`/issues/comments/${issueId}`, { body });
    return data;
  },

  deleteComment: async (commentId: number): Promise<void> => {
    await api.delete(`/issues/comments/${commentId}`);
  },
};
