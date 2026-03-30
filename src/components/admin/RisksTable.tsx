import { useState } from 'react';
import type { Risk } from '../../types';
import { useTracker } from '../../store/TrackerContext';

export function RisksTable() {
  const { state, dispatch } = useTracker();
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Risk>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newForm, setNewForm] = useState({ title: '', description: '', severity: 'medium' as Risk['severity'], weekId: '', projectId: '' });

  const startEdit = (risk: Risk) => {
    setEditId(risk.id);
    setEditForm({ ...risk });
  };

  const saveEdit = () => {
    if (editId) {
      dispatch({ type: 'UPDATE_RISK', payload: { id: editId, updates: editForm } });
      setEditId(null);
    }
  };

  const handleAdd = () => {
    if (!newForm.title.trim()) return;
    dispatch({
      type: 'ADD_RISK',
      payload: {
        id: `risk-${Date.now()}`,
        title: newForm.title.trim(),
        description: newForm.description.trim(),
        severity: newForm.severity,
        status: 'open',
        weekId: newForm.weekId || state.weeks[0]?.id || 'w1',
        projectId: newForm.projectId || undefined,
      },
    });
    setNewForm({ title: '', description: '', severity: 'medium', weekId: '', projectId: '' });
    setShowAdd(false);
  };

  return (
    <div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Week</th>
            <th>Project</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {state.risks.map((r) => {
            const project = r.projectId ? state.projects.find((p) => p.id === r.projectId) : null;
            const week = state.weeks.find((w) => w.id === r.weekId);
            return (
              <tr key={r.id}>
                {editId === r.id ? (
                  <>
                    <td><input className="form-input" value={editForm.title || ''} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} /></td>
                    <td>
                      <select className="form-select" value={editForm.severity || 'medium'} onChange={(e) => setEditForm({ ...editForm, severity: e.target.value as Risk['severity'] })}>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </td>
                    <td>
                      <select className="form-select" value={editForm.status || 'open'} onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Risk['status'] })}>
                        <option value="open">Open</option>
                        <option value="mitigated">Mitigated</option>
                        <option value="closed">Closed</option>
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
                    <td>{r.title}</td>
                    <td><span className={`risk-summary__severity risk-summary__severity--${r.severity}`}>{r.severity}</span></td>
                    <td>{r.status}</td>
                    <td>{week ? `W${week.number}` : '—'}</td>
                    <td>{project?.shortName || '—'}</td>
                    <td className="admin-table__actions">
                      <button className="btn btn--ghost btn--sm" onClick={() => startEdit(r)}>Edit</button>
                      <button className="btn btn--ghost btn--sm" style={{ color: 'var(--red)' }} onClick={() => dispatch({ type: 'DELETE_RISK', payload: r.id })}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {showAdd ? (
        <div className="flex-col gap-sm mt-md">
          <div className="flex gap-sm">
            <input className="form-input" placeholder="Risk title" value={newForm.title} onChange={(e) => setNewForm({ ...newForm, title: e.target.value })} style={{ flex: 1 }} />
            <select className="form-select" value={newForm.severity} onChange={(e) => setNewForm({ ...newForm, severity: e.target.value as Risk['severity'] })} style={{ width: 100 }}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="flex gap-sm">
            <input className="form-input" placeholder="Description" value={newForm.description} onChange={(e) => setNewForm({ ...newForm, description: e.target.value })} style={{ flex: 1 }} />
            <select className="form-select" value={newForm.weekId} onChange={(e) => setNewForm({ ...newForm, weekId: e.target.value })} style={{ width: 80 }}>
              <option value="">Week</option>
              {state.weeks.map((w) => <option key={w.id} value={w.id}>W{w.number}</option>)}
            </select>
            <button className="btn btn--accent btn--sm" onClick={handleAdd}>Add</button>
            <button className="btn btn--ghost btn--sm" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <button className="btn btn--ghost btn--sm mt-md" onClick={() => setShowAdd(true)}>+ Add Risk</button>
      )}
    </div>
  );
}
