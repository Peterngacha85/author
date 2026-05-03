import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, Lock, Eye, EyeOff, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const { register, user, loading: authLoading } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' });

  useEffect(() => {
    if (!authLoading && user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [user, authLoading, navigate]);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.password) {
      toast.error('Name and password are required');
      return;
    }
    if (!form.phone && !form.email) {
      toast.error('Please enter a phone number or email address');
      return;
    }
    const allowedDomains = ['gmail.com', 'yahoo.com', 'hotmail.com'];
    if (form.email) {
      const domain = form.email.toLowerCase().split('@')[1];
      if (!allowedDomains.includes(domain)) {
        toast.error('Only Gmail, Yahoo, and Hotmail are allowed');
        return;
      }
    }
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      if (form.phone) fd.append('phone', form.phone);
      if (form.email) fd.append('email', form.email);
      fd.append('password', form.password);
      
      const sessionId = localStorage.getItem('author_traffic_session');
      if (sessionId) fd.append('sessionId', sessionId);
      
      if (photoFile) fd.append('photo', photoFile);

      const registeredUser = await register(fd);
      toast.success('Welcome! Account created successfully.');
      navigate(registeredUser.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />

      <div className="auth-card fade-in" style={{ maxWidth: 460 }}>
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon" style={{ background: 'var(--color-primary)' }}>📚</div>
          <div>
            <div className="auth-title" style={{ color: 'var(--text-primary)' }}>Create Account</div>
            <div className="auth-subtitle">Join and explore amazing books</div>
          </div>
        </div>

        {/* Profile Photo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <label className="profile-upload" title="Click to upload profile photo">
            <div className={`avatar avatar-lg ${!photoPreview ? 'avatar-initials' : ''}`}>
              {photoPreview
                ? <img src={photoPreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                : <span style={{ fontSize: '1.5rem' }}>{getInitials(form.name) || '📷'}</span>
              }
            </div>
            <div className="profile-upload-overlay"><User size={24} color="white" /></div>
            <input type="file" accept="image/*" onChange={handlePhoto} />
          </label>
        </div>
        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '1.5rem', marginTop: '-0.75rem' }}>
          Click to upload photo (optional)
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>

          {/* Name */}
          <div className="form-group">
            <label className="form-label">Full Name <span style={{ color: 'var(--danger)' }}>*</span></label>
            <div className="form-input-icon-wrap">
              <User size={16} className="icon" />
              <input type="text" name="name" placeholder="Your full name" className="form-input"
                value={form.name} onChange={handleChange} required />
            </div>
          </div>

          {/* ─── Credential Section ─── */}
          <div style={{
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            marginTop: '0.25rem'
          }}>
            {/* Header hint */}
            <div style={{
              background: 'var(--bg-base)',
              padding: '0.6rem 1rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Sign up with
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary)' }}>Phone</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>/</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary)' }}>Email</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>— fill in at least one</span>
            </div>

            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

              {/* Phone */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Phone size={13} /> Phone Number
                </label>
                <div className="form-input-icon-wrap">
                  <Phone size={16} className="icon" />
                  <input
                    type="text"
                    name="phone"
                    placeholder="07... or +254..."
                    className="form-input"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Slash divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                <span style={{
                  fontSize: '0.85rem', fontWeight: 700,
                  color: 'var(--text-muted)',
                  background: 'var(--bg-surface)',
                  padding: '0.1rem 0.5rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-full)'
                }}>
                  /
                </span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
              </div>

              {/* Email */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Mail size={13} /> Email Address
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 400 }}>(Gmail, Yahoo, Hotmail)</span>
                </label>
                <div className="form-input-icon-wrap">
                  <Mail size={16} className="icon" />
                  <input
                    type="email"
                    name="email"
                    placeholder="you@gmail.com"
                    className="form-input"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">
              Password <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <div className="form-input-icon-wrap">
              <Lock size={16} className="icon" />
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                placeholder="Create a strong password"
                className="form-input"
                value={form.password}
                onChange={handleChange}
                required
                style={{ paddingRight: '2.75rem' }}
              />
              <button type="button" onClick={() => setShowPass(p => !p)}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg glow-pulse"
            disabled={isSubmitting}
            style={{ marginTop: '0.25rem' }}
          >
            {isSubmitting ? <span className="spinner" /> : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
