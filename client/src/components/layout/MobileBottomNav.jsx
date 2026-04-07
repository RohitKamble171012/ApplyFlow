import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Inbox, Calendar, Plus, Settings } from 'lucide-react';

export default function MobileBottomNav({ onCompose }) {
  return (
    <nav className="mobile-nav">
      <BottomLink to="/dashboard" icon={LayoutDashboard} label="Home" />
      <BottomLink to="/inbox"     icon={Inbox}           label="Inbox" end={false} />

      {/* Centre compose button */}
      <button
        onClick={onCompose}
        className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2"
        aria-label="Add Application"
      >
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg -mt-4
                        active:scale-95 transition-transform">
          <Plus className="h-5 w-5 text-white" />
        </div>
        <span className="text-[10px] text-gray-500 mt-0.5">Add</span>
      </button>

      <BottomLink to="/calendar" icon={Calendar}  label="Calendar" />
      <BottomLink to="/settings" icon={Settings}  label="Settings" />
    </nav>
  );
}

function BottomLink({ to, icon: Icon, label, end = true }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors
         ${isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`
      }
    >
      <Icon className="h-5 w-5" />
      <span className="text-[10px] font-medium">{label}</span>
    </NavLink>
  );
}