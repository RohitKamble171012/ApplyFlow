import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileBottomNav from './MobileBottomNav';
import AddApplicationModal from '../applications/AddApplicationModal';

export default function AppLayout({ children, search = '', onSearchChange, onSearchClear, onSyncComplete }) {
  const [composeOpen, setComposeOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handler = () => onSyncComplete?.();
    window.addEventListener('applyflow:syncComplete', handler);
    return () => window.removeEventListener('applyflow:syncComplete', handler);
  }, [onSyncComplete]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        onCompose={() => setComposeOpen(true)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Desktop: offset by sidebar width. Mobile: no offset (sidebar overlays) */}
      <div className="md:ml-[var(--sidebar-width)]">
        <Topbar
          search={search}
          onSearchChange={onSearchChange}
          onSearchClear={onSearchClear}
          onMenuToggle={() => setSidebarOpen(v => !v)}
          sidebarOpen={sidebarOpen}
        />

        <main
          className="overflow-auto"
          style={{
            paddingTop: 'var(--topbar-height)',
            // Extra bottom padding on mobile for the bottom nav bar
            paddingBottom: 'env(safe-area-inset-bottom)',
            minHeight: '100vh',
          }}
        >
          <div className="pb-16 md:pb-0">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileBottomNav onCompose={() => setComposeOpen(true)} />

      {composeOpen && (
        <AddApplicationModal
          onClose={() => setComposeOpen(false)}
          onCreated={() => { setComposeOpen(false); onSyncComplete?.(); }}
        />
      )}
    </div>
  );
}