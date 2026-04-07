import { Plus, Trash2, StickyNote } from 'lucide-react';
import { useState } from 'react';
import api from '../../services/api';
import { formatFullDate } from '../../utils/format';

export default function NotesPanel({ applicationId, notes = [], onUpdate }) {
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const handleAdd = async () => {
    if (!text.trim()) return;
    try {
      setSaving(true);
      await api.post(`/api/applications/${applicationId}/notes`, { content: text.trim() });
      setText('');
      onUpdate?.();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (noteId) => {
    try {
      setDeleting(noteId);
      await api.delete(`/api/applications/${applicationId}/notes/${noteId}`);
      onUpdate?.();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <StickyNote className="h-4 w-4 text-yellow-500" />
        <span className="text-sm font-semibold text-gray-700">Notes</span>
      </div>

      {notes.length > 0 ? (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {notes.map((note) => (
            <div
              key={note._id}
              className="flex items-start gap-2 p-2.5 bg-yellow-50 rounded-lg border border-yellow-100 group"
            >
              <p className="flex-1 text-xs text-gray-700 leading-relaxed">{note.content}</p>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <button
                  onClick={() => handleDelete(note._id)}
                  disabled={deleting === note._id}
                  className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <span className="text-xs text-gray-400">{formatFullDate(note.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400 italic">No notes yet</p>
      )}

      {/* Add note */}
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAdd()}
          placeholder="Add a note…"
          className="input-field text-xs py-1.5"
        />
        <button
          onClick={handleAdd}
          disabled={saving || !text.trim()}
          className="btn-primary text-xs py-1.5 px-3"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
