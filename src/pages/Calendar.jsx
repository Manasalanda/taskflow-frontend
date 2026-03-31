import { useState, useEffect } from 'react';
import api from '../api/axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarView() {
  const [tasks, setTasks] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    api.get('/tasks/').then(r => setTasks(r.data));
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];

  const getTasksForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter(t => t.deadline && t.deadline.startsWith(dateStr));
  };

  const isToday = (day) => {
    const now = new Date();
    return (
      now.getDate() === day &&
      now.getMonth() === month &&
      now.getFullYear() === year
    );
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Calendar</h1>
          <p className="page-subtitle">Task deadlines at a glance</p>
        </div>
      </div>

      <div className="calendar-card">
        <div className="calendar-nav">
          <button onClick={() => setCurrentDate(new Date(year, month - 1))}>
            <ChevronLeft />
          </button>
          <h2>{monthNames[month]} {year}</h2>
          <button onClick={() => setCurrentDate(new Date(year, month + 1))}>
            <ChevronRight />
          </button>
        </div>

        <div className="calendar-grid">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="calendar-header-cell">{d}</div>
          ))}

          {Array(firstDay).fill(null).map((_, i) => (
            <div key={`empty-${i}`} className="calendar-cell empty" />
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const dayTasks = getTasksForDay(day);
            return (
              <div
                key={day}
                className={`calendar-cell 
                  ${isToday(day) ? 'today' : ''} 
                  ${dayTasks.length > 0 ? 'has-tasks' : ''}`}
              >
                <span className="day-number">{day}</span>
                {dayTasks.slice(0, 2).map(t => (
                  <div
                    key={t.id}
                    className="cal-task"
                    title={t.title}
                  >
                    {t.title.length > 12
                      ? t.title.slice(0, 12) + '...'
                      : t.title}
                  </div>
                ))}
                {dayTasks.length > 2 && (
                  <div className="cal-more">
                    +{dayTasks.length - 2} more
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}