import { useState, useEffect } from 'react';
import { History, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Loader from '../components/shared/Loader';
import EmptyState from '../components/shared/EmptyState';
import api from '../services/api';
import { formatFullDate, formatDuration } from '../utils/format';

const STATUS_ICON = {
  success: <CheckCircle className="h-4 w-4 text-green-500" />,
  partial: <AlertCircle className="h-4 w-4 text-yellow-500" />,
  failed:  <XCircle className="h-4 w-4 text-red-500" />,
};

export default function SyncHistoryPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/sync/logs', { params: { page, limit: 20 } });
      setLogs(res.data.logs);
      setPagination(res.data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, [page]);

  return (
    <AppLayout search={search} onSearchChange={setSearch} onSearchClear={() => setSearch('')}>
      <div className="max-w-3xl mx-auto px-6 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Sync History</h1>
            <p className="text-sm text-gray-500 mt-0.5">A log of every Gmail sync session</p>
          </div>
          <button onClick={fetchLogs} className="btn-secondary text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>

        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12"><Loader /></div>
          ) : !logs.length ? (
            <EmptyState
              icon={History}
              title="No sync history"
              description="Sync your Gmail inbox to see history appear here"
            />
          ) : (
            <div className="divide-y divide-gray-100">
              {/* Header */}
              <div className="grid grid-cols-6 px-5 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-50">
                <span className="col-span-2">Date</span>
                <span>Fetched</span>
                <span>Saved</span>
                <span>Classified</span>
                <span>Duration</span>
              </div>

              {logs.map((log) => (
                <div key={log._id} className="grid grid-cols-6 px-5 py-3.5 items-center hover:bg-gray-50 transition-colors">
                  <div className="col-span-2 flex items-center gap-2">
                    {STATUS_ICON[log.status] || STATUS_ICON.success}
                    <div>
                      <p className="text-sm text-gray-800">{formatFullDate(log.syncedAt)}</p>
                      {log.error && <p className="text-xs text-red-500 mt-0.5 truncate">{log.error}</p>}
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">{log.totalFetched}</span>
                  <span className="text-sm font-medium text-green-700">{log.totalSaved}</span>
                  <span className="text-sm text-blue-600">{log.totalClassified}</span>
                  <span className="text-xs text-gray-400 font-mono">{formatDuration(log.durationMs)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary text-xs disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">{page} / {pagination.pages}</span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="btn-secondary text-xs disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
