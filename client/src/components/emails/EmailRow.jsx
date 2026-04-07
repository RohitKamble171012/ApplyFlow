import { Star, Archive, Trash2 } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import { formatDate } from '../../utils/format';

export default function EmailRow({ email, selected, onClick, onStar, onArchive, onDelete }) {
  const classification = email.classification || {};
  const company = classification.extractedCompany || email.fromName || email.from || '—';
  const isUnread = !email.archived;

  return (
    <div
      className={`email-row group ${selected ? 'selected' : ''} ${isUnread ? 'unread' : ''}`}
      onClick={onClick}
    >
      {/* Star */}
      <button
        className={`flex-shrink-0 p-1 rounded hover:bg-yellow-50 transition-colors
          ${email.starred ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}
        onClick={(e) => { e.stopPropagation(); onStar?.(); }}
        title="Star"
      >
        <Star className="h-4 w-4" fill={email.starred ? 'currentColor' : 'none'} />
      </button>

      {/* Company / Sender */}
      <span className="w-36 flex-shrink-0 text-sm font-medium text-gray-800 truncate">
        {company}
      </span>

      {/* Subject + Snippet */}
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <span className="text-sm text-gray-800 truncate font-medium">{email.subject || '(no subject)'}</span>
        <span className="text-sm text-gray-400 truncate hidden sm:inline">
          — {email.snippet}
        </span>
      </div>

      {/* Status badge */}
      <div className="flex-shrink-0 hidden md:block">
        <StatusBadge status={classification.detectedCategory} />
      </div>

      {/* Role */}
      {classification.extractedRole && (
        <span className="hidden lg:block flex-shrink-0 text-xs text-gray-400 truncate max-w-[120px]">
          {classification.extractedRole}
        </span>
      )}

      {/* Actions (show on hover) */}
      <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors"
          onClick={(e) => { e.stopPropagation(); onArchive?.(); }}
          title="Archive"
        >
          <Archive className="h-3.5 w-3.5" />
        </button>
        <button
          className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
          onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Date */}
      <span className="flex-shrink-0 text-xs text-gray-400 ml-2 w-16 text-right">
        {formatDate(email.receivedAt)}
      </span>
    </div>
  );
}