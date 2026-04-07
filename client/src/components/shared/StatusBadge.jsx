const STATUS_STYLES = {
  'Applied':           'bg-blue-100 text-blue-800',
  'Under Review':      'bg-yellow-100 text-yellow-800',
  'Next Step':         'bg-indigo-100 text-indigo-800',
  'OA / Assessment':   'bg-purple-100 text-purple-800',
  'Interview':         'bg-cyan-100 text-cyan-800',
  'Rejected':          'bg-red-100 text-red-800',
  'Offer':             'bg-green-100 text-green-800',
  'Follow-up Needed':  'bg-orange-100 text-orange-800',
  'Unknown':           'bg-gray-100 text-gray-600',
};

const STATUS_DOTS = {
  'Applied':           'bg-blue-400',
  'Under Review':      'bg-yellow-400',
  'Next Step':         'bg-indigo-400',
  'OA / Assessment':   'bg-purple-400',
  'Interview':         'bg-cyan-400',
  'Rejected':          'bg-red-400',
  'Offer':             'bg-green-400',
  'Follow-up Needed':  'bg-orange-400',
  'Unknown':           'bg-gray-400',
};

export default function StatusBadge({ status, size = 'sm' }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES['Unknown'];
  const dot   = STATUS_DOTS[status]  || STATUS_DOTS['Unknown'];
  const textSize = size === 'xs' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-0.5';

  return (
    <span className={`status-badge ${style} ${textSize}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} flex-shrink-0`} />
      {status || 'Unknown'}
    </span>
  );
}

export { STATUS_STYLES, STATUS_DOTS };
