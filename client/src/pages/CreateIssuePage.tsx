import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { IssueForm } from '@/components/issues/IssueForm';

export default function CreateIssuePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Link
        to="/issues"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500
                   hover:text-black transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to issues
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black">Create issue</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Describe the issue clearly so it can be triaged and assigned quickly
        </p>
      </div>

      {/* Form */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
        <IssueForm />
      </div>
    </div>
  );
}
