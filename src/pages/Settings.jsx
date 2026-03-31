import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Save } from 'lucide-react';

export default function Settings() {
  const { user, fetchProfile } = useAuth();
  const [form, setForm] = useState({
    work_hours_per_day: user?.work_hours_per_day || 8,
    preferred_working_time: user?.preferred_working_time || 'morning',
    max_tasks_per_day: user?.max_tasks_per_day || 5,
    break_interval_minutes: user?.break_interval_minutes || 60,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    await api.patch('/users/settings/', form);
    await fetchProfile();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const settings = [
    {
      field: 'work_hours_per_day',
      label: 'Work Hours Per Day',
      desc: 'How many hours you work daily',
      type: 'number', min: 1, max: 16
    },
    {
      field: 'max_tasks_per_day',
      label: 'Max Tasks Per Day',
      desc: 'Maximum tasks the AI will schedule daily',
      type: 'number', min: 1, max: 20
    },
    {
      field: 'break_interval_minutes',
      label: 'Break Interval (minutes)',
      desc: 'How often to take breaks',
      type: 'number', min: 15, max: 120, step: 15
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="page-subtitle">
            Customize your AI scheduling preferences
          </p>
        </div>
      </div>

      <div className="settings-card">
        <form onSubmit={handleSave} className="settings-form">
          <div className="settings-section">
            <h3>Work Schedule</h3>
            <div className="settings-grid">

              {settings.map(({ field, label, desc, type, min, max, step }) => (
                <div key={field} className="setting-item">
                  <label>{label}</label>
                  <p className="setting-desc">{desc}</p>
                  <input
                    type={type}
                    min={min}
                    max={max}
                    step={step}
                    value={form[field]}
                    onChange={e => setForm({ ...form, [field]: e.target.value })}
                  />
                </div>
              ))}

              <div className="setting-item">
                <label>Preferred Working Time</label>
                <p className="setting-desc">When you're most productive</p>
                <select
                  value={form.preferred_working_time}
                  onChange={e => setForm({
                    ...form,
                    preferred_working_time: e.target.value
                  })}
                >
                  <option value="morning">General Shift (9AM - 5PM)</option>
                  <option value="afternoon">Afternoon Shift (1PM - 10PM)</option>
                  <option value="evening">Night Shift (9PM - 6AM)</option>
                </select>
              </div>

              {/* <select
  value={form.preferred_working_time}
  onChange={e => setForm({
    ...form,
    preferred_working_time: e.target.value
  })}
>
  <option value="morning"> Morning Shift (9:00 AM – 4:00 PM)</option>
  <option value="afternoon"> Afternoon Shift (12:00 PM – 8:00 PM)</option>
  <option value="evening"> Evening Shift (4:00 PM – 12:00 AM)</option>
  <option value="night"> Night Shift (6:00 PM – 4:00 AM)</option>
  <option value="graveyard"> Graveyard Shift (11:00 PM – 7:00 AM)</option>
  <option value="early"> Early Shift (6:00 AM – 2:00 PM)</option>
  <option value="split"> Split Shift (8:00 AM – 12:00 PM & 4:00 PM – 8:00 PM)</option>
  <option value="flexible">  Flexible Hours</option>
</select> */}

            </div>
          </div>

          <div className="settings-footer">
            <button type="submit" className="btn-primary">
              <Save size={18} /> Save Settings
            </button>
            {saved && (
              <span className="saved-msg">✅ Settings saved!</span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}