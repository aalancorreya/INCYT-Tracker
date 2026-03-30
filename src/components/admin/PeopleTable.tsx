import { useState } from 'react';
import type { Person, Team } from '../../types';
import { useTracker } from '../../store/TrackerContext';

export function PeopleTable() {
  const { state, dispatch } = useTracker();
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Person>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', role: '', team: 'software' as Team, initials: '', color: '#6c8aff' });

  const startEdit = (person: Person) => {
    setEditId(person.id);
    setEditForm({ ...person });
  };

  const saveEdit = () => {
    if (editId && editForm.name?.trim()) {
      dispatch({ type: 'UPDATE_PERSON', payload: { id: editId, updates: editForm } });
      setEditId(null);
    }
  };

  const handleDelete = (id: string) => {
    const taskCount = state.tasks.filter((t) => t.assigneeId === id).length;
    if (confirm(`Delete person? ${taskCount} task(s) will be unassigned.`)) {
      dispatch({ type: 'DELETE_PERSON', payload: id });
    }
  };

  const handleAdd = () => {
    if (!newForm.name.trim()) return;
    const initials = newForm.initials.trim() || newForm.name.split(' ').map((w) => w[0]).join('').toUpperCase();
    dispatch({
      type: 'ADD_PERSON',
      payload: {
        id: `person-${Date.now()}`,
        name: newForm.name.trim(),
        role: newForm.role.trim(),
        team: newForm.team,
        initials,
        color: newForm.color,
      },
    });
    setNewForm({ name: '', role: '', team: 'software', initials: '', color: '#6c8aff' });
    setShowAdd(false);
  };

  return (
    <div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Team</th>
            <th>Initials</th>
            <th>Color</th>
            <th>Tasks</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {state.people.map((p) => (
            <tr key={p.id}>
              {editId === p.id ? (
                <>
                  <td><input className="form-input" value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></td>
                  <td><input className="form-input" value={editForm.role || ''} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} /></td>
                  <td>
                    <select className="form-select" value={editForm.team || 'software'} onChange={(e) => setEditForm({ ...editForm, team: e.target.value as Team })}>
                      <option value="software">Software</option>
                      <option value="device">Device</option>
                    </select>
                  </td>
                  <td><input className="form-input" value={editForm.initials || ''} onChange={(e) => setEditForm({ ...editForm, initials: e.target.value })} style={{ width: 50 }} /></td>
                  <td><input type="color" value={editForm.color || '#6c8aff'} onChange={(e) => setEditForm({ ...editForm, color: e.target.value })} style={{ width: 40 }} /></td>
                  <td>{state.tasks.filter((t) => t.assigneeId === p.id).length}</td>
                  <td className="admin-table__actions">
                    <button className="btn btn--accent btn--sm" onClick={saveEdit}>Save</button>
                    <button className="btn btn--ghost btn--sm" onClick={() => setEditId(null)}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{p.name}</td>
                  <td>{p.role}</td>
                  <td>{p.team}</td>
                  <td>{p.initials}</td>
                  <td><span className="color-swatch" style={{ background: p.color }} /></td>
                  <td>{state.tasks.filter((t) => t.assigneeId === p.id).length}</td>
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
          <input className="form-input" placeholder="Role" value={newForm.role} onChange={(e) => setNewForm({ ...newForm, role: e.target.value })} style={{ flex: 1 }} />
          <select className="form-select" value={newForm.team} onChange={(e) => setNewForm({ ...newForm, team: e.target.value as Team })} style={{ width: 100 }}>
            <option value="software">Software</option>
            <option value="device">Device</option>
          </select>
          <input type="color" value={newForm.color} onChange={(e) => setNewForm({ ...newForm, color: e.target.value })} style={{ width: 40 }} />
          <button className="btn btn--accent btn--sm" onClick={handleAdd}>Add</button>
          <button className="btn btn--ghost btn--sm" onClick={() => setShowAdd(false)}>Cancel</button>
        </div>
      ) : (
        <button className="btn btn--ghost btn--sm mt-md" onClick={() => setShowAdd(true)}>+ Add Person</button>
      )}
    </div>
  );
}
