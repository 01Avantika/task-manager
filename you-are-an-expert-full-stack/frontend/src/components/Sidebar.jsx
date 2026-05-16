import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: 'grid' },
  { to: '/projects', label: 'Projects', icon: 'folder' },
  { to: '/tasks', label: 'Tasks', icon: 'check' },
  { to: '/team', label: 'Team', icon: 'team' },
  { to: '/analytics', label: 'Analytics', icon: 'chart' },
  { to: '/settings', label: 'Settings', icon: 'gear' },
];

function Icon({ name }) {
  const common = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8 };
  const paths = {
    grid: <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />,
    folder: <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z" />,
    check: <path d="M9 11l2 2 4-5M5 5h14v14H5z" />,
    team: <path d="M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3.5 20a4.5 4.5 0 0 1 9 0M11.5 19a4.5 4.5 0 0 1 9 0" />,
    chart: <path d="M4 19V5M8 17v-6M13 17V7M18 17v-3M3 19h18" />,
    gear: <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a7.7 7.7 0 0 0-1.7-1L14.5 3h-4l-.4 3.1a7.7 7.7 0 0 0-1.7 1l-2.4-1-2 3.4L6 11a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1a7.7 7.7 0 0 0 1.7 1l.4 3.1h4l.4-3.1a7.7 7.7 0 0 0 1.7-1l2.4 1 2-3.4-2-1.5a7 7 0 0 0 .1-1z" />,
    logout: <path d="M15 17l5-5-5-5M20 12H9M12 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const displayRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} shadow-[8px_0_28px_rgba(17,24,39,0.03)]`}>
      <div className="sidebar-top">
        <div className="brand-mark shadow-sm">TF</div>
        <div className="brand-copy">
          <strong>TaskFlow</strong>
          <span>Team workspace</span>
        </div>
        <button className="icon-btn" onClick={() => setCollapsed((value) => !value)} aria-label="Toggle sidebar">
          <Icon name="menu" />
        </button>
      </div>
      <nav className="sidebar-nav">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''} group`}>
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="mini-user">
          <span className="avatar">{user?.username?.slice(0, 2).toUpperCase() || 'U'}</span>
          <div>
            <strong>{user?.username || 'User'}</strong>
            <span>{displayRole}</span>
          </div>
        </div>
        <button className="sidebar-link logout" onClick={handleLogout}>
          <Icon name="logout" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
