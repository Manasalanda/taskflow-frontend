import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, FolderOpen, CheckSquare,
  Calendar, Sparkles, Settings, LogOut,
  Zap, Menu, X
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects',  icon: FolderOpen,      label: 'Projects'  },
  { to: '/tasks',     icon: CheckSquare,     label: 'Tasks'     },
  { to: '/calendar',  icon: Calendar,        label: 'Calendar'  },
  { to: '/ai-scheduler', icon: Sparkles,     label: 'AI Scheduler' },
  { to: '/settings',  icon: Settings,        label: 'Settings'  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* ── MOBILE TOP BAR ── */}
      {isMobile && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          height: '56px', background: '#13131f',
          borderBottom: '1px solid #2a2a3e',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px', zIndex: 300,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: '8px', color: '#6366f1',
          }}>
            <Zap size={20} />
            <span style={{
              fontSize: '16px', fontWeight: '700', color: '#f0f0ff'
            }}>
              TaskFlow AI
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid #6366f1',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: '700', color: '#6366f1',
            }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <button
              onClick={() => setOpen(!open)}
              style={{
                background: 'none', border: 'none',
                color: '#f0f0ff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', padding: '4px',
              }}
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      )}

      {/* ── DARK OVERLAY (mobile only) ── */}
      {isMobile && open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.65)',
            zIndex: 350,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: '240px',
        background: '#13131f',
        borderRight: '1px solid #2a2a3e',
        position: 'fixed',
        top: 0, left: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        zIndex: 400,
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        transform: isMobile
          ? open ? 'translateX(0)' : 'translateX(-100%)'
          : 'translateX(0)',
        overflowY: 'auto',
      }}>

        {/* Logo + close button */}
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '10px', padding: '0 8px 20px',
          borderBottom: '1px solid #2a2a3e',
          marginBottom: '12px',
        }}>
          <Zap size={24} color="#6366f1" />
          <span style={{
            fontSize: '18px', fontWeight: '700', color: '#f0f0ff', flex: 1,
          }}>
            TaskFlow AI
          </span>
          {isMobile && (
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'none', border: 'none',
                color: '#8888aa', cursor: 'pointer',
                display: 'flex', alignItems: 'center',
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* User info */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 8px', borderBottom: '1px solid #2a2a3e',
          marginBottom: '12px',
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid #6366f1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '15px', fontWeight: '700', color: '#6366f1',
            flexShrink: 0,
          }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{
              fontSize: '13px', fontWeight: '600', color: '#f0f0ff',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {user?.username}
            </p>
            <p style={{
              fontSize: '11px', color: '#5a5a7a',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {user?.email}
            </p>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{
          flex: 1, display: 'flex', flexDirection: 'column', gap: '2px',
        }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </aside>
    </>
  );
}
