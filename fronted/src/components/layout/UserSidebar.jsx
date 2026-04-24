import { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { BookOpen, Headphones, Home, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/dashboard',         icon: Home,       label: 'Home' },
  { to: '/dashboard/audio',   icon: Headphones, label: 'Audiobooks' },
  { to: '/dashboard/ebooks',  icon: BookOpen,   label: 'eBooks' },
  { to: '/dashboard/profile', icon: User,       label: 'My Profile' },
];

export default function UserSidebar({ open, setOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      {/* Overlay */}
      {open && <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }} />}

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">📚</div>
          <div>
            <div className="sidebar-logo-text">Joe Books</div>
            <div className="sidebar-logo-sub">Digital Library</div>
          </div>
          {open && <button onClick={() => setOpen(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>}
        </div>

        {/* User info */}
        <div style={{ padding: '0.75rem', marginBottom: '1rem', background: 'rgba(194,0,106,0.12)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(194,0,106,0.25)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/dashboard/profile" className="avatar avatar-sm avatar-initials" style={{ minWidth: 36, borderColor: 'var(--color-secondary)' }}>
            {user?.profilePhoto
              ? <img src={user.profilePhoto} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              : <span style={{ fontSize: '0.75rem' }}>{initials}</span>
            }
          </Link>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user?.phone}</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <span className="sidebar-section-label">Menu</span>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/dashboard'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setOpen(false)}>
              <Icon size={18} className="icon" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <button onClick={handleLogout} className="sidebar-link" style={{ marginTop: 'auto', border: 'none', background: 'none', textAlign: 'left', color: 'var(--danger)', width: '100%', cursor: 'pointer' }}>
          <LogOut size={18} className="icon" />
          Logout
        </button>
      </aside>
    </>
  );
}
