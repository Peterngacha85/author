import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, Lock, Eye, EyeOff, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import API from '../../api/axios';

export default function Register() {
  const navigate = useNavigate();
  const { register, updateUser, user, loading: authLoading } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' });

  // Redirect if already logged in
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
    if (!form.name || !form.phone || !form.password) {
      toast.error('Name, phone, and password are required');
      return;
    }
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('phone', form.phone);
      if (form.email) fd.append('email', form.email);
      fd.append('password', form.password);
      if (photoFile) fd.append('photo', photoFile);

      console.log('Sending consolidated registration...');
      const user = await register(fd);
      console.log('Registration Success (with photo if provided):', user);

      toast.success('Welcome! Account created successfully.');
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      console.error('Registration Error:', err);
      toast.error(err.response?.data?.msg || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />

      <div className="auth-card fade-in">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon" style={{ background: 'var(--color-primary)' }}>📚</div>
          <div>
            <div className="auth-title" style={{ color: 'var(--text-primary)' }}>Create Account</div>
            <div className="auth-subtitle">Join and explore amazing books</div>
          </div>
        </div>

        {/* Profile Photo Upload */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <label className="profile-upload" title="Click to upload profile photo">
            <div className={`avatar avatar-lg ${!photoPreview ? 'avatar-initials' : ''}`}>
              {photoPreview
                ? <img src={photoPreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                : <span style={{ fontSize: '1.5rem' }}>{getInitials(form.name) || '📷'}</span>
              }
            </div>
            <div className="profile-upload-overlay">
              <User size={24} color="white" />
            </div>
            <input type="file" accept="image/*" onChange={handlePhoto} />
          </label>
        </div>
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.5rem', marginTop: '-1rem' }}>Click avatar to upload photo</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Name */}
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <div className="form-input-icon-wrap">
              <User size={16} className="icon" />
              <input type="text" name="name" placeholder="Joe Joseph" className="form-input"
                value={form.name} onChange={handleChange} required />
            </div>
          </div>

          {/* Phone */}
          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <div className="form-input-icon-wrap">
              <Phone size={16} className="icon" />
              <input type="text" name="phone" placeholder="e.g. 07... or +254..." className="form-input"
                value={form.phone} onChange={handleChange} required />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
            <div className="form-input-icon-wrap">
              <Mail size={16} className="icon" />
              <input type="email" name="email" placeholder="you@example.com" className="form-input"
                value={form.email} onChange={handleChange} />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password *</label>
            <div className="form-input-icon-wrap">
              <Lock size={16} className="icon" />
              <input type={showPass ? 'text' : 'password'} name="password" placeholder="Create a strong password"
                className="form-input" value={form.password} onChange={handleChange} required
                style={{ paddingRight: '2.75rem' }} />
              <button type="button" onClick={() => setShowPass(p => !p)}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>


          <button type="submit" className="btn btn-primary btn-full btn-lg glow-pulse" disabled={isSubmitting} style={{ marginTop: '0.5rem' }}>
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
