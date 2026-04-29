import { useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';
import type { IssueFilters } from '@/types/issue.types';

export function useIssueFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: IssueFilters = {
    page: Number(searchParams.get('page')) || 1,
    limit: Number(searchParams.get('limit')) || 10,
    status: (searchParams.get('status') as IssueFilters['status']) || '',
    priority: (searchParams.get('priority') as IssueFilters['priority']) || '',
    search: searchParams.get('search') || '',
    sortBy:
      (searchParams.get('sortBy') as IssueFilters['sortBy']) || 'createdAt',
    sortOrder:
      (searchParams.get('sortOrder') as IssueFilters['sortOrder']) || 'desc',
    assignedToMe: searchParams.get('assignedToMe') === 'true',
  };

  const setFilters = useCallback(
    (updates: Partial<IssueFilters>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);

        // when any filter changes, reset to page 1
        if (!('page' in updates)) next.set('page', '1');

        Object.entries(updates).forEach(([key, value]) => {
          if (
            value === '' ||
            value === undefined ||
            value === null ||
            value === false
          ) {
            next.delete(key);
          } else {
            next.set(key, String(value));
          }
        });
        return next;
      });
    },
    [setSearchParams],
  );

  const resetFilters = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  return { filters, setFilters, resetFilters };
}
