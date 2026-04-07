import { RefreshCw, ChevronDown, LogOut, Settings, Menu } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SearchBar from '../shared/SearchBar';
import api from '../../services/api';

export const emitSyncComplete = () =>
  window.dispatchEvent(new CustomEvent('applyflow:syncComplete'));

export default function Topbar({ search, onSearchChange, onSearchClear, onMenuToggle }) {
  const { user, dbUser, logout } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [syncOk, setSyncOk] = useState(true);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleSync = async () => {
    if (!dbUser?.gmailConnected) { navigate('/settings'); return; }
    try {
      setSyncing(true); setSyncMsg('');
      const res = await api.post('/api/gmail/sync', { maxResults: 100 });
      setSyncOk(true);
      setSyncMsg(`✓ ${res.data.totalSaved} synced`);
      emitSyncComplete();
      setTimeout(() => setSyncMsg(''), 5000);
    } catch (err) {
      setSyncOk(false);
      setSyncMsg('Sync failed');
      setTimeout(() => setSyncMsg(''), 5000);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <header
      className="fixed top-0 right-0 z-20 flex items-center gap-2 px-3 bg-white border-b border-gray-200"
      style={{ left: 0, height: 'var(--topbar-height)' }}
    >
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuToggle}
        className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100
                   transition-colors flex-shrink-0 active:bg-gray-200"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-gray-600" />
      </button>

      {/* Logo text — mobile only */}
      <span className="md:hidden font-bold text-gray-900 text-sm flex-shrink-0 mr-1">ApplyFlow</span>

      {/* Desktop spacer so search starts after sidebar width */}
      <div className="hidden md:block flex-shrink-0" style={{ width: 'var(--sidebar-width)' }} />

      {/* Search */}
      <div className="flex-1 min-w-0">
        <SearchBar value={search} onChange={onSearchChange} onClear={onSearchClear} />
      </div>

      {/* Sync message */}
      {syncMsg && (
        <span className={`text-xs hidden sm:inline flex-shrink-0 font-medium
          ${syncOk ? 'text-green-600' : 'text-red-500'}`}>
          {syncMsg}
        </span>
      )}

      {/* Sync button — text on desktop, icon on mobile */}
      <button
        onClick={handleSync}
        disabled={syncing}
        title={dbUser?.gmailConnected ? 'Sync Gmail' : 'Connect Gmail first'}
        className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl
                   border border-gray-200 hover:bg-gray-50 transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed
                   sm:w-auto sm:px-3 sm:gap-1.5 sm:text-xs sm:font-medium sm:text-gray-700"
      >
        <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin text-blue-500' : 'text-gray-500'}`} />
        <span className="hidden sm:inline">{syncing ? 'Syncing…' : 'Sync'}</span>
      </button>

      {/* Avatar + dropdown */}
      <div className="relative flex-shrink-0" ref={dropRef}>
        <button
          onClick={() => setDropOpen(v => !v)}
          className="flex items-center gap-1 rounded-full hover:ring-2 hover:ring-blue-200
                     transition-all active:scale-95"
          aria-label="Account menu"
        >
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center
                            text-white text-sm font-semibold">
              {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
            </div>
          )}
          <ChevronDown className="h-3 w-3 text-gray-400 hidden md:block" />
        </button>

        {dropOpen && (
          <div className="absolute right-0 top-11 w-60 bg-white rounded-2xl shadow-xl
                          border border-gray-200 py-2 animate-fade-in z-50">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {user?.displayName || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              {dbUser?.gmailConnected && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-xs text-green-600 font-medium">Gmail connected</span>
                </div>
              )}
            </div>
            <button
              onClick={() => { setDropOpen(false); navigate('/settings'); }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700
                         hover:bg-gray-50 transition-colors"
            >
              <Settings className="h-4 w-4 text-gray-400" /> Settings
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600
                         hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}