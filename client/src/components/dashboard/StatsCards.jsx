import { Briefcase, Users, XCircle, Gift, Bell, ArrowRight, Code2, CheckCircle } from 'lucide-react';

const STAT_CARDS = [
  { key: 'totalApplications', label: 'Total Applications', icon: Briefcase,   color: 'bg-blue-50 text-blue-700',   border: 'border-blue-200' },
  { key: 'Interview',         label: 'Interviews',         icon: Users,        color: 'bg-cyan-50 text-cyan-700',   border: 'border-cyan-200' },
  { key: 'Offer',             label: 'Offers',             icon: Gift,         color: 'bg-green-50 text-green-700', border: 'border-green-200' },
  { key: 'Rejected',          label: 'Rejected',           icon: XCircle,      color: 'bg-red-50 text-red-700',     border: 'border-red-200' },
  { key: 'OA / Assessment',   label: 'Assessments',        icon: Code2,        color: 'bg-purple-50 text-purple-700', border: 'border-purple-200' },
  { key: 'Follow-up Needed',  label: 'Follow-ups',         icon: Bell,         color: 'bg-orange-50 text-orange-700', border: 'border-orange-200' },
];

export default function StatsCards({ stats, loading }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {STAT_CARDS.map(({ key, label, icon: Icon, color, border }) => {
        const count = key === 'totalApplications'
          ? (stats?.totalApplications ?? 0)
          : (stats?.byStatus?.[key] ?? 0);

        return (
          <div
            key={key}
            className={`card border ${border} p-4 flex flex-col gap-2 hover:shadow-md transition-shadow`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
              <Icon className="h-4 w-4" />
            </div>
            {loading ? (
              <div className="skeleton h-7 w-12 rounded" />
            ) : (
              <p className="text-2xl font-bold text-gray-800">{count}</p>
            )}
            <p className="text-xs text-gray-500 font-medium leading-tight">{label}</p>
          </div>
        );
      })}
    </div>
  );
}
