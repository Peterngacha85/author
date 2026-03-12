import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import UserSidebar from './UserSidebar';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../../context/AuthContext';
import { Menu } from 'lucide-react';

export default function DashboardLayout({ role = 'user' }) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const Sidebar = role === 'admin' ? AdminSidebar : UserSidebar;

  return (
    <div className="dashboard-layout">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <div className="dashboard-main">
        {/* Topbar */}
        <header className="dashboard-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
              style={{ 
                display: 'none', 
                background: 'none', 
                border: 'none', 
                color: 'var(--text-primary)', 
                cursor: 'pointer',
                padding: '0.5rem'
              }}
            >
              <Menu size={24} />
            </button>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right', display: 'none', '@media(min-width:600px)': { display: 'block' } }} className="user-info-text">
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {role === 'admin' ? 'Administrator' : 'Member'}
              </div>
            </div>
            <div className={`avatar avatar-sm ${!user?.profilePhoto ? 'avatar-initials' : ''}`}>
              {user?.profilePhoto
                ? <img src={user.profilePhoto} alt={user.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                : <span style={{ fontSize: '0.75rem' }}>
                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                  </span>
              }
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
