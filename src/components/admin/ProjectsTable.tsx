import { useState } from 'react';
import type { Project, Priority } from '../../types';
import { useTracker } from '../../store/TrackerContext';
import { PRIORITY_CONFIG } from '../../data/constants';

export function ProjectsTable() {
  const { state, dispatch } = useTracker();
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Project>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', shortName: '', description: '', priority: 'normal' as Priority, color: '#6c8aff', isDeviceOnly: false });

  const startEdit = (project: Project) => {
    setEditId(project.id);
    setEditForm({ ...project });
  };

  const saveEdit = () => {
    if (editId && editForm.name?.trim()) {
      dispatch({ type: 'UPDATE_PROJECT', payload: { id: editId, updates: editForm } });
      setEditId(null);
    }
  };

  const handleDelete = (id: string) => {
    const taskCount = state.tasks.filter((t) => t.projectId === id).length;
    if (confirm(`Delete project and its ${taskCount} task(s)?`)) {
      dispatch({ type: 'DELETE_PROJECT', payload: id });
    }
  };

  const handleAdd = () => {
    if (!newForm.name.trim()) return;
    dispatch({
      type: 'ADD_PROJECT',
      payload: {
        id: `proj-${Date.now()}`,
        name: newForm.name.trim(),
        shortName: newForm.shortName.trim() || newForm.name.trim().slice(0, 10),
        description: newForm.description.trim(),
        priority: newForm.priority,
        owners: [],
        color: newForm.color,
        isDeviceOnly: newForm.isDeviceOnly,
      },
    });
    setNewForm({ name: '', shortName: '', description: '', priority: 'normal', color: '#6c8aff', isDeviceOnly: false });
    setShowAdd(false);
  };

  return (
    <div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Short Name</th>
            <th>Priority</th>
            <th>Color</th>
            <th>Device Only</th>
            <th>Tasks</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {state.projects.map((p) => (
            <tr key={p.id}>
              {editId === p.id ? (
                <>
                  <td><input className="form-input" value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></td>
                  <td><input className="form-input" value={editForm.shortName || ''} onChange={(e) => setEditForm({ ...editForm, shortName: e.target.value })} style={{ width: 80 }} /></td>
                  <td>
                    <select className="form-select" value={editForm.priority || 'normal'} onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as Priority })}>
                      {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((pr) => <option key={pr} value={pr}>{PRIORITY_CONFIG[pr].label}</option>)}
                    </select>
                  </td>
                  <td><input className="form-input" type="color" value={editForm.color || '#6c8aff'} onChange={(e) => setEditForm({ ...editForm, color: e.target.value })} style={{ width: 40, padding: 2 }} /></td>
                  <td><input type="checkbox" checked={editForm.isDeviceOnly || false} onChange={(e) => setEditForm({ ...editForm, isDeviceOnly: e.target.checked })} /></td>
                  <td>{state.tasks.filter((t) => t.projectId === p.id).length}</td>
                  <td className="admin-table__actions">
                    <button className="btn btn--accent btn--sm" onClick={saveEdit}>Save</button>
                    <button className="btn btn--ghost btn--sm" onClick={() => setEditId(null)}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{p.name}</td>
                  <td>{p.shortName}</td>
                  <td>{PRIORITY_CONFIG[p.priority]?.label}</td>
                  <td><span className="color-swatch" style={{ background: p.color }} /></td>
                  <td>{p.isDeviceOnly ? 'Yes' : 'No'}</td>
                  <td>{state.tasks.filter((t) => t.projectId === p.id).length}</td>
                  <td className="admin-table__actions">
                    <button className="btn btn--ghost btn--sm" onClick={() => startEdit(p)}>Edit</button>
                    <button className="btn btn--ghost btn--sm" style={{ color: 'var(--red)' }} onClick={() => handleDelete(p.id)}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {showAdd ? (
        <div className="flex gap-sm mt-md" style={{ alignItems: 'flex-end' }}>
          <input className="form-input" placeholder="Name" value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })} style={{ flex: 1 }} />
          <input className="form-input" placeholder="Short" value={newForm.shortName} onChange={(e) => setNewForm({ ...newForm, shortName: e.target.value })} style={{ width: 80 }} />
          <select className="form-select" value={newForm.priority} onChange={(e) => setNewForm({ ...newForm, priority: e.target.value as Priority })} style={{ width: 100 }}>
            {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((pr) => <option key={pr} value={pr}>{PRIORITY_CONFIG[pr].label}</option>)}
          </select>
          <input type="color" value={newForm.color} onChange={(e) => setNewForm({ ...newForm, color: e.target.value })} style={{ width: 40 }} />
          <button className="btn btn--accent btn--sm" onClick={handleAdd}>Add</button>
          <button className="btn btn--ghost btn--sm" onClick={() => setShowAdd(false)}>Cancel</button>
        </div>
      ) : (
        <button className="btn btn--ghost btn--sm mt-md" onClick={() => setShowAdd(true)}>+ Add Project</button>
      )}
    </div>
  );
}
