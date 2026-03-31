// import { useState, useEffect } from 'react';
// import api from '../api/axios';
// import {
//   AlertTriangle, X, Clock, AlertCircle,
//   Info, ChevronDown, ChevronUp, Bell
// } from 'lucide-react';

// const ALERT_ICONS = {
//   error:   { icon: AlertCircle,   color: '#f87171', bg: 'rgba(248,113,113,0.1)',   border: 'rgba(248,113,113,0.3)'   },
//   warning: { icon: AlertTriangle, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',    border: 'rgba(251,191,36,0.3)'    },
//   info:    { icon: Info,          color: '#6366f1', bg: 'rgba(99,102,241,0.1)',     border: 'rgba(99,102,241,0.3)'    },
// };

// const PRIORITY_COLORS = {
//   critical: '#f87171',
//   high:     '#fb923c',
//   medium:   '#fbbf24',
//   low:      '#4ade80',
// };

// function AlertItem({ alert, onDismiss }) {
//   const cfg = ALERT_ICONS[alert.type] || ALERT_ICONS.info;
//   const Icon = cfg.icon;

//   return (
//     <div style={{
//       display: 'flex',
//       alignItems: 'flex-start',
//       gap: '12px',
//       padding: '12px 14px',
//       background: cfg.bg,
//       border: `1px solid ${cfg.border}`,
//       borderLeft: `4px solid ${cfg.color}`,
//       borderRadius: '8px',
//       animation: 'slideIn 0.3s ease',
//     }}>
//       <Icon size={18} style={{ color: cfg.color, flexShrink: 0, marginTop: '1px' }} />
//       <div style={{ flex: 1, minWidth: 0 }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
//           <span style={{
//             fontSize: '13px',
//             fontWeight: '600',
//             color: 'var(--color-text-primary, #f0f0ff)',
//             overflow: 'hidden',
//             textOverflow: 'ellipsis',
//             whiteSpace: 'nowrap',
//           }}>
//             {alert.title}
//           </span>
//           <span style={{
//             fontSize: '10px',
//             fontWeight: '700',
//             padding: '1px 6px',
//             borderRadius: '10px',
//             background: `${PRIORITY_COLORS[alert.priority]}20`,
//             color: PRIORITY_COLORS[alert.priority],
//             flexShrink: 0,
//             textTransform: 'uppercase',
//           }}>
//             {alert.priority}
//           </span>
//         </div>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
//           <Clock size={12} style={{ color: cfg.color }} />
//           <span style={{ fontSize: '12px', color: cfg.color }}>
//             {alert.message}
//           </span>
//         </div>
//       </div>
//       <button
//         onClick={() => onDismiss(alert.id)}
//         style={{
//           background: 'none',
//           border: 'none',
//           color: 'var(--color-text-tertiary, #5a5a7a)',
//           cursor: 'pointer',
//           padding: '2px',
//           flexShrink: 0,
//           display: 'flex',
//           alignItems: 'center',
//         }}
//       >
//         <X size={14} />
//       </button>
//     </div>
//   );
// }

// export default function AlertBanner() {
//   const [alerts, setAlerts] = useState([]);
//   const [dismissed, setDismissed] = useState(() => {
//     try {
//       return JSON.parse(localStorage.getItem('dismissed_alerts') || '[]');
//     } catch { return []; }
//   });
//   const [collapsed, setCollapsed] = useState(false);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchAlerts();
//     // Refresh every 5 minutes
//     const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
//     return () => clearInterval(interval);
//   }, []);

//   const fetchAlerts = async () => {
//     try {
//       const res = await api.get('/tasks/alerts/');
//       setAlerts(res.data.alerts || []);
//     } catch (err) {
//       console.error('Failed to fetch alerts:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDismiss = (id) => {
//     const newDismissed = [...dismissed, id];
//     setDismissed(newDismissed);
//     localStorage.setItem('dismissed_alerts', JSON.stringify(newDismissed));
//   };

//   const handleDismissAll = () => {
//     const allIds = visibleAlerts.map(a => a.id);
//     const newDismissed = [...dismissed, ...allIds];
//     setDismissed(newDismissed);
//     localStorage.setItem('dismissed_alerts', JSON.stringify(newDismissed));
//   };

//   // Filter out dismissed alerts
//   const visibleAlerts = alerts.filter(a => !dismissed.includes(a.id));

//   // Counts by type
//   const errorCount   = visibleAlerts.filter(a => a.type === 'error').length;
//   const warningCount = visibleAlerts.filter(a => a.type === 'warning').length;
//   const infoCount    = visibleAlerts.filter(a => a.type === 'info').length;

