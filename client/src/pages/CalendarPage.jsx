import { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, Sparkles, RefreshCw,
  X, Check, Trash2, Clock, Building2, Calendar,
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import api from '../services/api';

const TYPE_COLORS = {
  interview:    { bg: 'bg-cyan-500',    light: 'bg-cyan-100 text-cyan-800',    dot: 'bg-cyan-500' },
  assessment:   { bg: 'bg-purple-500',  light: 'bg-purple-100 text-purple-800',dot: 'bg-purple-500' },
  follow_up:    { bg: 'bg-orange-500',  light: 'bg-orange-100 text-orange-800',dot: 'bg-orange-500' },
  offer_expiry: { bg: 'bg-green-500',   light: 'bg-green-100 text-green-800',  dot: 'bg-green-500' },
  deadline:     { bg: 'bg-red-500',     light: 'bg-red-100 text-red-800',      dot: 'bg-red-500' },
  join_date:    { bg: 'bg-emerald-500', light: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
  meeting:      { bg: 'bg-blue-500',    light: 'bg-blue-100 text-blue-800',    dot: 'bg-blue-500' },
  custom:       { bg: 'bg-gray-500',    light: 'bg-gray-100 text-gray-700',    dot: 'bg-gray-400' },
};

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear]     = useState(today.getFullYear());
  const [month, setMonth]   = useState(today.getMonth());
  const [events, setEvents] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [selected, setSelected]     = useState(null); // date string "YYYY-MM-DD"
  const [detailEvent, setDetailEvent] = useState(null);
  const [addOpen, setAddOpen]       = useState(false);
  const [addDate, setAddDate]       = useState('');
  const [search, setSearch]         = useState('');
  const [extractMsg, setExtractMsg] = useState('');

  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/calendar/events', { params: { month: monthStr } });
      setEvents(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [monthStr]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); };

  const handleExtract = async () => {
    try {
      setExtracting(true);
      const res = await api.post('/api/calendar/extract');
      setExtractMsg(`✓ ${res.data.created} events extracted`);
      fetchEvents();
      setTimeout(() => setExtractMsg(''), 5000);
    } catch (err) {
      setExtractMsg('Extraction failed');
      setTimeout(() => setExtractMsg(''), 4000);
    } finally { setExtracting(false); }
  };

  const handleDelete = async (id) => {
    await api.delete(`/api/calendar/events/${id}`);
    setDetailEvent(null);
    fetchEvents();
  };

  const handleToggleComplete = async (ev) => {
    await api.patch(`/api/calendar/events/${ev._id}`, { completed: !ev.completed });
    fetchEvents();
    setDetailEvent(prev => prev ? { ...prev, completed: !prev.completed } : null);
  };

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const cells = [];

  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ day: daysInPrev - i, current: false });
  for (let i = 1; i <= daysInMonth; i++)
    cells.push({ day: i, current: true });
  while (cells.length % 7 !== 0)
    cells.push({ day: cells.length - daysInMonth - firstDay + 1, current: false });

  const getDateStr = (day, current) => {
    if (!current) return '';
    return `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  };

  const eventsOnDate = (dateStr) => events.filter(e => e.date === dateStr);
  const todayStr = today.toISOString().split('T')[0];

  return (
    <AppLayout
      search={search}
      onSearchChange={setSearch}
      onSearchClear={() => setSearch('')}
      onSyncComplete={fetchEvents}
    >
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" /> Calendar
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Interview dates, deadlines & reminders from your applications
            </p>
          </div>
          <div className="flex items-center gap-2">
            {extractMsg && (
              <span className="text-xs text-green-600 font-medium">{extractMsg}</span>
            )}
            <button
              onClick={handleExtract}
              disabled={extracting}
              className="btn-secondary text-xs"
              title="Scan emails and extract dates"
            >
              <Sparkles className={`h-3.5 w-3.5 ${extracting ? 'animate-spin' : 'text-yellow-500'}`} />
              {extracting ? 'Scanning…' : 'Extract from Emails'}
            </button>
            <button
              onClick={() => { setAddDate(todayStr); setAddOpen(true); }}
              className="btn-primary text-xs"
            >
              <Plus className="h-3.5 w-3.5" /> Add Event
            </button>
          </div>
        </div>

        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="btn-ghost p-2">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-900">{MONTHS[month]} {year}</h2>
            <button
              onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); }}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Today
            </button>
          </div>
          <button onClick={nextMonth} className="btn-ghost p-2">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-4">
          {Object.entries(TYPE_COLORS).filter(([k]) => k !== 'custom').map(([type, c]) => (
            <div key={type} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
              <span className="text-xs text-gray-500 capitalize">{type.replace('_',' ')}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="card overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {DAYS.map(d => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {d}
              </div>
            ))}
          </div>

          {/* Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-gray-100">
            {cells.map((cell, i) => {
              const dateStr = getDateStr(cell.day, cell.current);
              const dayEvents = dateStr ? eventsOnDate(dateStr) : [];
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selected;

              return (
                <div
                  key={i}
                  onClick={() => { if (cell.current) setSelected(isSelected ? null : dateStr); }}
                  className={`cal-day min-h-[70px] md:min-h-[90px] p-1 md:p-1.5
                    ${!cell.current ? 'other-month' : ''}
                    ${isToday ? 'today' : ''}
                    ${isSelected ? 'ring-2 ring-blue-400 ring-inset' : ''}`}
                >
                  {/* Day number */}
                  <div className={`text-xs font-semibold mb-1 w-6 h-6 flex items-center justify-center rounded-full
                    ${isToday ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>
                    {cell.day}
                  </div>

                  {/* Events */}
                  <div className="space-y-0.5 overflow-hidden">
                    {dayEvents.slice(0, 3).map(ev => {
                      const c = TYPE_COLORS[ev.type] || TYPE_COLORS.custom;
                      return (
                        <div
                          key={ev._id}
                          onClick={(e) => { e.stopPropagation(); setDetailEvent(ev); }}
                          className={`cal-event ${c.light} ${ev.completed ? 'opacity-50 line-through' : ''}`}
                          title={ev.title}
                        >
                          <span className="hidden md:inline">{ev.title}</span>
                          <span className={`inline-block md:hidden w-2 h-2 rounded-full ${c.dot}`} />
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-400 pl-1">+{dayEvents.length - 3}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected day events list (mobile-friendly) */}
        {selected && eventsOnDate(selected).length > 0 && (
          <div className="mt-4 card p-4 animate-slide-up">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              {new Date(selected + 'T12:00:00').toLocaleDateString('en-US',
                { weekday:'long', month:'long', day:'numeric' })}
            </h3>
            <div className="space-y-2">
              {eventsOnDate(selected).map(ev => (
                <EventCard key={ev._id} ev={ev} onOpen={setDetailEvent} />
              ))}
            </div>
            <button
              onClick={() => { setAddDate(selected); setAddOpen(true); }}
              className="mt-3 btn-ghost text-xs text-blue-600 w-full justify-center"
            >
              <Plus className="h-3.5 w-3.5" /> Add event on this day
            </button>
          </div>
        )}

        {/* Upcoming events sidebar */}
        <div className="mt-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Upcoming This Month</h3>
          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}
            </div>
          ) : events.filter(e => e.date >= todayStr && !e.completed).length === 0 ? (
            <div className="card p-6 text-center text-gray-400 text-sm">
              No upcoming events. Click "Extract from Emails" to auto-detect interview dates.
            </div>
          ) : (
            <div className="space-y-2">
              {events
                .filter(e => e.date >= todayStr && !e.completed)
                .slice(0, 8)
                .map(ev => <EventCard key={ev._id} ev={ev} onOpen={setDetailEvent} />)}
            </div>
          )}
        </div>
      </div>

      {/* Event detail modal */}
      {detailEvent && (
        <EventDetailModal
          ev={detailEvent}
          onClose={() => setDetailEvent(null)}
          onDelete={handleDelete}
          onToggle={handleToggleComplete}
          onRefresh={() => { fetchEvents(); setDetailEvent(null); }}
        />
      )}

      {/* Add event modal */}
      {addOpen && (
        <AddEventModal
          defaultDate={addDate}
          onClose={() => setAddOpen(false)}
          onCreated={() => { setAddOpen(false); fetchEvents(); }}
        />
      )}
    </AppLayout>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function EventCard({ ev, onOpen }) {
  const c = TYPE_COLORS[ev.type] || TYPE_COLORS.custom;
  return (
    <div
      onClick={() => onOpen(ev)}
      className={`flex items-center gap-3 p-3 rounded-xl border border-gray-100
                  hover:border-gray-200 hover:shadow-sm cursor-pointer transition-all
                  ${ev.completed ? 'opacity-60' : ''}`}
    >
      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${c.dot}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium text-gray-800 truncate ${ev.completed ? 'line-through' : ''}`}>
          {ev.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {ev.time && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="h-3 w-3" /> {ev.time}
            </span>
          )}
          <span className="text-xs text-gray-400">
            {new Date(ev.date + 'T12:00:00').toLocaleDateString('en-US', { month:'short', day:'numeric' })}
          </span>
          {ev.isAutoGenerated && (
            <span className="text-xs bg-yellow-50 text-yellow-600 px-1.5 rounded">auto</span>
          )}
        </div>
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full ${c.light} flex-shrink-0 hidden sm:block capitalize`}>
        {ev.type.replace('_',' ')}
      </span>
    </div>
  );
}

function EventDetailModal({ ev, onClose, onDelete, onToggle, onRefresh }) {
  const c = TYPE_COLORS[ev.type] || TYPE_COLORS.custom;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 animate-fade-in">
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl animate-slide-up">
        <div className={`flex items-center justify-between px-5 py-4 rounded-t-2xl ${c.bg}`}>
          <span className="text-white font-semibold text-sm capitalize">{ev.type.replace('_',' ')}</span>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <h2 className={`text-base font-bold text-gray-900 ${ev.completed ? 'line-through opacity-60' : ''}`}>
            {ev.title}
          </h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              {new Date(ev.date + 'T12:00:00').toLocaleDateString('en-US',
                { weekday:'long', month:'long', day:'numeric', year:'numeric' })}
            </div>
            {ev.time && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" /> {ev.time}
              </div>
            )}
            {ev.company && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-400" /> {ev.company}
                {ev.role && <span className="text-gray-400">— {ev.role}</span>}
              </div>
            )}
          </div>
          {ev.notes && (
            <p className="text-sm text-gray-500 bg-gray-50 rounded-xl px-3 py-2">{ev.notes}</p>
          )}
          {ev.isAutoGenerated && (
            <p className="text-xs text-yellow-600 bg-yellow-50 rounded-xl px-3 py-2">
              ⚡ Auto-extracted from email. Verify the date.
            </p>
          )}
          {ev.sourceText && !ev.isAutoGenerated && (
            <p className="text-xs text-gray-400 italic">From: "{ev.sourceText}"</p>
          )}
        </div>
        <div className="flex items-center gap-2 px-5 pb-5">
          <button
            onClick={() => onToggle(ev)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium
              transition-colors ${ev.completed
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
          >
            <Check className="h-4 w-4" />
            {ev.completed ? 'Mark Incomplete' : 'Mark Complete'}
          </button>
          <button
            onClick={() => onDelete(ev._id)}
            className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

const EVENT_TYPES = ['interview','assessment','follow_up','offer_expiry','deadline','join_date','meeting','custom'];

function AddEventModal({ defaultDate, onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '', date: defaultDate || '', time: '', type: 'interview',
    company: '', role: '', notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError('Title is required');
    if (!form.date) return setError('Date is required');
    try {
      setSaving(true);
      await api.post('/api/calendar/events', form);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create event');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 animate-fade-in">
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Add Calendar Event</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Event Title *</label>
            <input className="input-field" placeholder="e.g. Interview at Google" value={form.title}
              onChange={e => set('title', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date *</label>
              <input type="date" className="input-field" value={form.date}
                onChange={e => set('date', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Time</label>
              <input type="time" className="input-field" value={form.time}
                onChange={e => set('time', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
            <select className="input-field" value={form.type} onChange={e => set('type', e.target.value)}>
              {EVENT_TYPES.map(t => (
                <option key={t} value={t}>{t.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Company</label>
              <input className="input-field" placeholder="Google" value={form.company}
                onChange={e => set('company', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
              <input className="input-field" placeholder="SDE" value={form.role}
                onChange={e => set('role', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea className="input-field resize-none" rows={2} placeholder="Any notes…"
              value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving…' : 'Add Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}