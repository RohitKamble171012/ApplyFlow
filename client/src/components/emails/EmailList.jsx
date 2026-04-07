import EmailRow from './EmailRow';
import Loader from '../shared/Loader';
import EmptyState from '../shared/EmptyState';
import { Inbox, Mail } from 'lucide-react';

export default function EmailList({ emails, loading, selectedId, onSelect, onStar, onArchive, onDelete, emptyTitle, emptyDescription }) {
  if (loading) {
    return (
      <div className="flex flex-col">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <div className="skeleton h-4 w-4 rounded" />
            <div className="skeleton h-4 w-28 rounded" />
            <div className="skeleton h-4 flex-1 rounded" />
            <div className="skeleton h-5 w-20 rounded-full" />
            <div className="skeleton h-4 w-12 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!emails?.length) {
    return (
      <EmptyState
        icon={Mail}
        title={emptyTitle || 'No emails'}
        description={emptyDescription || 'No job-related emails found. Try syncing your Gmail inbox.'}
      />
    );
  }

  return (
    <div className="flex flex-col animate-fade-in">
      {emails.map((email) => (
        <EmailRow
          key={email._id}
          email={email}
          selected={selectedId === email._id}
          onClick={() => onSelect?.(email)}
          onStar={() => onStar?.(email._id)}
          onArchive={() => onArchive?.(email._id)}
          onDelete={() => onDelete?.(email._id)}
        />
      ))}
    </div>
  );
}
