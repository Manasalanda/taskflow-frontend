import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Trash2, Edit3, CheckSquare, Clock } from 'lucide-react';

const PRIORITY_COLORS = {
  low: 'green', medium: 'yellow', high: 'orange', critical: 'red'
};

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filters, setFilters] = useState({
    status: '', priority: '', project: ''
  });
  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium',
    status: 'pending', deadline: '',
    estimated_hours: 1, project: ''
  });

  const fetchAll = () => {
    const params = new URLSearchParams(
      Object.entries(filters).filter(([_, v]) => v)
    );
    api.get(`/tasks/?${params}`).then(r => setTasks(r.data));
    api.get('/projects/').then(r => setProjects(r.data));
  };

  useEffect(fetchAll, [filters]);

  const openCreate = () => {
    setEditItem(null);
    setForm({
      title: '', description: '', priority: 'medium',
      status: 'pending', deadline: '',
      estimated_hours: 1, project: ''
    });
    setShowModal(true);
  };

  const openEdit = (t) => {
    setEditItem(t);
    setForm({
      title: t.title,
      description: t.description,
      priority: t.priority,
      status: t.status,
      deadline: t.deadline ? t.deadline.slice(0, 16) : '',
      estimated_hours: t.estimated_hours,
      project: t.project || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, project: form.project || null };
    if (editItem) await api.put(`/tasks/${editItem.id}/`, data);
    else await api.post('/tasks/', data);
    setShowModal(false);
    fetchAll();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this task?')) {
      await api.delete(`/tasks/${id}/`);
      fetchAll();
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    await api.patch(`/tasks/${task.id}/`, { status: newStatus });
    fetchAll();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Tasks</h1>
          <p className="page-subtitle">{tasks.length} tasks found</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={18} /> New Task
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <select
          value={filters.status}
          onChange={e => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={filters.priority}
          onChange={e => setFilters({ ...filters, priority: e.target.value })}
        >
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>

        <select
          value={filters.project}
          onChange={e => setFilters({ ...filters, project: e.target.value })}
        >
          <option value="">All Projects</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>

      {/* Task List */}
      <div className="tasks-list">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <CheckSquare size={48} />
            <p>No tasks found.</p>
          </div>
        ) : tasks.map(task => (
          // <div
          //   key={task.id}
          //   className={`task-card ${task.is_overdue ? 'overdue' : ''}`}
          // >
               
          <div
              key={task.id}
              className={`task-card ${task.is_overdue ? 'overdue' : ''} ${task.status === 'completed' ? 'completed-task' : ''}`}
>

            <div className="task-card-left">
              <span className={`priority-badge priority-${PRIORITY_COLORS[task.priority]}`}>
                {task.priority}
              </span>
              <div>
                <h4>{task.title}</h4>
                <p>{task.description}</p>
                {task.project_title && (
                  <span className="project-tag">{task.project_title}</span>
                )}
              </div>
            </div>

            <div className="task-card-right">
              {/* <select
                value={task.status}
                onChange={e => handleStatusChange(task, e.target.value)}
                className={`status-select status-${task.status}`}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select> */}

              {task.status === 'completed' ? (
                   <span style={{
                   display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#4ade80',
                    background: 'rgba(74,222,128,0.12)',
                    border: '1px solid rgba(74,222,128,0.3)',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    whiteSpace: 'nowrap',
                   }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                   stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                   <polyline points="20 6 9 17 4 12"/>
                   </svg>
                  Completed
                  </span>
                  ) : (
                           <select
                           value={task.status}
                            onChange={e => handleStatusChange(task, e.target.value)}
                               className={`status-select status-${task.status}`}
                               >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            </select>
                           )}

              {task.deadline && (
                <span className={`deadline ${task.is_overdue ? 'overdue-text' : ''}`}>
                  <Clock size={12} />
                  {new Date(task.deadline).toLocaleDateString()}
                </span>
              )}

              {/* <div className="card-actions">
                <button onClick={() => openEdit(task)}>
                  <Edit3 size={15} />
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="danger"
                >
                  <Trash2 size={15} />
                </button>
              </div> */}


              <div className="card-actions">
              <button
                onClick={() => openEdit(task)}
                disabled={task.status === 'completed'}
                title={task.status === 'completed' ? 'Cannot edit a completed task' : 'Edit task'}
                style={{
                opacity: task.status === 'completed' ? 0.3 : 1,
                 cursor: task.status === 'completed' ? 'not-allowed' : 'pointer',
                }}
  >
              <Edit3 size={15} />
             </button>
              <button
            onClick={() => handleDelete(task.id)}
               className="danger"
               disabled={task.status === 'completed'}
                title={task.status === 'completed' ? 'Cannot delete a completed task' : 'Delete task'}
              style={{
         opacity: task.status === 'completed' ? 0.3 : 1,
           cursor: task.status === 'completed' ? 'not-allowed' : 'pointer',
    }}
  >
    <Trash2 size={15} />
  </button>
</div>

            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editItem ? 'Edit Task' : 'New Task'}</h2>
            <form onSubmit={handleSubmit} className="modal-form">
              <input
                placeholder="Task Title"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
              <div className="form-row">
                <div>
                  <label>Priority</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label>Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div>
                  <label>Deadline</label>
                  <input
                    type="datetime-local"
                    value={form.deadline}
                    onChange={e => setForm({ ...form, deadline: e.target.value })}
                  />
                </div>
                <div>
                  <label>Est. Hours</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={form.estimated_hours}
                    onChange={e => setForm({ ...form, estimated_hours: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label>Project</label>
                <select
                  value={form.project}
                  onChange={e => setForm({ ...form, project: e.target.value })}
                >
                  <option value="">No Project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}