import { Search, X } from 'lucide-react';
import { useState } from 'react';

export default function SearchBar({ value, onChange, placeholder = 'Search mail', onClear }) {
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={`flex items-center gap-2 flex-1 max-w-2xl px-4 py-2 rounded-2xl transition-all duration-200
        ${focused ? 'bg-white shadow-md ring-1 ring-blue-200' : 'bg-gray-100 hover:bg-gray-200'}`}
    >
      <Search className="h-4 w-4 text-gray-500 flex-shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-500 outline-none"
      />
      {value && (
        <button
          onClick={onClear}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
