import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { IssueFilters } from '@/types/issue.types';
import {
  Download,
  FileText,
  FileJson,
  Loader2,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';
import { issueService } from '@/api/issue.api';

interface Props {
  filters: IssueFilters;
  totalCount: number | undefined;
}

export function ExportButton({ filters, totalCount }: Props) {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    format: 'csv' | 'json' | null;
  }>({ open: false, format: null });

  const [exportError, setExportError] = useState<string | null>(null);

  const exportMutation = useMutation({
    mutationFn: ({ format }: { format: 'csv' | 'json' }) =>
      issueService.exportIssues(filters, format),
    onSuccess: () => {
      setConfirmDialog({ open: false, format: null });
      setExportError(null);
    },
    onError: () => {
      setConfirmDialog({ open: false, format: null });
      setExportError('Export failed. Please try again.');
    },
  });

  const handleFormatSelect = (format: 'csv' | 'json') => {
    setExportError(null);
    setConfirmDialog({ open: true, format });
  };

  const handleConfirm = () => {
    if (confirmDialog.format) {
      exportMutation.mutate({ format: confirmDialog.format });
    }
  };

  // active filters summary for the confirmation dialog
  const activeFilters = [
    filters.status && `Status: ${filters.status}`,
    filters.priority && `Priority: ${filters.priority}`,
    filters.search && `Search: "${filters.search}"`,
    filters.assignedToMe && 'Assigned to me',
  ].filter(Boolean);

  return (
    <>
      <div className="flex flex-col items-end gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={exportMutation.isPending || totalCount === 0}
              className="border-zinc-200 hover:bg-zinc-50 gap-1.5"
            >
              {exportMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel className="text-xs text-zinc-400">
              {totalCount !== undefined
                ? `${totalCount} issue${totalCount !== 1 ? 's' : ''} will be exported`
                : 'Export issues'}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => handleFormatSelect('csv')}
              className="gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-green-600" />
              Export as CSV
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => handleFormatSelect('json')}
              className="gap-2 cursor-pointer"
            >
              <FileJson className="w-4 h-4 text-blue-600" />
              Export as JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Inline error below button */}
        {exportError && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {exportError}
          </p>
        )}
      </div>

      {/* Confirmation dialog */}
      <AlertDialog open={confirmDialog.open}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export issues as {confirmDialog.format?.toUpperCase()}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  {totalCount !== undefined && (
                    <>
                      <span className="font-medium text-black">
                        {totalCount} issue{totalCount !== 1 ? 's' : ''}
                      </span>{' '}
                      will be exported.
                    </>
                  )}
                </p>

                {/* Show active filters so user knows what they're exporting */}
                {activeFilters.length > 0 ? (
                  <div
                    className="rounded-lg border border-zinc-200
                                  bg-zinc-50 p-3 space-y-1"
                  >
                    <p className="text-xs font-medium text-zinc-500">
                      Active filters applied to export:
                    </p>
                    {activeFilters.map((f, i) => (
                      <p key={i} className="text-xs text-zinc-700">
                        • {f}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">
                    No filters applied — all issues will be exported.
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setConfirmDialog({ open: false, format: null })}
              disabled={exportMutation.isPending}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={exportMutation.isPending}
              className="bg-black text-white hover:bg-zinc-800 min-w-[120px]"
            >
              {exportMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Exporting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download {confirmDialog.format?.toUpperCase()}
                </span>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
