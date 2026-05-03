import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Book, Headphones, Users, CreditCard, Settings, LogOut, Menu, X, Upload, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/admin',             icon: LayoutDashboard, label: 'Overview',    end: true },
  { to: '/admin/books',       icon: BookOpen,        label: 'Books' },
  { to: '/admin/audiobooks',  icon: Headphones,      label: 'Audiobook' },
  { to: '/admin/ebooks',      icon: Book,            label: 'Ebooks' },
  { to: '/admin/upload-audiobook', icon: Upload,          label: 'Upload Audiobook' },
  { to: '/admin/upload-ebook',     icon: Upload,          label: 'Upload Ebook' },
  { to: '/admin/payments',    icon: CreditCard,      label: 'Payments' },
  { to: '/admin/users',       icon: Users,           label: 'Users' },
  { to: '/admin/analytics',   icon: Activity,        label: 'Traffic Analytics' },
];

export default function AdminSidebar({ open, setOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'A';

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      {open && <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }} />}

      <aside className={`sidebar ${open ? 'open' : ''}`} style={{ background: 'var(--bg-surface)' }}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon" style={{ background: 'var(--color-primary)' }}>⚙️</div>
          <div>
            <div className="sidebar-logo-text">Admin Panel</div>
            <div className="sidebar-logo-sub">Joe Books</div>
          </div>
          {open && <button onClick={() => setOpen(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>}
        </div>

        {/* Admin info */}
        <div style={{ padding: '0.75rem', marginBottom: '1rem', background: 'rgba(194,0,106,0.12)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(194,0,106,0.25)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="avatar avatar-sm avatar-initials" style={{ minWidth: 36, borderColor: 'var(--color-secondary)' }}>
            {user?.profilePhoto
              ? <img src={user.profilePhoto} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              : <span style={{ fontSize: '0.75rem' }}>{initials}</span>
            }
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
            <span className="badge badge-pink" style={{ fontSize: '0.6rem' }}>Administrator</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <span className="sidebar-section-label">Management</span>
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setOpen(false)}>
              <Icon size={18} className="icon" />
              {label}
            </NavLink>
          ))}
        </nav>

        <button onClick={handleLogout} className="sidebar-link" style={{ marginTop: 'auto', border: 'none', background: 'none', textAlign: 'left', color: 'var(--danger)', width: '100%', cursor: 'pointer' }}>
          <LogOut size={18} className="icon" />
          Logout
        </button>
      </aside>
    </>
  );
}
