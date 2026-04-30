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
    const { data } = await api.patch(`/issues/update/${id}/status`, payload);
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

  exportIssues: async (
    filters: Partial<IssueFilters>,
    format: 'csv' | 'json',
  ): Promise<void> => {
    // strip empty values — same as getAll
    const params = Object.fromEntries(
      Object.entries({ ...filters, format }).filter(
        ([, v]) => v !== '' && v !== undefined && v !== null && v !== false,
      ),
    );

    // use fetch directly — axios doesn't handle blob downloads as cleanly
    const query = new URLSearchParams(
      params as Record<string, string>,
    ).toString();

    const response = await fetch(
      `${import.meta.env.VITE_APP_API_URL}issues/export?${query}`,
      { credentials: 'include' }, // sends httpOnly cookies
    );

    if (!response.ok) {
      throw new Error('Export failed');
    }

    // extract filename from Content-Disposition header
    const disposition = response.headers.get('Content-Disposition') ?? '';
    const filenameMatch = disposition.match(/filename="(.+)"/);
    const filename = filenameMatch?.[1] ?? `issues-export.${format}`;

    // trigger browser download
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};
