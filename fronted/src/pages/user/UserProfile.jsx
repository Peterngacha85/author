import { useState, useRef } from 'react';
import { Camera, Save, User, Phone, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function UserProfile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(user?.profilePhoto || null);
  const fileRef = useRef();

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    newPassword: '',
    confirmPassword: '',
  });

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    const fd = new FormData();
    fd.append('photo', file);
    try {
      const res = await API.post('/auth/upload-photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser({ profilePhoto: res.data.url });
      toast.success('Profile photo updated!');
    } catch {
      toast.error('Photo upload failed');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email };
      if (form.newPassword) {
        if (form.newPassword !== form.confirmPassword) {
          setLoading(false);
          return toast.error('Passwords do not match');
        }
        payload.password = form.newPassword;
      }
      const res = await API.put('/auth/update', payload);
      updateUser(res.data);
      toast.success('Profile updated!');
      setForm(p => ({ ...p, newPassword: '', confirmPassword: '' }));
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 600 }}>
      <h2 style={{ marginBottom: '1.5rem' }}>👤 My Profile</h2>

      {/* Avatar Section */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileRef.current?.click()}>
          <div className={`avatar avatar-xl ${!photoPreview ? 'avatar-initials' : ''}`}>
            {photoPreview
              ? <img src={photoPreview} alt={user?.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              : <span style={{ fontSize: '2rem' }}>{initials}</span>
            }
          </div>
          <div style={{
            position: 'absolute', bottom: 4, right: 4,
            background: 'var(--color-primary)', borderRadius: '50%',
            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--bg-surface)', cursor: 'pointer',
            boxShadow: 'var(--shadow-md)'
          }}>
            <Camera size={14} color="white" />
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhotoChange} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-white)' }}>{user?.name}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.phone}</div>
          <span className={`badge ${user?.role === 'admin' ? 'badge-pink' : 'badge-purple'}`} style={{ marginTop: '0.5rem' }}>
            {user?.role === 'admin' ? '⚙️ Administrator' : '📚 Member'}
          </span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click avatar to change photo</p>
      </div>

      {/* Stats Summary (Added for Alignment) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem', background: 'rgba(255,56,92,0.05)', border: '1px solid rgba(255,56,92,0.1)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Account Status</div>
          <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>ACTIVE MEMBER</div>
        </div>
        <div className="glass-card" style={{ padding: '1.25rem', background: 'rgba(0,132,137,0.05)', border: '1px solid rgba(0,132,137,0.1)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Security</div>
          <div style={{ fontWeight: 700, color: 'var(--color-secondary)' }}>PROTECTED</div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>✏️ Edit Information</h3>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="form-input-icon-wrap">
              <User size={16} className="icon" />
              <input className="form-input" name="name" value={form.name} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone</label>
            <div className="form-input-icon-wrap">
              <Phone size={16} className="icon" />
              <input className="form-input" name="phone" value={form.phone} readOnly style={{ opacity: 0.6 }} />
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Phone cannot be changed</span>
          </div>

          <div className="form-group">
            <label className="form-label">Email <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
            <div className="form-input-icon-wrap">
              <Mail size={16} className="icon" />
              <input className="form-input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">New Password <span style={{ color: 'var(--text-muted)' }}>(leave blank to keep current)</span></label>
            <div className="form-input-icon-wrap">
              <Lock size={16} className="icon" />
              <input className="form-input" name="newPassword" type={showPass ? 'text' : 'password'}
                value={form.newPassword} onChange={handleChange}
                placeholder="New password..." style={{ paddingRight: '2.75rem' }} />
              <button type="button" onClick={() => setShowPass(p => !p)}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <div className="form-input-icon-wrap">
              <Lock size={16} className="icon" />
              <input className="form-input" name="confirmPassword" type={showPass ? 'text' : 'password'}
                value={form.confirmPassword} onChange={handleChange}
                placeholder="Repeat new password..." style={{ paddingRight: '2.75rem' }} />
              <button type="button" onClick={() => setShowPass(p => !p)}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? <span className="spinner" /> : <><Save size={16} /> Save Changes</>}
          </button>
        </form>
      </div>

      {/* Purchases */}
      <div className="glass-card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>📦 My Collection</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          You have <strong style={{ color: 'var(--color-accent)' }}>{user?.purchasedItems?.length || 0}</strong> book{user?.purchasedItems?.length !== 1 ? 's' : ''} in your library.
        </p>
      </div>
    </div>
  );
}
