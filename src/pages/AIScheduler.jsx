import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  Sparkles, RefreshCw, Lightbulb, AlertTriangle
} from 'lucide-react';

export default function AIScheduler() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [schedule, setSchedule] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [rescheduled, setRescheduled] = useState(null);
  const [missedDays, setMissedDays] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('schedule');

  useEffect(() => {
    api.get('/projects/').then(r => setProjects(r.data));
  }, []);

  const generateSchedule = async () => {
    setLoading(true);
    try {
      const res = await api.post('/ai/generate-schedule/', {
        project_id: selectedProject || null
      });
      setSchedule(res.data.schedule);
    } catch (err) {
      alert(err.response?.data?.error || 'AI generation failed');
    } finally {
      setLoading(false);
    }
  };

  const reschedule = async () => {
    setLoading(true);
    try {
      const res = await api.post('/ai/reschedule/', {
        missed_days: missedDays,
        project_id: selectedProject || null
      });
      setRescheduled(res.data.rescheduled);
    } catch (err) {
      alert(err.response?.data?.error || 'Reschedule failed');
    } finally {
      setLoading(false);
    }
  };

  const getPrioritySuggestions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ai/priority-suggestions/');
      setSuggestions(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Suggestions failed');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'schedule', label: 'Generate Schedule', icon: Sparkles },
    { key: 'reschedule', label: 'Reschedule', icon: RefreshCw },
    { key: 'suggestions', label: 'Priority Tips', icon: Lightbulb },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>AI Scheduler</h1>
          <p className="page-subtitle">Let AI plan your workday intelligently</p>
        </div>
      </div>

      <div className="ai-controls">
        <select
          value={selectedProject}
          onChange={e => setSelectedProject(e.target.value)}
          className="project-select"
        >
          <option value="">All Projects</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>

      <div className="tab-bar">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`tab-btn ${tab === key ? 'active' : ''}`}
            onClick={() => setTab(key)}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* Generate Schedule Tab */}
      {tab === 'schedule' && (
        <div className="ai-tab-content">
          <div className="ai-action-card">
            <h3>Generate Daily Schedule</h3>
            <p>AI will analyze your tasks and create an optimized daily
              schedule based on priorities and deadlines.</p>
            <button
              className="btn-primary"
              onClick={generateSchedule}
              disabled={loading}
            >
              <Sparkles size={18} />
              {loading ? 'Generating...' : 'Generate Schedule'}
            </button>
          </div>

          {schedule && (
            <div className="schedule-result">
              <p className="schedule-summary">{schedule.summary}</p>

              {schedule.risk_assessment && (
                <div className="risk-alert">
                  <AlertTriangle size={16} />
                  {schedule.risk_assessment}
                </div>
              )}

              {schedule.schedule?.map((day, i) => (
                <div key={i} className="schedule-day">
                  <h4>
                    {day.day_label}
                    <span>({day.total_hours}h)</span>
                  </h4>
                  <p className="focus-note">{day.focus_note}</p>
                  {day.tasks.map((t, j) => (
                    <div key={j} className="schedule-task">
                      <span className={`priority-badge priority-${t.priority === 'high' ? 'orange' : 'yellow'}`}>
                        {t.priority}
                      </span>
                      <div>
                        <strong>{t.task_title}</strong>
                        <p>{t.time_slot} · {t.duration_hours}h · {t.goal}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {schedule.productivity_tips?.length > 0 && (
                <div className="tips-section">
                  <h4>💡 Productivity Tips</h4>
                  {schedule.productivity_tips.map((tip, i) => (
                    <p key={i}>• {tip}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Reschedule Tab */}
      {tab === 'reschedule' && (
        <div className="ai-tab-content">
          <div className="ai-action-card">
            <h3>Reschedule After Missed Days</h3>
            <p>AI will intelligently redistribute your remaining tasks
              after missed work days.</p>
            <div className="missed-days-input">
              <label>Days missed:</label>
              <input
                type="number"
                min="1"
                max="14"
                value={missedDays}
                onChange={e => setMissedDays(e.target.value)}
              />
            </div>
            <button
              className="btn-primary"
              onClick={reschedule}
              disabled={loading}
            >
              <RefreshCw size={18} />
              {loading ? 'Rescheduling...' : 'Reschedule Tasks'}
            </button>
          </div>

          {rescheduled && (
            <div className="schedule-result">
              <p className="schedule-summary">{rescheduled.summary}</p>
              {rescheduled.deadline_risks?.map((risk, i) => (
                <div key={i} className="risk-alert">
                  <AlertTriangle size={16} /> {risk}
                </div>
              ))}
              {rescheduled.revised_schedule?.map((day, i) => (
                <div key={i} className="schedule-day">
                  <h4>{day.date}</h4>
                  <p className="focus-note">{day.catch_up_note}</p>
                  {day.tasks.map((t, j) => (
                    <div key={j} className="schedule-task">
                      <div>
                        <strong>{t.task_title}</strong>
                        <p>{t.time_slot} · {t.adjustment_note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              {rescheduled.recommendations?.map((r, i) => (
                <p key={i} className="recommendation">✅ {r}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Priority Suggestions Tab */}
      {tab === 'suggestions' && (
        <div className="ai-tab-content">
          <div className="ai-action-card">
            <h3>AI Priority Suggestions</h3>
            <p>Get AI-powered recommendations on how to prioritize
              your current tasks.</p>
            <button
              className="btn-primary"
              onClick={getPrioritySuggestions}
              disabled={loading}
            >
              <Lightbulb size={18} />
              {loading ? 'Analyzing...' : 'Get Suggestions'}
            </button>
          </div>

          {suggestions && (
            <div className="schedule-result">
              <p className="schedule-summary">
                {suggestions.overall_recommendation}
              </p>
              {suggestions.suggestions?.map((s, i) => (
                <div key={i} className="suggestion-card">
                  <div className="suggestion-header">
                    <strong>{s.task_title}</strong>
                    <span className={`priority-badge priority-${s.suggested_priority === 'high' ? 'orange' : 'yellow'}`}>
                      → {s.suggested_priority}
                    </span>
                    <span className="urgency-score">
                      Urgency: {s.urgency_score}/10
                    </span>
                  </div>
                  <p>{s.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}