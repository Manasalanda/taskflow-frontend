// import { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
// import api from '../api/axios';
// import AlertBanner from '../components/AlertBanner';
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid,
//   Tooltip, ResponsiveContainer, PieChart, Pie, Cell
// } from 'recharts';
// import {
//   CheckCircle, Clock, AlertTriangle,
//   TrendingUp, Zap, Target
// } from 'lucide-react';

// const COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#ef4444'];

// export default function Dashboard() {
//   const { user } = useAuth();
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     api.get('/tasks/dashboard_stats/')
//       .then(res => setStats(res.data))
//       .catch(console.error)
//       .finally(() => setLoading(false));
//   }, []);

//   if (loading) return (
//     <div className="page-loading">Loading dashboard...</div>
//   );
//   if (!stats) return (
//     <div className="page-error">Failed to load stats.</div>
//   );

//   const pieData = [
//     { name: 'Completed', value: stats.completed },
//     { name: 'In Progress', value: stats.in_progress },
//     { name: 'Pending', value: stats.pending },
//     { name: 'Overdue', value: stats.overdue },
//   ].filter(d => d.value > 0);

//   const statCards = [
//     { label: 'Total Tasks', value: stats.total, icon: Target, color: 'blue' },
//     { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'green' },
//     { label: 'In Progress', value: stats.in_progress, icon: Clock, color: 'yellow' },
//     { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'red' },
//   ];

//   return (
//     <div className="page">
      
//       <div className="page-header">
//         <div>
//           <h1>Welcome, {user?.username} 👋</h1>
//           <p className="page-subtitle">Here's your productivity overview</p>
//         </div>
//         <div className="productivity-badge">
//           <Zap size={16} />
//           <span>Score: {stats.productivity_score}%</span>
//         </div>
//       </div>

//       <div className="stats-grid">
//         {statCards.map(({ label, value, icon: Icon, color }) => (
//           <div key={label} className={`stat-card stat-${color}`}>
//             <div className="stat-icon"><Icon size={24} /></div>
//             <div>
//               <p className="stat-label">{label}</p>
//               <p className="stat-value">{value}</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="charts-grid">
//         <div className="chart-card">
//           <h3>Monthly Progress</h3>
//           <ResponsiveContainer width="100%" height={220}>
//             <BarChart data={stats.monthly_breakdown}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
//               <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8888aa' }} />
//               <YAxis tick={{ fontSize: 12, fill: '#8888aa' }} />
//               <Tooltip
//                 contentStyle={{
//                   background: '#1e1e2e',
//                   border: 'none',
//                   borderRadius: 8,
//                   color: '#f0f0ff'
//                 }}
//               />
//               <Bar dataKey="completed" fill="#6366f1" radius={[4, 4, 0, 0]} />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//         <div className="chart-card">
//           <h3>Task Distribution</h3>
//           {pieData.length > 0 ? (
//             <ResponsiveContainer width="100%" height={220}>
//               <PieChart>
//                 <Pie
//                   data={pieData}
//                   cx="50%"
//                   cy="50%"
//                   innerRadius={60}
//                   outerRadius={90}
//                   dataKey="value"
//                   label={({ name, value }) => `${name}: ${value}`}
//                 >
//                   {pieData.map((_, i) => (
//                     <Cell key={i} fill={COLORS[i % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip
//                   contentStyle={{
//                     background: '#1e1e2e',
//                     border: 'none',
//                     borderRadius: 8
//                   }}
//                 />
//               </PieChart>
//             </ResponsiveContainer>
//           ) : (
//             <p className="no-data">No task data yet</p>
//           )}
//         </div>
//       </div>

//       <div className="quick-stats">
//         <div className="quick-stat">
//           <TrendingUp size={20} />
//           <span>{stats.due_today} tasks due today</span>
//         </div>
//         <div className="quick-stat">
//           <AlertTriangle size={20} />
//           <span>{stats.high_priority} high priority tasks</span>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import AlertBanner from '../components/AlertBanner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  CheckCircle, Clock, AlertTriangle,
  TrendingUp, Zap, Target
} from 'lucide-react';

const COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dismissed_alerts') || '[]');
    } catch { return []; }
  });
  const [alertsCollapsed, setAlertsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks/dashboard_stats/')
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/tasks/alerts/');
      console.log('Alerts:', res.data);
      setAlerts(res.data.alerts || []);
    } catch (err) {
      console.error('Alerts error:', err.response?.status, err.message);
    }
  };

  const handleDismiss = (id) => {
    const updated = [...dismissed, id];
    setDismissed(updated);
    localStorage.setItem('dismissed_alerts', JSON.stringify(updated));
  };

  const handleDismissAll = () => {
    const allIds = visibleAlerts.map(a => a.id);
    const updated = [...dismissed, ...allIds];
    setDismissed(updated);
    localStorage.setItem('dismissed_alerts', JSON.stringify(updated));
  };

  const visibleAlerts = alerts.filter(a => !dismissed.includes(a.id));
  const errorCount   = visibleAlerts.filter(a => a.type === 'error').length;
  const warningCount = visibleAlerts.filter(a => a.type === 'warning').length;
  const infoCount    = visibleAlerts.filter(a => a.type === 'info').length;

  const PRIORITY_COLORS = {
    critical: '#f87171',
    high: '#fb923c',
    medium: '#fbbf24',
    low: '#4ade80',
  };

  const ALERT_STYLES = {
    error:   { color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.25)' },
    warning: { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.25)'  },
    info:    { color: '#6366f1', bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.25)'  },
  };

  if (loading) return <div className="page-loading">Loading dashboard...</div>;
  if (!stats)  return <div className="page-error">Failed to load stats.</div>;

  const pieData = [
    { name: 'Completed', value: stats.completed },
    { name: 'In Progress', value: stats.in_progress },
    { name: 'Pending', value: stats.pending },
    { name: 'Overdue', value: stats.overdue },
  ].filter(d => d.value > 0);

  const statCards = [
    { label: 'Total Tasks',  value: stats.total,       icon: Target,        color: 'blue'   },
    { label: 'Completed',    value: stats.completed,   icon: CheckCircle,   color: 'green'  },
    { label: 'In Progress',  value: stats.in_progress, icon: Clock,         color: 'yellow' },
    { label: 'Overdue',      value: stats.overdue,     icon: AlertTriangle, color: 'red'    },
  ];

  return (
    <div className="page">

      {/* ── ALERT BANNER ── */}
      {visibleAlerts.length > 0 && (
        <div style={{
          background: '#1a1a2e',
          border: '1px solid #2a2a3e',
          borderRadius: '12px',
          marginBottom: '24px',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div
            onClick={() => setAlertsCollapsed(!alertsCollapsed)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: '#13131f',
              borderBottom: alertsCollapsed ? 'none' : '1px solid #2a2a3e',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Bell icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#f0f0ff' }}>
                Alerts
              </span>
              {errorCount > 0 && (
                <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px',
                  borderRadius: '10px', background: 'rgba(248,113,113,0.15)', color: '#f87171' }}>
                  {errorCount} overdue
                </span>
              )}
              {warningCount > 0 && (
                <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px',
                  borderRadius: '10px', background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>
                  {warningCount} due soon
                </span>
              )}
              {infoCount > 0 && (
                <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px',
                  borderRadius: '10px', background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}>
                  {infoCount} high priority
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={e => { e.stopPropagation(); handleDismissAll(); }}
                style={{
                  background: 'none', border: '1px solid #2a2a3e',
                  color: '#8888aa', padding: '3px 10px',
                  borderRadius: '6px', fontSize: '12px', cursor: 'pointer',
                }}
              >
                Dismiss all
              </button>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="#8888aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: alertsCollapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <polyline points="18 15 12 9 6 15"/>
              </svg>
            </div>
          </div>

          {/* Alert items */}
          {!alertsCollapsed && (
            <div style={{
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              maxHeight: '300px',
              overflowY: 'auto',
            }}>
              {visibleAlerts.map(alert => {
                const s = ALERT_STYLES[alert.type] || ALERT_STYLES.info;
                return (
                  <div key={alert.id} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '11px 13px',
                    background: s.bg,
                    border: `1px solid ${s.border}`,
                    borderLeft: `4px solid ${s.color}`,
                    borderRadius: '8px',
                    animation: 'slideInAlert 0.3s ease',
                  }}>
                    {/* Icon */}
                    {alert.type === 'error' && (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                        stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        style={{ flexShrink: 0, marginTop: '1px' }}>
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                    )}
                    {alert.type === 'warning' && (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                        stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        style={{ flexShrink: 0, marginTop: '1px' }}>
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                    )}
                    {alert.type === 'info' && (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                        stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        style={{ flexShrink: 0, marginTop: '1px' }}>
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="16" x2="12" y2="12"/>
                        <line x1="12" y1="8" x2="12.01" y2="8"/>
                      </svg>
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex', alignItems: 'center',
                        gap: '8px', marginBottom: '3px', flexWrap: 'wrap',
                      }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#f0f0ff' }}>
                          {alert.title}
                        </span>
                        <span style={{
                          fontSize: '10px', fontWeight: '700',
                          padding: '1px 6px', borderRadius: '10px',
                          background: `${PRIORITY_COLORS[alert.priority]}22`,
                          color: PRIORITY_COLORS[alert.priority],
                          textTransform: 'uppercase', flexShrink: 0,
                        }}>
                          {alert.priority}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                          stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <span style={{ fontSize: '12px', color: s.color }}>
                          {alert.message}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDismiss(alert.id)}
                      style={{
                        background: 'none', border: 'none',
                        color: '#5a5a7a', cursor: 'pointer',
                        fontSize: '18px', lineHeight: 1,
                        flexShrink: 0, padding: '0 2px',
                      }}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── PAGE HEADER ── */}
      <div className="page-header">
        <div>
          <h1>Welcome, {user?.username} 👋</h1>
          <p className="page-subtitle">Here's your productivity overview</p>
        </div>
        <div className="productivity-badge">
          <Zap size={16} />
          <span>Score: {stats.productivity_score}%</span>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="stats-grid">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`stat-card stat-${color}`}>
            <div className="stat-icon"><Icon size={24} /></div>
            <div>
              <p className="stat-label">{label}</p>
              <p className="stat-value">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── CHARTS ── */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Monthly Progress</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.monthly_breakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8888aa' }} />
              <YAxis tick={{ fontSize: 12, fill: '#8888aa' }} />
              <Tooltip contentStyle={{
                background: '#1e1e2e', border: 'none',
                borderRadius: 8, color: '#f0f0ff'
              }} />
              <Bar dataKey="completed" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Task Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{
                  background: '#1e1e2e', border: 'none', borderRadius: 8
                }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data">No task data yet</p>
          )}
        </div>
      </div>

      {/* ── QUICK STATS ── */}
      <div className="quick-stats">
        <div className="quick-stat">
          <TrendingUp size={20} />
          <span>{stats.due_today} tasks due today</span>
        </div>
        <div className="quick-stat">
          <AlertTriangle size={20} />
          <span>{stats.high_priority} high priority tasks</span>
        </div>
      </div>

      <style>{`
        @keyframes slideInAlert {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}