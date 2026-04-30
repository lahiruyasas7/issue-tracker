import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import type { IssueFilters } from '@/types/issue.types';

interface Props {
  filters: IssueFilters;
  searchInput: string;
  onSearch: (val: string) => void;
  onFilter: (updates: Partial<IssueFilters>) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export function IssueFiltersBar({
  filters,
  searchInput,
  onSearch,
  onFilter,
  onReset,
  hasActiveFilters,
}: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <Input
          placeholder="Search issues..."
          value={searchInput}
          onChange={(e) => onSearch(e.target.value)}
          className="pl-9 border-zinc-200 focus-visible:ring-black"
        />
        {searchInput && (
          <button
            onClick={() => onSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Priority filter */}
      <Select
        value={filters.priority || 'ALL'}
        onValueChange={(v) =>
          onFilter({
            priority: v === 'ALL' ? '' : (v as IssueFilters['priority']),
          })
        }
      >
        <SelectTrigger className="w-[140px] border-zinc-200 focus:ring-black cursor-pointer">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All priorities</SelectItem>
          <SelectItem value="CRITICAL">Critical</SelectItem>
          <SelectItem value="HIGH">High</SelectItem>
          <SelectItem value="MEDIUM">Medium</SelectItem>
          <SelectItem value="LOW">Low</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort */}
      <Select
        value={`${filters.sortBy}-${filters.sortOrder}`}
        onValueChange={(v) => {
          const [sortBy, sortOrder] = v.split('-');
          onFilter({
            sortBy: sortBy as IssueFilters['sortBy'],
            sortOrder: sortOrder as IssueFilters['sortOrder'],
          });
        }}
      >
        <SelectTrigger className="w-[160px] border-zinc-200 focus:ring-black cursor-pointer">
          <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5 text-zinc-400" />
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt-desc">Newest first</SelectItem>
          <SelectItem value="createdAt-asc">Oldest first</SelectItem>
          <SelectItem value="updatedAt-desc">Recently updated</SelectItem>
          <SelectItem value="priority-desc">Priority: high → low</SelectItem>
          <SelectItem value="priority-asc">Priority: low → high</SelectItem>
        </SelectContent>
      </Select>

      {/* Assigned to me toggle */}
      <Button
        variant={filters.assignedToMe ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilter({ assignedToMe: !filters.assignedToMe })}
        className={
          filters.assignedToMe
            ? 'bg-black text-white hover:bg-zinc-800 cursor-pointer'
            : 'border-zinc-200 hover:bg-zinc-50 cursor-pointer'
        }
      >
        Assigned to me
      </Button>

      {/* Reset */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-zinc-500 hover:text-black gap-1.5 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          Clear filters
        </Button>
      )}
    </div>
  );
}
