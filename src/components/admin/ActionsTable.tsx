import { useState } from 'react';
import type { ActionItem } from '../../types';
import { useTracker } from '../../store/TrackerContext';

export function ActionsTable() {
  const { state, dispatch } = useTracker();
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ActionItem>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newForm, setNewForm] = useState({ title: '', assigneeId: '', weekId: '', projectId: '' });

  const startEdit = (action: ActionItem) => {
    setEditId(action.id);
    setEditForm({ ...action });
  };

  const saveEdit = () => {
    if (editId) {
      dispatch({ type: 'UPDATE_ACTION', payload: { id: editId, updates: editForm } });
      setEditId(null);
    }
  };

  const handleAdd = () => {
    if (!newForm.title.trim()) return;
    dispatch({
      type: 'ADD_ACTION',
      payload: {
        id: `action-${Date.now()}`,
        title: newForm.title.trim(),
        assigneeId: newForm.assigneeId || undefined,
        weekId: newForm.weekId || state.weeks[0]?.id || 'w1',
        projectId: newForm.projectId || undefined,
        completed: false,
      },
    });
    setNewForm({ title: '', assigneeId: '', weekId: '', projectId: '' });
    setShowAdd(false);
  };

  return (
    <div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Done</th>
            <th>Title</th>
            <th>Assignee</th>
            <th>Week</th>
            <th>Project</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {state.actions.map((a) => {
            const person = a.assigneeId ? state.people.find((p) => p.id === a.assigneeId) : null;
            const project = a.projectId ? state.projects.find((p) => p.id === a.projectId) : null;
            const week = state.weeks.find((w) => w.id === a.weekId);
            return (
              <tr key={a.id}>
                {editId === a.id ? (
                  <>
                    <td><input type="checkbox" checked={editForm.completed || false} onChange={(e) => setEditForm({ ...editForm, completed: e.target.checked })} /></td>
                    <td><input className="form-input" value={editForm.title || ''} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} /></td>
                    <td>
                      <select className="form-select" value={editForm.assigneeId || ''} onChange={(e) => setEditForm({ ...editForm, assigneeId: e.target.value || undefined })}>
                        <option value="">None</option>
                        {state.people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </td>
                    <td>
                      <select className="form-select" value={editForm.weekId || ''} onChange={(e) => setEditForm({ ...editForm, weekId: e.target.value })}>
                        {state.weeks.map((w) => <option key={w.id} value={w.id}>W{w.number}</option>)}
                      </select>
                    </td>
                    <td>
                      <select className="form-select" value={editForm.projectId || ''} onChange={(e) => setEditForm({ ...editForm, projectId: e.target.value || undefined })}>
                        <option value="">None</option>
                        {state.projects.map((p) => <option key={p.id} value={p.id}>{p.shortName}</option>)}
                      </select>
                    </td>
                    <td className="admin-table__actions">
                      <button className="btn btn--accent btn--sm" onClick={saveEdit}>Save</button>
                      <button className="btn btn--ghost btn--sm" onClick={() => setEditId(null)}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>
                      <input type="checkbox" checked={a.completed} onChange={() => dispatch({ type: 'TOGGLE_ACTION', payload: a.id })} />
                    </td>
                    <td style={{ textDecoration: a.completed ? 'line-through' : undefined }}>{a.title}</td>
                    <td>{person?.name || '—'}</td>
                    <td>{week ? `W${week.number}` : '—'}</td>
                    <td>{project?.shortName || '—'}</td>
                    <td className="admin-table__actions">
                      <button className="btn btn--ghost btn--sm" onClick={() => startEdit(a)}>Edit</button>
                      <button className="btn btn--ghost btn--sm" style={{ color: 'var(--red)' }} onClick={() => dispatch({ type: 'DELETE_ACTION', payload: a.id })}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {showAdd ? (
        <div className="flex gap-sm mt-md" style={{ alignItems: 'flex-end' }}>
          <input className="form-input" placeholder="Action item title" value={newForm.title} onChange={(e) => setNewForm({ ...newForm, title: e.target.value })} style={{ flex: 1 }} />
          <select className="form-select" value={newForm.assigneeId} onChange={(e) => setNewForm({ ...newForm, assigneeId: e.target.value })} style={{ width: 140 }}>
            <option value="">Unassigned</option>
            {state.people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select className="form-select" value={newForm.weekId} onChange={(e) => setNewForm({ ...newForm, weekId: e.target.value })} style={{ width: 80 }}>
            <option value="">Week</option>
            {state.weeks.map((w) => <option key={w.id} value={w.id}>W{w.number}</option>)}
          </select>
          <button className="btn btn--accent btn--sm" onClick={handleAdd}>Add</button>
          <button className="btn btn--ghost btn--sm" onClick={() => setShowAdd(false)}>Cancel</button>
        </div>
      ) : (
        <button className="btn btn--ghost btn--sm mt-md" onClick={() => setShowAdd(true)}>+ Add Action</button>
      )}
    </div>
  );
}
