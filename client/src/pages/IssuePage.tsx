import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { useIssueFilters } from '@/hooks/custom-hooks/useIssueFilter';
import { useDebounce } from '@/hooks/custom-hooks/useDebounce';
import { issueService } from '@/api/issue.api';
import { StatusCountCards } from '@/components/issues/StatusCountCard';
import { IssueFiltersBar } from '@/components/issues/IssueFilterBar';
import { IssueTable } from '@/components/issues/IssuesTable';
import { Pagination } from '@/components/ui/Pagination';
import { ExportButton } from '@/components/issues/ExportButton';

export default function IssuesPage() {
  const { filters, setFilters, resetFilters } = useIssueFilters();

  // local state for the search input — debounced before hitting the API
  const [searchInput, setSearchInput] = useState(filters.search ?? '');
  const debouncedSearch = useDebounce(searchInput, 400);

  // sync debounced search into URL filters
  useEffect(() => {
    setFilters({ search: debouncedSearch });
  }, [debouncedSearch]);

  // keep local search input in sync if user navigates back
  useEffect(() => {
    setSearchInput(filters.search ?? '');
  }, []);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['issues', filters],
    queryFn: () => issueService.getAll(filters),
    placeholderData: (prev) => prev, // keeps old data visible while fetching new page
  });

  const hasActiveFilters = !!(
    filters.status ||
    filters.priority ||
    filters.search ||
    filters.assignedToMe ||
    filters.sortBy !== 'createdAt' ||
    filters.sortOrder !== 'desc'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Issues</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Track, manage and resolve your team's issues
          </p>
        </div>
        {/* <Link to="/issues/new">
          <Button className="bg-black text-white hover:bg-zinc-800 gap-2">
            <Plus className="w-4 h-4" />
            New issue
          </Button>
        </Link> */}
        <ExportButton filters={filters} totalCount={data?.pagination.total} />
      </div>

      {/* Status count cards — clickable filters */}
      <StatusCountCards
        counts={data?.statusCounts}
        isLoading={isLoading}
        activeStatus={filters.status ?? ''}
        onFilter={(status) => setFilters({ status: status as any })}
      />

      {/* Filters bar */}
      <IssueFiltersBar
        filters={filters}
        searchInput={searchInput}
        onSearch={setSearchInput}
        onFilter={setFilters}
        onReset={() => {
          resetFilters();
          setSearchInput('');
        }}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Subtle fetching indicator — doesn't replace content with spinner */}
      {isFetching && !isLoading && (
        <div className="h-0.5 w-full bg-zinc-100 rounded overflow-hidden">
          <div className="h-full bg-black animate-pulse rounded" />
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Failed to load issues. Please try again.
        </div>
      )}

      {/* Issue table */}
      {!isError && (
        <IssueTable issues={data?.data ?? []} isLoading={isLoading} />
      )}

      {/* Pagination */}
      {data?.pagination && (
        <Pagination
          pagination={data.pagination}
          onPageChange={(page) => setFilters({ page })}
        />
      )}
    </div>
  );
}
