import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Building2, Briefcase, Star, Archive, Trash2,
  Clock, Edit3, CheckCircle, Plus, Mail,
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import StatusBadge from '../components/shared/StatusBadge';
import NotesPanel from '../components/applications/NotesPanel';
import EmailRow from '../components/emails/EmailRow';
import Loader from '../components/shared/Loader';
import { formatFullDate, formatRelative } from '../utils/format';
import api from '../services/api';

const ALL_STATUSES = [
  'Applied', 'Under Review', 'Next Step', 'OA / Assessment',
  'Interview', 'Rejected', 'Offer', 'Follow-up Needed',
];

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ company: '', role: '' });
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/applications/${id}`);
      setData(res.data);
      setEditForm({ company: res.data.application.company, role: res.data.application.role });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [id]);

  const handleStatusChange = async (status) => {
    try {
      await api.patch(`/api/applications/${id}/status`, { status });
      fetch();
    } catch (err) { console.error(err); }
  };

  const handleStar = async () => {
    await api.patch(`/api/applications/${id}/star`);
    fetch();
  };

  const handleArchive = async () => {
    await api.patch(`/api/applications/${id}/archive`);
    navigate('/inbox');
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this application?')) return;
    await api.patch(`/api/applications/${id}/delete`);
    navigate('/inbox');
  };

  const handleSaveEdit = async () => {
    try {
      setSaving(true);
      await api.patch(`/api/applications/${id}`, editForm);
      setEditing(false);
      fetch();
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  if (loading) return <AppLayout><div className="flex justify-center pt-20"><Loader size="lg" /></div></AppLayout>;
  if (error) return <AppLayout><div className="p-8 text-red-600">{error}</div></AppLayout>;

  const { application, relatedEmails } = data;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-5">

            {/* Header card */}
            <div className="card p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center text-xl font-bold text-blue-700 flex-shrink-0">
                    {application.company?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    {editing ? (
                      <div className="space-y-2">
                        <input className="input-field text-lg font-bold" value={editForm.company} onChange={(e) => setEditForm({ ...editForm, company: e.target.value })} placeholder="Company" />
                        <input className="input-field" value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} placeholder="Role" />
                        <div className="flex gap-2">
                          <button onClick={handleSaveEdit} disabled={saving} className="btn-primary text-xs py-1.5">{saving ? 'Saving…' : 'Save'}</button>
                          <button onClick={() => setEditing(false)} className="btn-secondary text-xs py-1.5">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h1 className="text-xl font-bold text-gray-900">{application.company}</h1>
                        <p className="text-sm text-gray-500 mt-0.5">{application.role}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <StatusBadge status={application.status} />
                          <span className="text-xs text-gray-400">Updated {formatRelative(application.updatedAt)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => setEditing(true)} className="btn-ghost p-1.5" title="Edit">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button onClick={handleStar} className={`btn-ghost p-1.5 ${application.starred ? 'text-yellow-400' : ''}`} title="Star">
                    <Star className="h-4 w-4" fill={application.starred ? 'currentColor' : 'none'} />
                  </button>
                  <button onClick={handleArchive} className="btn-ghost p-1.5" title="Archive">
                    <Archive className="h-4 w-4" />
                  </button>
                  <button onClick={handleDelete} className="btn-ghost p-1.5 text-red-400 hover:text-red-600" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Status selector */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-500" /> Update Status
              </h3>
              <div className="flex flex-wrap gap-2">
                {ALL_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150
                      ${application.status === s
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Related emails */}
            {relatedEmails?.length > 0 && (
              <div className="card overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-700">Related Emails ({relatedEmails.length})</h3>
                </div>
                <div>
                  {relatedEmails.map((email) => (
                    <EmailRow
                      key={email._id}
                      email={email}
                      onClick={() => navigate(`/inbox?emailId=${email._id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="card p-5">
              <NotesPanel
                applicationId={application._id}
                notes={application.notes}
                onUpdate={fetch}
              />
            </div>
          </div>

          {/* Sidebar — Timeline */}
          <div className="space-y-5">
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" /> Timeline
              </h3>
              {application.timeline?.length ? (
                <div className="space-y-3">
                  {[...application.timeline].reverse().map((entry, i) => (
                    <div key={entry._id || i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0 mt-0.5" />
                        {i < application.timeline.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
                      </div>
                      <div className="pb-3 min-w-0">
                        <StatusBadge status={entry.status} size="xs" />
                        {entry.note && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{entry.note}</p>}
                        <p className="text-xs text-gray-400 mt-1">{formatFullDate(entry.changedAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No timeline events yet</p>
              )}
            </div>

            <div className="card p-5 text-xs text-gray-400 space-y-1.5">
              <p>Created: {formatFullDate(application.createdAt)}</p>
              <p>Updated: {formatFullDate(application.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