//   if (loading || visibleAlerts.length === 0) return null;

//   return (
//     <>
//       <style>{`
//         @keyframes slideIn {
//           from { opacity: 0; transform: translateY(-8px); }
//           to   { opacity: 1; transform: translateY(0); }
//         }
//       `}</style>

//       <div style={{
//         background: 'var(--bg-card, #1a1a2e)',
//         border: '1px solid var(--border, #2a2a3e)',
//         borderRadius: '12px',
//         marginBottom: '24px',
//         overflow: 'hidden',
//       }}>
//         {/* Header */}
//         <div style={{
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'space-between',
//           padding: '12px 16px',
//           background: 'var(--bg-secondary, #13131f)',
//           borderBottom: collapsed ? 'none' : '1px solid var(--border, #2a2a3e)',
//           cursor: 'pointer',
//         }}
//           onClick={() => setCollapsed(!collapsed)}
//         >
//           <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//             <Bell size={16} style={{ color: '#fbbf24' }} />
//             <span style={{
//               fontSize: '14px',
//               fontWeight: '600',
//               color: 'var(--text-primary, #f0f0ff)',
//             }}>
//               Alerts
//             </span>

//             {/* Counts */}
//             <div style={{ display: 'flex', gap: '6px' }}>
//               {errorCount > 0 && (
//                 <span style={{
//                   fontSize: '11px', fontWeight: '700',
//                   padding: '1px 7px', borderRadius: '10px',
//                   background: 'rgba(248,113,113,0.15)',
//                   color: '#f87171',
//                 }}>
//                   {errorCount} overdue
//                 </span>
//               )}
//               {warningCount > 0 && (
//                 <span style={{
//                   fontSize: '11px', fontWeight: '700',
//                   padding: '1px 7px', borderRadius: '10px',
//                   background: 'rgba(251,191,36,0.15)',
//                   color: '#fbbf24',
//                 }}>
//                   {warningCount} due soon
//                 </span>
//               )}
//               {infoCount > 0 && (
//                 <span style={{
//                   fontSize: '11px', fontWeight: '700',
//                   padding: '1px 7px', borderRadius: '10px',
//                   background: 'rgba(99,102,241,0.15)',
//                   color: '#6366f1',
//                 }}>
//                   {infoCount} high priority
//                 </span>
//               )}
//             </div>
//           </div>

//           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//             <button
//               onClick={e => { e.stopPropagation(); handleDismissAll(); }}
//               style={{
//                 background: 'none',
//                 border: '1px solid var(--border, #2a2a3e)',
//                 color: 'var(--text-secondary, #8888aa)',
//                 padding: '4px 10px',
//                 borderRadius: '6px',
//                 fontSize: '12px',
//                 cursor: 'pointer',
//               }}
//             >
//               Dismiss all
//             </button>
//             {collapsed
//               ? <ChevronDown size={16} style={{ color: 'var(--text-secondary, #8888aa)' }} />
//               : <ChevronUp   size={16} style={{ color: 'var(--text-secondary, #8888aa)' }} />
//             }
//           </div>
//         </div>

//         {/* Alert List */}
//         {!collapsed && (
//           <div style={{
//             padding: '12px 16px',
//             display: 'flex',
//             flexDirection: 'column',
//             gap: '8px',
//             maxHeight: '280px',
//             overflowY: 'auto',
//           }}>
//             {visibleAlerts.map(alert => (
//               <AlertItem
//                 key={alert.id}
//                 alert={alert}
//                 onDismiss={handleDismiss}
//               />
//             ))}
//           </div>
//         )}
//       </div>
//     </>
//   );
// } 


import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  AlertTriangle, X, Clock, AlertCircle,
  Info, ChevronDown, ChevronUp, Bell
} from 'lucide-react';

