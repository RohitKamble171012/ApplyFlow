import { NavLink, useLocation } from 'react-router-dom';
import {
  Inbox, Star, Briefcase, CheckCircle, ArrowRight, Code2,
  Users, XCircle, Gift, Bell, Trash2, Settings, Tag,
  History, LayoutDashboard, Plus, ChevronDown, ChevronRight,
  X, Calendar,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const STATUS_NAV = [
  { label: 'Applied',         filter: 'Applied',         icon: CheckCircle, color: 'text-blue-500' },
  { label: 'Next Step',       filter: 'Next Step',       icon: ArrowRight,  color: 'text-indigo-500' },
  { label: 'OA / Assessment', filter: 'OA / Assessment', icon: Code2,       color: 'text-purple-500' },
  { label: 'Interview',       filter: 'Interview',       icon: Users,       color: 'text-cyan-500' },
  { label: 'Rejected',        filter: 'Rejected',        icon: XCircle,     color: 'text-red-500' },
  { label: 'Offer',           filter: 'Offer',           icon: Gift,        color: 'text-green-500' },
  { label: 'Follow-up',       filter: 'Follow-up Needed',icon: Bell,        color: 'text-orange-500' },
];

export default function Sidebar({ onCompose, isOpen, onClose }) {
  const [statusExpanded, setStatusExpanded] = useState(true);
  const location = useLocation();

  // Auto-close on navigation (mobile)
  useEffect(() => { onClose(); }, [location.pathname]);

  return (
    <>
      {/* Overlay — mobile only */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
          aria-label="Close menu"
        />
      )}

      <aside className={`sidebar-drawer ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 flex-shrink-0 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold text-gray-900 tracking-tight">ApplyFlow</span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Add Application CTA */}
        <div className="px-3 py-3">
          <button
            onClick={() => { onCompose(); onClose(); }}
            className="flex items-center gap-3 w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700
                       text-white rounded-2xl font-semibold text-sm transition-colors shadow-sm active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Add Application
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto pb-4">
          <SideLink to="/dashboard"          icon={LayoutDashboard} label="Dashboard" />
          <SideLink to="/inbox"              icon={Inbox}           label="All Emails" end={false} />
          <SideLink to="/inbox/starred"      icon={Star}            label="Starred" />
          <SideLink to="/inbox/applications" icon={Briefcase}       label="Applications" />
          <SideLink to="/calendar"           icon={Calendar}        label="Calendar" />

          {/* Status group */}
          <div className="pt-3 pb-1 px-1">
            <button
              onClick={() => setStatusExpanded(v => !v)}
              className="flex items-center justify-between w-full px-2 py-1 text-xs font-semibold
                         text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors rounded-lg"
            >
              <span>By Status</span>
              {statusExpanded
                ? <ChevronDown className="h-3 w-3" />
                : <ChevronRight className="h-3 w-3" />}
            </button>
          </div>

          {statusExpanded && STATUS_NAV.map(({ label, filter, icon: Icon, color }) => (
            <NavLink
              key={filter}
              to={`/inbox/${encodeURIComponent(filter)}`}
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
            >
              <Icon className={`h-4 w-4 flex-shrink-0 ${color}`} />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}

          <div className="pt-2">
            <SideLink to="/inbox/trash" icon={Trash2} label="Trash" />
          </div>
        </nav>

        {/* Footer links */}
        <div className="px-2 py-3 border-t border-gray-100 space-y-0.5">
          <SideLink to="/labels"       icon={Tag}      label="Labels" />
          <SideLink to="/sync-history" icon={History}  label="Sync History" />
          <SideLink to="/settings"     icon={Settings} label="Settings" />
        </div>
      </aside>
    </>
  );
}

function SideLink({ to, icon: Icon, label, end = true }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
    >
      <Icon className="h-4 w-4 flex-shrink-0 text-gray-500" />
      <span className="truncate text-sm">{label}</span>
    </NavLink>
  );
}