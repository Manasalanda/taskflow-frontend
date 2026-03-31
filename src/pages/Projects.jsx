import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Trash2, Edit3, FolderOpen, Calendar } from 'lucide-react';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', start_date: '', end_date: ''
  });
  const [loading, setLoading] = useState(true);

  const fetchProjects = () => {
    api.get('/projects/')
      .then(r => setProjects(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(fetchProjects, []);

  const openCreate = () => {
    setEditItem(null);
    setForm({ title: '', description: '', start_date: '', end_date: '' });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditItem(p);
    setForm({
      title: p.title,
      description: p.description,
      start_date: p.start_date,
      end_date: p.end_date
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editItem) await api.put(`/projects/${editItem.id}/`, form);
    else await api.post('/projects/', form);
    setShowModal(false);
    fetchProjects();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this project?')) {
      await api.delete(`/projects/${id}/`);
      fetchProjects();
    }
  };

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p className="page-subtitle">{projects.length} projects total</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={18} /> New Project
        </button>
      </div>

      <div className="projects-grid">
        {projects.length === 0 ? (
          <div className="empty-state">
            <FolderOpen size={48} />
            <p>No projects yet. Create your first one!</p>
          </div>
        ) : projects.map(p => (
          <div key={p.id} className="project-card">
            <div className="project-card-header">
              <h3>{p.title}</h3>
              <div className="card-actions">
                <button onClick={() => openEdit(p)}>
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="danger"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <p className="project-desc">
              {p.description || 'No description'}
            </p>
            <div className="project-dates">
              <Calendar size={14} />
              <span>{p.start_date} → {p.end_date}</span>
            </div>
            <div className="progress-bar-container">
              <div
                className="progress-bar"
                style={{ width: `${p.progress_percentage}%` }}
              />
            </div>
            <div className="project-footer">
              <span>{p.completed_tasks}/{p.total_tasks} tasks</span>
              <span className="progress-text">{p.progress_percentage}%</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editItem ? 'Edit Project' : 'New Project'}</h2>
            <form onSubmit={handleSubmit} className="modal-form">
              <input
                placeholder="Project Title"
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
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={e => setForm({ ...form, start_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label>End Date</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={e => setForm({ ...form, end_date: e.target.value })}
                    required
                  />
                </div>
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