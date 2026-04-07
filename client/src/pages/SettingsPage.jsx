import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Mail, CheckCircle, AlertCircle, RefreshCw, LogOut,
  Shield, User, Link, Unlink, ExternalLink,
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function SettingsPage() {
  const { user, dbUser, logout, refreshDbUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState('');
  const [syncResult, setSyncResult] = useState(null);
  const [gmailError, setGmailError] = useState('');

  useEffect(() => {
    const err = searchParams.get('gmailError');
    if (err) setGmailError(`Gmail connection failed: ${err}`);
    if (searchParams.get('gmailConnected')) refreshDbUser();
  }, [searchParams]);

  const handleConnectGmail = async () => {
    try {
      setConnecting(true);
      const res = await api.get('/api/google/connect');
      window.location.href = res.data.authUrl;
    } catch (err) {
      setGmailError('Failed to initiate Gmail connection');
      setConnecting(false);
    }
  };

  const handleDisconnectGmail = async () => {
    if (!window.confirm('Disconnect Gmail? You can reconnect anytime.')) return;
    try {
      setDisconnecting(true);
      await api.post('/api/google/disconnect');
      await refreshDbUser();
    } catch (err) { console.error(err); }
    finally { setDisconnecting(false); }
  };

  const handleManualSync = async () => {
    try {
      setSyncing(true);
      setSyncResult(null);
      const res = await api.post('/api/gmail/sync', { maxResults: 200 });
      setSyncResult({ success: true, message: res.data.message });
    } catch (err) {
      setSyncResult({ success: false, message: err.response?.data?.error || 'Sync failed' });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <AppLayout search={search} onSearchChange={setSearch} onSearchClear={() => setSearch('')}>
      <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your account and Gmail integration</p>
        </div>

        {/* Profile */}
        <section className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <User className="h-4 w-4 text-blue-500" /> Profile
          </h2>
          <div className="flex items-center gap-4">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-200" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-gray-900">{user?.displayName || dbUser?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <p className="text-xs text-gray-400 mt-0.5">Firebase UID: {dbUser?.firebaseUid?.slice(0, 16)}…</p>
            </div>
          </div>
        </section>

        {/* Gmail integration */}
        <section className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Mail className="h-4 w-4 text-blue-500" /> Gmail Integration
          </h2>

          {gmailError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {gmailError}
            </div>
          )}

          {dbUser?.gmailConnected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-800">Gmail Connected</p>
                  <p className="text-xs text-green-600">{dbUser.gmailEmail || 'Connected account'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleManualSync}
                  disabled={syncing}
                  className="btn-primary text-sm"
                >
                  <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Syncing…' : 'Sync Now'}
                </button>
                <button
                  onClick={handleDisconnectGmail}
                  disabled={disconnecting}
                  className="btn-secondary text-sm"
                >
                  <Unlink className="h-4 w-4" />
                  {disconnecting ? 'Disconnecting…' : 'Disconnect Gmail'}
                </button>
              </div>

              {syncResult && (
                <div className={`flex items-center gap-2 p-3 rounded-xl text-sm border ${
                  syncResult.success
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  {syncResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  {syncResult.message}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Connect your Gmail account so ApplyFlow can automatically detect and track job application emails.
              </p>
              <ul className="space-y-1.5 text-xs text-gray-500">
                {[
                  'Read-only access to your inbox',
                  'Only job-related emails are saved',
                  'We never send emails on your behalf',
                  'You can disconnect at any time',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleConnectGmail}
                disabled={connecting}
                className="btn-primary"
              >
                <Link className="h-4 w-4" />
                {connecting ? 'Redirecting…' : 'Connect Gmail'}
              </button>
            </div>
          )}
        </section>

        {/* Privacy */}
        <section className="card p-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-500" /> Privacy & Security
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            ApplyFlow only reads emails related to job applications. Your email data is stored securely in your private database and never shared with third parties. Gmail tokens are stored encrypted and are only used to sync your inbox on request.
          </p>
        </section>

        {/* Sign out */}
        <section className="card p-6">
          <button onClick={logout} className="btn-danger text-sm">
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </section>
      </div>
    </AppLayout>
  );
}
