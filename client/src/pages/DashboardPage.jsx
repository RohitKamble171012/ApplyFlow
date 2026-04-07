import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RefreshCw, ExternalLink, Mail, TrendingUp, Plus } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import StatsCards from '../components/dashboard/StatsCards';
import StatusBadge from '../components/shared/StatusBadge';
import AddApplicationModal from '../components/applications/AddApplicationModal';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatRelative } from '../utils/format';

export default function DashboardPage() {
  const { dbUser, refreshDbUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('gmailConnected')) refreshDbUser();
  }, [searchParams]);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Stats error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Also re-fetch every 30 seconds while on this page
  useEffect(() => {
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return (
    <AppLayout
      search={search}
      onSearchChange={(v) => { setSearch(v); navigate(`/inbox?search=${v}`); }}
      onSearchClear={() => setSearch('')}
      onSyncComplete={fetchStats}   // ← re-fetch stats when sync finishes
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-5 space-y-6">

        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Good {getGreeting()}, {dbUser?.name?.split(' ')[0] || 'there'} 👋
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Your job search overview</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setAddOpen(true)} className="btn-primary text-xs">
              <Plus className="h-3.5 w-3.5" /> Add Application
            </button>
            <button onClick={() => navigate('/inbox')} className="btn-secondary text-xs">
              <Mail className="h-3.5 w-3.5" /> Inbox
            </button>
          </div>
        </div>

        {/* Gmail connect banner */}
        {dbUser && !dbUser.gmailConnected && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3
                          p-4 bg-blue-50 border border-blue-200 rounded-2xl animate-fade-in">
            <div>
              <p className="text-sm font-semibold text-blue-800">Connect Gmail to auto-track applications</p>
              <p className="text-xs text-blue-600 mt-0.5">ApplyFlow will scan your inbox and classify job emails automatically.</p>
            </div>
            <button onClick={() => navigate('/settings')} className="btn-primary text-xs flex-shrink-0">
              Connect Gmail
            </button>
          </div>
        )}

        {/* Stats */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-700">Overview</h2>
            </div>
            <button
              onClick={fetchStats}
              disabled={loading}
              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          <StatsCards stats={stats} loading={loading} />
        </div>

        {/* Recent Applications */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-700">Recent Applications</h2>
              {stats?.recentApplications?.length > 0 && (
                <span className="text-xs text-gray-400">({stats.recentApplications.length} shown)</span>
              )}
            </div>
            <button
              onClick={() => navigate('/inbox/applications')}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View all <ExternalLink className="h-3 w-3" />
            </button>
          </div>

          <div className="card overflow-hidden">
            {loading ? (
              <div className="divide-y divide-gray-100">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    <div className="skeleton h-8 w-8 rounded-lg" />
                    <div className="space-y-1.5 flex-1">
                      <div className="skeleton h-3.5 w-32 rounded" />
                      <div className="skeleton h-3 w-24 rounded" />
                    </div>
                    <div className="skeleton h-5 w-20 rounded-full" />
                    <div className="skeleton h-3 w-14 rounded" />
                  </div>
                ))}
              </div>
            ) : !stats?.recentApplications?.length ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">No applications yet</p>
                  <p className="text-xs text-gray-400 mt-0.5">Sync your Gmail or add one manually</p>
                </div>
                <button onClick={() => setAddOpen(true)} className="btn-primary text-xs">
                  <Plus className="h-3.5 w-3.5" /> Add Manually
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {stats.recentApplications.map((app) => (
                  <div
                    key={app._id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer group"
                    onClick={() => navigate(`/applications/${app._id}`)}
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl
                                    flex items-center justify-center flex-shrink-0 text-sm font-bold
                                    text-blue-700 group-hover:from-blue-100 group-hover:to-indigo-200 transition-all">
                      {app.company?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{app.company}</p>
                      <p className="text-xs text-gray-500 truncate">{app.role}</p>
                    </div>
                    <StatusBadge status={app.status} />
                    <span className="text-xs text-gray-400 flex-shrink-0 hidden sm:block">
                      {formatRelative(app.updatedAt)}
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 text-gray-300 group-hover:text-blue-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pipeline summary */}
        {stats && !loading && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Pipeline Breakdown</h2>
            <div className="card p-4 space-y-2.5">
              {Object.entries(stats.byStatus)
                .filter(([, count]) => count > 0)
                .sort(([, a], [, b]) => b - a)
                .map(([status, count]) => {
                  const total = stats.totalApplications || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={status} size="xs" />
                        </div>
                        <span className="text-xs text-gray-500">{count} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              {Object.values(stats.byStatus).every((v) => v === 0) && (
                <p className="text-xs text-gray-400 text-center py-4">No data yet — sync your Gmail to get started</p>
              )}
            </div>
          </div>
        )}
      </div>

      {addOpen && (
        <AddApplicationModal
          onClose={() => setAddOpen(false)}
          onCreated={() => { setAddOpen(false); fetchStats(); }}
        />
      )}
    </AppLayout>
  );
}

function Briefcase({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}