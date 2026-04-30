import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { FormField } from '@/components/ui/FormField';
import { CharCounter } from '@/components/ui/CharCounter';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Loader2 } from 'lucide-react';
import { issueService } from '@/api/issue.api';
import {
  issueFormSchema,
  type IssueFormValues,
} from '@/validations-schema/issue.schema';
import { AssigneeSelect } from './AssigneeSelect';
// import { useUnsavedChanges } from '@/hooks/custom-hooks/useUnsavedChanges';

interface Props {
  issueId?: number; // if provided = edit mode, absent = create mode
}

export function IssueForm({ issueId }: Props) {
  const isEditMode = !!issueId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ----------------------------------------------------------------
  // Fetch existing issue in edit mode
  // ----------------------------------------------------------------
  const { data: existingIssue, isLoading: isFetchingIssue } = useQuery({
    queryKey: ['issue', issueId],
    queryFn: () => issueService.getById(issueId!),
    enabled: isEditMode,
  });

  // ----------------------------------------------------------------
  // Form setup
  // ----------------------------------------------------------------
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<IssueFormValues>({
    resolver: zodResolver(issueFormSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'MEDIUM',
      assignedToId: null,
    },
  });

  // Prefill form when existing issue loads in edit mode
  useEffect(() => {
    if (existingIssue?.data) {
      const issue = existingIssue.data;
      reset({
        title: issue.title,
        description: issue.description,
        priority: issue.priority,
        assignedToId: issue.assignedTo?.id ?? null,
      });
    }
  }, [existingIssue, reset]);

  // ----------------------------------------------------------------
  // Unsaved changes guard
  // ----------------------------------------------------------------
  //   const blocker = useUnsavedChanges(isDirty && !isSubmitting);

  // ----------------------------------------------------------------
  // Create mutation
  // ----------------------------------------------------------------
  const createMutation = useMutation({
    mutationFn: (values: IssueFormValues) => {
      const payload = {
        ...values,
      };
      return issueService.create(payload);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      navigate(`/issues/${res.data.id}`);
    },
  });

  // ----------------------------------------------------------------
  // Update mutation
  // ----------------------------------------------------------------
  const updateMutation = useMutation({
    mutationFn: (values: IssueFormValues) => {
      const payload = {
        ...values,
      };
      return issueService.update(issueId!, payload);
    },
    onSuccess: () => {
      // invalidate both list and this specific issue
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['issue', issueId] });
      navigate(`/issues/${issueId}`);
    },
  });

  const mutation = isEditMode ? updateMutation : createMutation;
  const serverError = mutation.error as any;

  // ----------------------------------------------------------------
  // Submit
  // ----------------------------------------------------------------
  const onSubmit = (values: IssueFormValues) => {
    mutation.mutate(values);
  };

  // ----------------------------------------------------------------
  // Watch values for char counters
  // ----------------------------------------------------------------
  const titleValue = watch('title') ?? '';
  const descriptionValue = watch('description') ?? '';

  // ----------------------------------------------------------------
  // Loading skeleton in edit mode
  // ----------------------------------------------------------------
  if (isEditMode && isFetchingIssue) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-36 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
        </div>
        <Skeleton className="h-11 w-32 ml-auto" />
      </div>
    );
  }

  // ----------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        {/* Server error banner */}
        {serverError && (
          <div className="flex items-start gap-3 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Something went wrong</p>
              <p className="text-red-600 mt-0.5">
                {serverError?.response?.data?.message ?? 'Please try again.'}
              </p>
              {/* Show field-level errors from backend if any */}
              {serverError?.response?.data?.errors?.length > 0 && (
                <ul className="mt-2 list-disc list-inside space-y-0.5">
                  {serverError.response.data.errors.map(
                    (e: { field: string; message: string }) => (
                      <li key={e.field} className="text-red-600 text-xs">
                        {e.field}: {e.message}
                      </li>
                    ),
                  )}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Title */}
        <FormField label="Title" required error={errors.title?.message}>
          <div className="relative">
            <Input
              {...register('title')}
              placeholder="Short, descriptive title of the issue"
              className="border-zinc-200 focus-visible:ring-black pr-16"
              aria-invalid={!!errors.title}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <CharCounter current={titleValue.length} max={150} />
            </div>
          </div>
        </FormField>

        {/* Description */}
        <FormField
          label="Description"
          required
          error={errors.description?.message}
          hint="Describe the issue in detail — steps to reproduce, expected vs actual behaviour"
        >
          <div className="relative">
            <Textarea
              {...register('description')}
              placeholder="What happened? How can it be reproduced? What was expected?"
              rows={6}
              className="border-zinc-200 focus-visible:ring-black resize-none"
              aria-invalid={!!errors.description}
            />
            <div className="absolute right-3 bottom-3">
              <CharCounter current={descriptionValue.length} max={5000} />
            </div>
          </div>
        </FormField>

        {/* Priority + Severity */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Priority" error={errors.priority?.message}>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="border-zinc-200 focus:ring-black">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      { value: 'CRITICAL', label: '🔴 Critical' },
                      { value: 'HIGH', label: '🟠 High' },
                      { value: 'MEDIUM', label: '🟡 Medium' },
                      { value: 'LOW', label: '⚪ Low' },
                    ].map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          {/* <FormField
            label="Severity"
            error={errors.severity?.message}
            hint="Optional — how bad is the impact?"
          >
            <Controller
              name="severity"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? 'NONE'}
                  onValueChange={(v) =>
                    field.onChange(v === 'NONE' ? undefined : v)
                  }
                >
                  <SelectTrigger className="border-zinc-200 focus:ring-black">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">
                      <span className="text-zinc-400">No severity</span>
                    </SelectItem>
                    <SelectItem value="CRITICAL">Critical — system unusable</SelectItem>
                    <SelectItem value="MAJOR">Major — major feature broken</SelectItem>
                    <SelectItem value="MINOR">Minor — minor inconvenience</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </FormField> */}
        </div>

        {/* Assignee */}
        <FormField
          label="Assignee"
          error={errors.assignedToId?.message}
          hint="Optional — assign this issue to a team member"
        >
          <Controller
            name="assignedToId"
            control={control}
            render={({ field }) => (
              <AssigneeSelect
                value={field.value}
                onChange={field.onChange}
                disabled={isSubmitting}
              />
            )}
          />
        </FormField>

        {/* Form actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-100">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              navigate(isEditMode ? `/issues/${issueId}` : '/issues')
            }
            disabled={isSubmitting}
            className="border-zinc-200 hover:bg-zinc-50 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || (!isDirty && isEditMode)}
            className="bg-black text-white hover:bg-zinc-800 min-w-[120px] cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {isEditMode ? 'Saving...' : 'Creating...'}
              </span>
            ) : isEditMode ? (
              'Save changes'
            ) : (
              'Create issue'
            )}
          </Button>
        </div>
      </form>

      {/* Unsaved changes dialog */}
      {/* <UnsavedChangesDialog
        open={blocker.state === 'blocked'}
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      /> */}
    </>
  );
}
