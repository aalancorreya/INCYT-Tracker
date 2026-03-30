import { useTracker } from '../../store/TrackerContext';
import type { TaskStatus, Priority } from '../../types';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../../data/constants';

export function FilterBar() {
  const { state, filters, setFilters } = useTracker();

  const activeCount =
    filters.statuses.length +
    filters.priorities.length +
    filters.personIds.length;

  const toggleStatus = (status: TaskStatus) => {
    setFilters((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status],
    }));
  };

  const togglePriority = (priority: Priority) => {
    setFilters((prev) => ({
      ...prev,
      priorities: prev.priorities.includes(priority)
        ? prev.priorities.filter((p) => p !== priority)
        : [...prev.priorities, priority],
    }));
  };

  const togglePerson = (personId: string) => {
    setFilters((prev) => ({
      ...prev,
      personIds: prev.personIds.includes(personId)
        ? prev.personIds.filter((id) => id !== personId)
        : [...prev.personIds, personId],
    }));
  };

  const clearAll = () => {
    setFilters((prev) => ({
      ...prev,
      statuses: [],
      priorities: [],
      personIds: [],
    }));
  };

  return (
    <div className="filter-bar">
      {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((status) => (
        <button
          key={status}
          className={`filter-pill ${filters.statuses.includes(status) ? 'active' : ''}`}
          onClick={() => toggleStatus(status)}
        >
          {STATUS_CONFIG[status].label}
        </button>
      ))}

      <span className="topbar__separator" />

      {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((priority) => (
        <button
          key={priority}
          className={`filter-pill ${filters.priorities.includes(priority) ? 'active' : ''}`}
          onClick={() => togglePriority(priority)}
        >
          {PRIORITY_CONFIG[priority].label}
        </button>
      ))}

      <span className="topbar__separator" />

      {state.people.map((person) => (
        <button
          key={person.id}
          className={`filter-pill ${filters.personIds.includes(person.id) ? 'active' : ''}`}
          onClick={() => togglePerson(person.id)}
        >
          {person.initials}
        </button>
      ))}

      {activeCount > 0 && (
        <button className="filter-pill" onClick={clearAll}>
          Clear ({activeCount}) <span className="filter-pill__clear">x</span>
        </button>
      )}
    </div>
  );
}