const ALERT_ICONS = {
  error:   { icon: AlertCircle,   color: '#f87171', bg: 'rgba(248,113,113,0.1)',  border: 'rgba(248,113,113,0.3)'  },
  warning: { icon: AlertTriangle, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',   border: 'rgba(251,191,36,0.3)'   },
  info:    { icon: Info,          color: '#6366f1', bg: 'rgba(99,102,241,0.1)',    border: 'rgba(99,102,241,0.3)'   },
};

const PRIORITY_COLORS = {
  critical: '#f87171',
  high:     '#fb923c',
  medium:   '#fbbf24',
  low:      '#4ade80',
};

function AlertItem({ alert, onDismiss }) {
  const cfg = ALERT_ICONS[alert.type] || ALERT_ICONS.info;
  const Icon = cfg.icon;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '12px 14px',
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      borderLeft: `4px solid ${cfg.color}`,
      borderRadius: '8px',
      animation: 'slideIn 0.3s ease',
    }}>
      <Icon size={18} style={{ color: cfg.color, flexShrink: 0, marginTop: '1px' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '2px',
          flexWrap: 'wrap',
        }}>
          <span style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#f0f0ff',
          }}>
            {alert.title}
          </span>
          <span style={{
            fontSize: '10px',
            fontWeight: '700',
            padding: '1px 6px',
            borderRadius: '10px',
            background: `${PRIORITY_COLORS[alert.priority]}20`,
            color: PRIORITY_COLORS[alert.priority],
            flexShrink: 0,
            textTransform: 'uppercase',
          }}>
            {alert.priority}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Clock size={12} style={{ color: cfg.color }} />
          <span style={{ fontSize: '12px', color: cfg.color }}>
            {alert.message}
          </span>
        </div>
      </div>
      <button
        onClick={() => onDismiss(alert.id)}
        style={{
          background: 'none',
          border: 'none',
          color: '#5a5a7a',
          cursor: 'pointer',
          padding: '2px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          fontSize: '16px',
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  );
}

export default function AlertBanner() {
  const [alerts, setAlerts] = useState([]);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dismissed_alerts') || '[]');
    } catch { return []; }
  });
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/tasks/alerts/');
      console.log('Alerts fetched:', res.data);
      setAlerts(res.data.alerts || []);
    } catch (err) {
      console.error('Alert fetch failed:', err.response?.status, err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = (id) => {
    const newDismissed = [...dismissed, id];
    setDismissed(newDismissed);
    localStorage.setItem('dismissed_alerts', JSON.stringify(newDismissed));
  };

  const handleDismissAll = () => {
    const allIds = visibleAlerts.map(a => a.id);
    const newDismissed = [...dismissed, ...allIds];
    setDismissed(newDismissed);
    localStorage.setItem('dismissed_alerts', JSON.stringify(newDismissed));
  };

  const visibleAlerts = alerts.filter(a => !dismissed.includes(a.id));

  const errorCount   = visibleAlerts.filter(a => a.type === 'error').length;
  const warningCount = visibleAlerts.filter(a => a.type === 'warning').length;
  const infoCount    = visibleAlerts.filter(a => a.type === 'info').length;

  if (loading || visibleAlerts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{
        background: '#1a1a2e',
        border: '1px solid #2a2a3e',
        borderRadius: '12px',
        marginBottom: '24px',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: '#13131f',
            borderBottom: collapsed ? 'none' : '1px solid #2a2a3e',
            cursor: 'pointer',
          }}
          onClick={() => setCollapsed(!collapsed)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell size={16} style={{ color: '#fbbf24' }} />
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#f0f0ff',
            }}>
              Alerts
            </span>

            {errorCount > 0 && (
              <span style={{
                fontSize: '11px', fontWeight: '700',
                padding: '1px 7px', borderRadius: '10px',
                background: 'rgba(248,113,113,0.15)',
                color: '#f87171',
              }}>
                {errorCount} overdue
              </span>
            )}
            {warningCount > 0 && (
              <span style={{
                fontSize: '11px', fontWeight: '700',
                padding: '1px 7px', borderRadius: '10px',
                background: 'rgba(251,191,36,0.15)',
                color: '#fbbf24',
              }}>
                {warningCount} due soon
              </span>
            )}
            {infoCount > 0 && (
              <span style={{
                fontSize: '11px', fontWeight: '700',
                padding: '1px 7px', borderRadius: '10px',
                background: 'rgba(99,102,241,0.15)',
                color: '#6366f1',
              }}>
                {infoCount} high priority
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={e => { e.stopPropagation(); handleDismissAll(); }}
              style={{
                background: 'none',
                border: '1px solid #2a2a3e',
                color: '#8888aa',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Dismiss all
            </button>
            {collapsed
              ? <ChevronDown size={16} style={{ color: '#8888aa' }} />
              : <ChevronUp   size={16} style={{ color: '#8888aa' }} />
            }
          </div>
        </div>

        {/* Alert List */}
        {!collapsed && (
          <div style={{
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: '300px',
            overflowY: 'auto',
          }}>
            {visibleAlerts.map(alert => (
              <AlertItem
                key={alert.id}
                alert={alert}
                onDismiss={handleDismiss}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
