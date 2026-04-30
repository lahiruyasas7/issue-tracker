import { Button } from '@/components/ui/button';
import type { Pagination } from '@/types/issue.types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  pagination: Pagination;
  onPageChange: (page: number) => void;
}

export function Pagination({ pagination, onPageChange }: Props) {
  const { page, totalPages, total, limit, hasNextPage, hasPrevPage } =
    pagination;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  // build visible page numbers — always show first, last, and window around current
  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    const window = 1; // pages on each side of current

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - window && i <= page + window)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <p className="text-sm text-zinc-500">
        Showing{' '}
        <span className="font-medium text-black">
          {from}–{to}
        </span>{' '}
        of <span className="font-medium text-black">{total}</span> issues
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage}
          className="border-zinc-200 hover:bg-zinc-50 disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {getPageNumbers().map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-zinc-400 text-sm">
              ...
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(p)}
              className={
                p === page
                  ? 'bg-black text-white hover:bg-zinc-800 min-w-[36px]'
                  : 'border-zinc-200 hover:bg-zinc-50 min-w-[36px]'
              }
            >
              {p}
            </Button>
          ),
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="border-zinc-200 hover:bg-zinc-50 disabled:opacity-40"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
