import {
  X, Star, Archive, Trash2, ExternalLink, Tag, Edit3,
  Building2, Briefcase, Clock, CheckCircle, ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../shared/StatusBadge';
import NotesPanel from '../applications/NotesPanel';
import { formatFullDate } from '../../utils/format';
import api from '../../services/api';

const ALL_STATUSES = [
  'Applied', 'Under Review', 'Next Step', 'OA / Assessment',
  'Interview', 'Rejected', 'Offer', 'Follow-up Needed',
];

export default function EmailDetail({ email, onClose, onUpdate }) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  if (!email) return null;

  const c = email.classification || {};

  const handleStatusChange = async (status) => {
    setStatusOpen(false);
    if (!email.applicationId) return;
    try {
      setSaving(true);
      await api.patch(`/api/applications/${email.applicationId._id || email.applicationId}/status`, { status });
      onUpdate?.();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleStar = async () => {
    try {
      await api.patch(`/api/emails/${email._id}/star`);
      onUpdate?.();
    } catch (err) { console.error(err); }
  };

  const handleArchive = async () => {
    try {
      await api.patch(`/api/emails/${email._id}/archive`);
      onUpdate?.();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async () => {
    try {
      await api.patch(`/api/emails/${email._id}/delete`);
      onClose?.();
      onUpdate?.();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200 animate-slide-in overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="btn-ghost p-1.5" title="Close">
            <X className="h-4 w-4" />
          </button>
          <button onClick={handleStar} className={`btn-ghost p-1.5 ${email.starred ? 'text-yellow-400' : ''}`} title="Star">
            <Star className="h-4 w-4" fill={email.starred ? 'currentColor' : 'none'} />
          </button>
          <button onClick={handleArchive} className="btn-ghost p-1.5" title="Archive">
            <Archive className="h-4 w-4" />
          </button>
          <button onClick={handleDelete} className="btn-ghost p-1.5 text-red-400 hover:text-red-600" title="Delete">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Status selector */}
        <div className="relative">
          <button
            onClick={() => setStatusOpen((v) => !v)}
            className="flex items-center gap-1.5 text-xs border border-gray-200 rounded-full px-3 py-1.5
                       hover:bg-gray-50 transition-colors"
          >
            <StatusBadge status={c.detectedCategory} size="xs" />
            <ChevronDown className="h-3 w-3 text-gray-400" />
          </button>
          {statusOpen && (
            <div className="absolute right-0 top-9 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50 animate-fade-in">
              {ALL_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-gray-50 transition-colors text-left"
                >
                  <StatusBadge status={s} size="xs" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Subject */}
      <div className="px-5 pt-4 pb-2">
        <h2 className="text-base font-semibold text-gray-900 leading-snug">{email.subject || '(no subject)'}</h2>
        <p className="text-xs text-gray-500 mt-1">{email.from} · {formatFullDate(email.receivedAt)}</p>
      </div>

      {/* Classification card */}
      {c.isJobRelated && (
        <div className="mx-4 my-2 p-3 bg-blue-50 rounded-xl border border-blue-100 space-y-2">
          <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide">Detected Info</p>
          <div className="grid grid-cols-2 gap-2">
            {c.extractedCompany && (
              <div className="flex items-center gap-1.5 text-xs text-gray-700">
                <Building2 className="h-3.5 w-3.5 text-blue-400" />
                <span className="font-medium">Company:</span> {c.extractedCompany}
              </div>
            )}
            {c.extractedRole && (
              <div className="flex items-center gap-1.5 text-xs text-gray-700">
                <Briefcase className="h-3.5 w-3.5 text-blue-400" />
                <span className="font-medium">Role:</span> {c.extractedRole}
              </div>
            )}
          </div>
          {c.matchedKeywords?.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {c.matchedKeywords.slice(0, 6).map((kw) => (
                <span key={kw} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{kw}</span>
              ))}
            </div>
          )}
          {c.confidenceScore > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${Math.round(c.confidenceScore * 100)}%` }}
                />
              </div>
              <span className="text-xs text-blue-600">{Math.round(c.confidenceScore * 100)}% confidence</span>
            </div>
          )}
        </div>
      )}

      {/* Body */}
      <div className="px-5 py-3 flex-1">
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
          {email.body || email.snippet || <span className="text-gray-400 italic">No content available</span>}
        </div>
      </div>

      {/* Notes */}
      {email.applicationId && (
        <div className="border-t border-gray-100 px-4 py-3">
          <NotesPanel
            applicationId={email.applicationId._id || email.applicationId}
            notes={email.applicationId?.notes || []}
            onUpdate={onUpdate}
          />
        </div>
      )}

      {/* View full application link */}
      {email.applicationId && (
        <div className="px-4 py-3 border-t border-gray-100">
          <button
            onClick={() => navigate(`/applications/${email.applicationId._id || email.applicationId}`)}
            className="btn-ghost text-xs text-blue-600"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View full application & timeline
          </button>
        </div>
      )}
    </div>
  );
}
