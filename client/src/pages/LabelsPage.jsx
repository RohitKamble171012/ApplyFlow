import { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, Edit3, Check, X } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Loader from '../components/shared/Loader';
import EmptyState from '../components/shared/EmptyState';
import api from '../services/api';

const PRESET_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#06b6d4', '#64748b', '#1e293b',
];

export default function LabelsPage() {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#3b82f6');
  const [creating, setCreating] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [search, setSearch] = useState('');

  const fetchLabels = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/labels');
      setLabels(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLabels(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      setCreating(true);
      await api.post('/api/labels', { name: newName.trim(), color: newColor });
      setNewName('');
      fetchLabels();
    } catch (err) { console.error(err); }
    finally { setCreating(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this label?')) return;
    await api.delete(`/api/labels/${id}`);
    fetchLabels();
  };

  const handleEditSave = async (id) => {
    if (!editName.trim()) return;
    await api.patch(`/api/labels/${id}`, { name: editName.trim() });
    setEditId(null);
    fetchLabels();
  };

  return (
    <AppLayout search={search} onSearchChange={setSearch} onSearchClear={() => setSearch('')}>
      <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Labels</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create and manage custom labels for your applications</p>
        </div>

        {/* Create form */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Plus className="h-4 w-4 text-blue-500" /> New Label
          </h2>
          <form onSubmit={handleCreate} className="flex items-center gap-3">
            <input
              className="input-field flex-1"
              placeholder="Label name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            {/* Color picker */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewColor(c)}
                  className={`w-5 h-5 rounded-full transition-transform ${newColor === c ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <button type="submit" disabled={creating || !newName.trim()} className="btn-primary">
              {creating ? 'Creating…' : 'Create'}
            </button>
          </form>
        </div>

        {/* Label list */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-10"><Loader /></div>
          ) : !labels.length ? (
            <EmptyState
              icon={Tag}
              title="No labels yet"
              description="Create your first label to organise your applications"
            />
          ) : (
            <div className="divide-y divide-gray-100">
              {labels.map((label) => (
                <div key={label._id} className="flex items-center gap-4 px-5 py-3 group">
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: label.color }} />

                  {editId === label._id ? (
                    <input
                      className="input-field flex-1 py-1 text-sm"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleEditSave(label._id); if (e.key === 'Escape') setEditId(null); }}
                      autoFocus
                    />
                  ) : (
                    <span className="flex-1 text-sm text-gray-800 font-medium">{label.name}</span>
                  )}

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {editId === label._id ? (
                      <>
                        <button onClick={() => handleEditSave(label._id)} className="btn-ghost p-1.5 text-green-600">
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setEditId(null)} className="btn-ghost p-1.5">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditId(label._id); setEditName(label.name); }} className="btn-ghost p-1.5">
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDelete(label._id)} className="btn-ghost p-1.5 text-red-400 hover:text-red-600">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
