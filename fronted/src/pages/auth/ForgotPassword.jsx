import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, User, MessageSquare, ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: '', name: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal state
  const [resetToken, setResetToken] = useState(null);
  const [userName, setUserName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.phone.trim()) {
      toast.error('Please enter your phone number or email');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await API.post('/api/auth/forgot-password', form);
      setResetToken(res.data.resetToken);
      setUserName(res.data.userName);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsSaving(true);
    try {
      const res = await API.post('/api/auth/reset-password', { token: resetToken, newPassword });
      toast.success(res.data.msg);
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to reset password');
      if (err.response?.status === 401) {
        // Token expired — close modal so they can re-submit
        setResetToken(null);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />

      <div className="auth-card fade-in">
        <div className="auth-logo">
          <div className="auth-logo-icon">🔑</div>
          <div>
            <div className="auth-title gradient-text">Forgot Password?</div>
            <div className="auth-subtitle">Submit a request and we'll help you get back in</div>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Phone Number or Email *</label>
            <div className="form-input-icon-wrap">
              <Phone size={16} className="icon" />
              <input
                type="text"
                name="phone"
                placeholder="e.g. 07... or name@gmail.com"
                className="form-input"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Your Name</label>
            <div className="form-input-icon-wrap">
              <User size={16} className="icon" />
              <input
                type="text"
                name="name"
                placeholder="So we can identify your account"
                className="form-input"
                value={form.name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Additional Details (optional)</label>
            <div className="form-input-icon-wrap">
              <MessageSquare size={16} className="icon" style={{ top: '1.25rem' }} />
              <textarea
                name="message"
                placeholder="Anything that can help us verify your identity..."
                className="form-input"
                value={form.message}
                onChange={handleChange}
                rows={3}
                style={{ paddingLeft: '2.75rem', resize: 'vertical' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg glow-pulse"
            disabled={isSubmitting}
            style={{ marginTop: '0.5rem' }}
          >
            {isSubmitting ? <span className="spinner" /> : 'Submit Request'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
          Remember your password?{' '}
          <Link to="/login" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>

      {/* Reset Password Modal */}
      {resetToken && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="auth-card fade-in" style={{ width: '100%', maxWidth: 420, margin: 0 }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(var(--color-primary-rgb, 220,38,38), 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <Lock size={26} color="var(--color-primary)" />
              </div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Set New Password
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Hi <strong>{userName}</strong>, enter your new password below.
              </p>
            </div>

            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">New Password *</label>
                <div className="form-input-icon-wrap" style={{ position: 'relative' }}>
                  <Lock size={16} className="icon" />
                  <input
                    type={showNew ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    className="form-input"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    style={{ paddingRight: '2.75rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(v => !v)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <div className="form-input-icon-wrap" style={{ position: 'relative' }}>
                  <Lock size={16} className="icon" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat your new password"
                    className="form-input"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    style={{ paddingRight: '2.75rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={isSaving}
                style={{ marginTop: '0.25rem' }}
              >
                {isSaving ? <span className="spinner" /> : 'Save New Password'}
              </button>

              <button
                type="button"
                onClick={() => setResetToken(null)}
                className="btn btn-outline btn-full"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                <ArrowLeft size={14} /> Go Back
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
