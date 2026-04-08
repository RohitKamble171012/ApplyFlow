import { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, Edit3, Check, X, Palette } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Loader from '../components/shared/Loader';
import EmptyState from '../components/shared/EmptyState';
import api from '../services/api';

const PRESET_COLORS = [
  { hex: '#3b82f6', name: 'Blue' },
  { hex: '#8b5cf6', name: 'Purple' },
  { hex: '#ec4899', name: 'Pink' },
  { hex: '#ef4444', name: 'Red' },
  { hex: '#f97316', name: 'Orange' },
  { hex: '#eab308', name: 'Yellow' },
  { hex: '#22c55e', name: 'Green' },
  { hex: '#06b6d4', name: 'Cyan' },
  { hex: '#64748b', name: 'Slate' },
  { hex: '#1e293b', name: 'Dark' },
];

export default function LabelsPage() {
  const [labels, setLabels]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');

  // Create form state
  const [newName, setNewName]   = useState('');
  const [newColor, setNewColor] = useState('#3b82f6');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Edit state
  const [editId, setEditId]     = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // Delete confirm
  const [deleteId, setDeleteId] = useState(null);

  const fetchLabels = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/labels');
      setLabels(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLabels(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      setCreating(true);
      setCreateError('');
      await api.post('/api/labels', { name: newName.trim(), color: newColor });
      setNewName('');
      fetchLabels();
    } catch (err) {
      setCreateError(err.response?.data?.error || 'Failed to create label');
    } finally {
      setCreating(false);
    }
  };

  const handleEditSave = async (id) => {
    if (!editName.trim()) return;
    try {
      setEditSaving(true);
      await api.patch(`/api/labels/${id}`, { name: editName.trim(), color: editColor });
      setEditId(null);
      fetchLabels();
    } catch (err) {
      console.error(err);
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/labels/${id}`);
      setDeleteId(null);
      fetchLabels();
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (label) => {
    setEditId(label._id);
    setEditName(label.name);
    setEditColor(label.color || '#3b82f6');
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditName('');
    setEditColor('');
  };

  return (
    <AppLayout
      search={search}
      onSearchChange={setSearch}
      onSearchClear={() => setSearch('')}
    >
      <div className="max-w-xl mx-auto px-4 py-5 space-y-5 pb-24 md:pb-6">

        {/* Page header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Tag className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Labels</h1>
            <p className="text-xs text-gray-500">Organise your applications with custom labels</p>
          </div>
        </div>

        {/* ── Create new label card ── */}
        <div className="card p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4 text-blue-500" />
            New Label
          </h2>

          <form onSubmit={handleCreate} className="space-y-4">
            {/* Name input — full width on mobile */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Label name
              </label>
              <input
                className="input-field"
                placeholder="e.g. Dream Company, Priority, Remote…"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={30}
              />
            </div>

            {/* Color picker — large touch targets */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">
                Pick a colour
              </label>
              <div className="flex flex-wrap gap-3">
                {PRESET_COLORS.map(({ hex, name }) => (
                  <button
                    key={hex}
                    type="button"
                    title={name}
                    onClick={() => setNewColor(hex)}
                    className="relative transition-transform active:scale-95"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    {/* Large tap target (44×44 min) */}
                    <div
                      className={`w-9 h-9 rounded-xl transition-all
                        ${newColor === hex
                          ? 'scale-110 ring-2 ring-offset-2 shadow-md'
                          : 'hover:scale-105 opacity-70 hover:opacity-100'}`}
                      style={{
                        backgroundColor: hex,
                        ringColor: hex,
                        boxShadow: newColor === hex ? `0 0 0 2px white, 0 0 0 4px ${hex}` : undefined,
                      }}
                    />
                    {newColor === hex && (
                      <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow" />
                    )}
                  </button>
                ))}
              </div>

              {/* Selected colour preview */}
              <div className="flex items-center gap-2 mt-3 p-2.5 bg-gray-50 rounded-xl">
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: newColor }}
                />
                <span className="text-xs text-gray-600">
                  Preview:{' '}
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: newColor + '20',
                      color: newColor,
                      border: `1px solid ${newColor}40`,
                    }}
                  >
                    {newName || 'Label name'}
                  </span>
                </span>
              </div>
            </div>

            {createError && (
              <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{createError}</p>
            )}

            <button
              type="submit"
              disabled={creating || !newName.trim()}
              className="btn-primary w-full justify-center py-3"
            >
              {creating ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Label
                </>
              )}
            </button>
          </form>
        </div>

        {/* ── Labels list ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">
              Your Labels
              {labels.length > 0 && (
                <span className="ml-1.5 text-xs font-normal text-gray-400">({labels.length})</span>
              )}
            </h2>
          </div>

          <div className="card overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader />
              </div>
            ) : !labels.length ? (
              <EmptyState
                icon={Tag}
                title="No labels yet"
                description="Create your first label above to start organising applications"
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {labels.map((label) => (
                  <LabelRow
                    key={label._id}
                    label={label}
                    isEditing={editId === label._id}
                    editName={editName}
                    editColor={editColor}
                    editSaving={editSaving}
                    isDeleting={deleteId === label._id}
                    onEditStart={() => startEdit(label)}
                    onEditNameChange={setEditName}
                    onEditColorChange={setEditColor}
                    onEditSave={() => handleEditSave(label._id)}
                    onEditCancel={cancelEdit}
                    onDeleteRequest={() => setDeleteId(label._id)}
                    onDeleteCancel={() => setDeleteId(null)}
                    onDeleteConfirm={() => handleDelete(label._id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// ── LabelRow — fully mobile-friendly ────────────────────────────────────────
function LabelRow({
  label,
  isEditing, editName, editColor, editSaving,
  isDeleting,
  onEditStart, onEditNameChange, onEditColorChange,
  onEditSave, onEditCancel,
  onDeleteRequest, onDeleteCancel, onDeleteConfirm,
}) {
  // Delete confirmation inline (no window.confirm — bad on mobile)
  if (isDeleting) {
    return (
      <div className="px-4 py-3 bg-red-50 animate-fade-in">
        <p className="text-sm text-red-700 font-medium mb-3">
          Delete "<span style={{ color: label.color }}>{label.name}</span>"?
        </p>
        <div className="flex gap-2">
          <button
            onClick={onDeleteCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium
                       text-gray-600 bg-white hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onDeleteConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium
                       text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    );
  }

  // Edit mode
  if (isEditing) {
    return (
      <div className="px-4 py-3 bg-blue-50 space-y-3 animate-fade-in">
        <input
          className="input-field bg-white"
          value={editName}
          onChange={(e) => onEditNameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onEditSave();
            if (e.key === 'Escape') onEditCancel();
          }}
          autoFocus
          maxLength={30}
        />
        {/* Inline colour picker for edit mode */}
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map(({ hex }) => (
            <button
              key={hex}
              type="button"
              onClick={() => onEditColorChange(hex)}
              className="relative"
            >
              <div
                className={`w-8 h-8 rounded-lg transition-all
                  ${editColor === hex ? 'scale-110' : 'opacity-60 hover:opacity-100'}`}
                style={{
                  backgroundColor: hex,
                  boxShadow: editColor === hex ? `0 0 0 2px white, 0 0 0 3px ${hex}` : undefined,
                }}
              />
              {editColor === hex && (
                <Check className="absolute inset-0 m-auto h-3.5 w-3.5 text-white" />
              )}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEditCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium
                       text-gray-600 bg-white hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onEditSave}
            disabled={editSaving || !editName.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium
                       text-white bg-blue-600 hover:bg-blue-700 transition-colors
                       disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {editSaving ? (
              <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Save
          </button>
        </div>
      </div>
    );
  }

  // Normal view
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      {/* Colour dot */}
      <div
        className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center"
        style={{ backgroundColor: label.color + '20' }}
      >
        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: label.color }} />
      </div>

      {/* Label chip preview */}
      <div className="flex-1 min-w-0">
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{
            backgroundColor: label.color + '18',
            color: label.color,
            border: `1px solid ${label.color}35`,
          }}
        >
          {label.name}
        </span>
      </div>

      {/* Actions — always visible on mobile (no opacity-0 hover trick) */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={onEditStart}
          className="w-9 h-9 flex items-center justify-center rounded-xl
                     text-gray-400 hover:text-blue-600 hover:bg-blue-50
                     transition-colors active:scale-95"
          aria-label="Edit label"
        >
          <Edit3 className="h-4 w-4" />
        </button>
        <button
          onClick={onDeleteRequest}
          className="w-9 h-9 flex items-center justify-center rounded-xl
                     text-gray-400 hover:text-red-600 hover:bg-red-50
                     transition-colors active:scale-95"
          aria-label="Delete label"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
