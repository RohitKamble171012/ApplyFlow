import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title = 'Nothing here', description = '', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center animate-fade-in">
      <div className="p-4 bg-gray-100 rounded-full">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-gray-700">{title}</h3>
        {description && <p className="text-sm text-gray-500 mt-1 max-w-xs">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
