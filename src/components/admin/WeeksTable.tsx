import { useState } from 'react';
import type { Week } from '../../types';
import { useTracker } from '../../store/TrackerContext';

export function WeeksTable() {
  const { state, dispatch } = useTracker();
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Week>>({});
  const [showAdd, setShowAdd] = useState(false);
  const nextNum = state.weeks.length + 1;
  const [newForm, setNewForm] = useState({ label: '', startDate: '', endDate: '', note: '' });

  const startEdit = (week: Week) => {
    setEditId(week.id);
    setEditForm({ ...week });
  };

  const saveEdit = () => {
    if (editId) {
      dispatch({ type: 'UPDATE_WEEK', payload: { id: editId, updates: editForm } });
      setEditId(null);
    }
  };

  const handleDelete = (id: string) => {
    const taskCount = state.tasks.filter((t) => t.weekId === id).length;
    if (confirm(`Delete week and its ${taskCount} task(s)?`)) {
      dispatch({ type: 'DELETE_WEEK', payload: id });
    }
  };

  const handleAdd = () => {
    if (!newForm.startDate || !newForm.endDate) return;
    dispatch({
      type: 'ADD_WEEK',
      payload: {
        id: `w${nextNum}`,
        number: nextNum,
        label: newForm.label.trim() || `Week ${nextNum}`,
        startDate: newForm.startDate,
        endDate: newForm.endDate,
        note: newForm.note.trim() || undefined,
      },
    });
    setNewForm({ label: '', startDate: '', endDate: '', note: '' });
    setShowAdd(false);
  };

  return (
    <div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Label</th>
            <th>Start</th>
            <th>End</th>
            <th>Note</th>
            <th>Tasks</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {state.weeks.map((w) => (
            <tr key={w.id}>
              {editId === w.id ? (
                <>
                  <td>{w.number}</td>
                  <td><input className="form-input" value={editForm.label || ''} onChange={(e) => setEditForm({ ...editForm, label: e.target.value })} /></td>
                  <td><input className="form-input" type="date" value={editForm.startDate || ''} onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })} /></td>
                  <td><input className="form-input" type="date" value={editForm.endDate || ''} onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })} /></td>
                  <td><input className="form-input" value={editForm.note || ''} onChange={(e) => setEditForm({ ...editForm, note: e.target.value })} /></td>
                  <td>{state.tasks.filter((t) => t.weekId === w.id).length}</td>
                  <td className="admin-table__actions">
                    <button className="btn btn--accent btn--sm" onClick={saveEdit}>Save</button>
                    <button className="btn btn--ghost btn--sm" onClick={() => setEditId(null)}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>W{w.number}</td>
                  <td>{w.label}</td>
                  <td>{w.startDate}</td>
                  <td>{w.endDate}</td>
                  <td className="text-muted">{w.note || '—'}</td>
                  <td>{state.tasks.filter((t) => t.weekId === w.id).length}</td>
                  <td className="admin-table__actions">
                    <button className="btn btn--ghost btn--sm" onClick={() => startEdit(w)}>Edit</button>
                    <button className="btn btn--ghost btn--sm" style={{ color: 'var(--red)' }} onClick={() => handleDelete(w.id)}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {showAdd ? (
        <div className="flex gap-sm mt-md" style={{ alignItems: 'flex-end' }}>
          <input className="form-input" placeholder="Label" value={newForm.label} onChange={(e) => setNewForm({ ...newForm, label: e.target.value })} style={{ width: 120 }} />
          <input className="form-input" type="date" value={newForm.startDate} onChange={(e) => setNewForm({ ...newForm, startDate: e.target.value })} />
          <input className="form-input" type="date" value={newForm.endDate} onChange={(e) => setNewForm({ ...newForm, endDate: e.target.value })} />
          <input className="form-input" placeholder="Note" value={newForm.note} onChange={(e) => setNewForm({ ...newForm, note: e.target.value })} style={{ flex: 1 }} />
          <button className="btn btn--accent btn--sm" onClick={handleAdd}>Add</button>
          <button className="btn btn--ghost btn--sm" onClick={() => setShowAdd(false)}>Cancel</button>
        </div>
      ) : (
        <button className="btn btn--ghost btn--sm mt-md" onClick={() => setShowAdd(true)}>+ Add Week</button>
      )}
    </div>
  );
}
