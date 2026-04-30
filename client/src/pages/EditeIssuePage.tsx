import { useParams, Link, Navigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { IssueForm } from '@/components/issues/IssueForm';

export default function EditIssuePage() {
  const { id } = useParams<{ id: string }>();
  const issueId = Number(id);

  // guard against non-numeric IDs in the URL
  if (!id || isNaN(issueId)) {
    return <Navigate to="/issues" replace />;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Link
        to={`/issues/${issueId}`}
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500
                   hover:text-black transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to issue
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black">Edit issue</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Update the issue details below
        </p>
      </div>

      {/* Form — same component, edit mode via issueId prop */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
        <IssueForm issueId={issueId} />
      </div>
    </div>
  );
}
