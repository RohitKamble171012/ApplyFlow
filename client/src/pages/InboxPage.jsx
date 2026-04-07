import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Filter, SortDesc, ChevronLeft, ChevronRight, X } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import EmailList from '../components/emails/EmailList';
import EmailDetail from '../components/emails/EmailDetail';
import { useEmails } from '../hooks/useEmails';
import { useDebounce } from '../hooks/useDebounce';
import api from '../services/api';

const STATUS_FILTERS = [
  'Applied', 'Under Review', 'Next Step', 'OA / Assessment',
  'Interview', 'Rejected', 'Offer', 'Follow-up Needed',
];

export default function InboxPage() {
  const { filter } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 350);

  // Determine query params from URL filter
  const emailParams = useMemo(() => {
    const params = { page, limit: 50 };

    if (filter === 'starred') { params.starred = 'true'; }
    else if (filter === 'trash') { params.deleted = 'true'; }
    else if (filter === 'applications') { /* all job-related, no filter */ }
    else if (filter && STATUS_FILTERS.includes(decodeURIComponent(filter))) {
      params.status = decodeURIComponent(filter);
    }

    if (debouncedSearch) params.search = debouncedSearch;

    return params;
  }, [filter, debouncedSearch, page]);

  const { emails, pagination, loading, error, refetch, toggleStar, toggleArchive, toggleDelete } = useEmails(emailParams);

  // Fetch full email on select
  const handleSelectEmail = async (email) => {
    setSelectedId(email._id);
    try {
      const res = await api.get(`/api/emails/${email._id}`);
      setSelectedEmail(res.data);
    } catch {
      setSelectedEmail(email);
    }
  };

  const handleUpdate = () => {
    refetch();
    if (selectedEmail) {
      api.get(`/api/emails/${selectedEmail._id}`).then((r) => setSelectedEmail(r.data)).catch(() => {});
    }
  };

  const getPageTitle = () => {
    if (!filter || filter === 'applications') return 'All Job Emails';
    if (filter === 'starred') return 'Starred';
    if (filter === 'trash') return 'Trash';
    return decodeURIComponent(filter);
  };

  return (
    <AppLayout
      search={search}
      onSearchChange={(v) => { setSearch(v); setPage(1); }}
      onSearchClear={() => { setSearch(''); setPage(1); }}
    >
      <div className="flex h-[calc(100vh-var(--topbar-height))]">

        {/* Email list panel */}
        <div className={`flex flex-col border-r border-gray-200 bg-white transition-all duration-200
          ${selectedEmail ? 'w-[420px] flex-shrink-0 hidden md:flex' : 'flex-1'}`}
        >
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-800">{getPageTitle()}</h2>
              {!loading && (
                <span className="text-xs text-gray-400">({pagination.total ?? 0})</span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {/* Prev / Next */}
              {pagination.pages > 1 && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-ghost p-1 disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span>{page} / {pagination.pages}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                    className="btn-ghost p-1 disabled:opacity-30"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Active filters pill */}
          {search && (
            <div className="px-4 py-2 flex items-center gap-2 bg-blue-50 border-b border-blue-100">
              <span className="text-xs text-blue-700">Search: <strong>{search}</strong></span>
              <button onClick={() => { setSearch(''); setPage(1); }} className="text-blue-400 hover:text-blue-600">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="px-4 py-3 text-sm text-red-600 bg-red-50 border-b border-red-100">{error}</div>
          )}

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            <EmailList
              emails={emails}
              loading={loading}
              selectedId={selectedId}
              onSelect={handleSelectEmail}
              onStar={toggleStar}
              onArchive={toggleArchive}
              onDelete={toggleDelete}
              emptyTitle={`No ${getPageTitle().toLowerCase()} emails`}
              emptyDescription={
                debouncedSearch
                  ? `No emails matching "${debouncedSearch}"`
                  : 'Sync your Gmail inbox to find job-related emails automatically.'
              }
            />
          </div>
        </div>

        {/* Detail panel */}
        {selectedEmail ? (
          <div className="flex-1 min-w-0">
            <EmailDetail
              email={selectedEmail}
              onClose={() => { setSelectedEmail(null); setSelectedId(null); }}
              onUpdate={handleUpdate}
            />
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center text-gray-400 text-sm flex-col gap-2">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p>Select an email to read</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
