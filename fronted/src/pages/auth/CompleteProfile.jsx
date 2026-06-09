import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { user, loading, updateUser } = useAuth();
  const [form, setForm] = useState({ phone: '', email: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate('/login', { replace: true }); return; }
    if (user.phone || user.email) navigate('/dashboard', { replace: true });
  }, [user, loading, navigate]);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.phone && !form.email) {
      toast.error('Please enter a phone number or email address');
      return;
    }
    if (form.email) {
      const domain = form.email.toLowerCase().split('@')[1];
      if (!['gmail.com', 'yahoo.com', 'hotmail.com'].includes(domain)) {
        toast.error('Only Gmail, Yahoo, and Hotmail are allowed');
        return;
      }
    }
    setSubmitting(true);
    try {
      const res = await API.put('/auth/update', {
        ...(form.phone && { phone: form.phone }),
        ...(form.email && { email: form.email }),
      });
      updateUser(res.data);
      toast.success('Contact info saved!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to save contact info');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="auth-page">
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />

      <div className="auth-card fade-in" style={{ maxWidth: 440 }}>
        <div className="auth-logo">
          <div className="auth-logo-icon" style={{ background: 'var(--color-primary)' }}>📞</div>
          <div>
            <div className="auth-title" style={{ color: 'var(--text-primary)' }}>One More Step</div>
            <div className="auth-subtitle">Add a contact to secure your account</div>
          </div>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Your account needs at least a phone number or email address. This helps us contact you about purchases and account security.
        </p>

        <div style={{
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          marginBottom: '1.25rem'
        }}>
          <div style={{
            background: 'var(--bg-base)',
            padding: '0.6rem 1rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>Add</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary)' }}>Phone</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>/</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary)' }}>Email</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>— at least one required</span>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} style={{ padding: '1rem', gap: '0.85rem' }}>
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
              <span style={{
                fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)',
                background: 'var(--bg-surface)', padding: '0.1rem 0.5rem',
                border: '1px solid var(--border-color)', borderRadius: 'var(--radius-full)'
              }}>/</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
            </div>

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

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={submitting}
              style={{ marginTop: '0.25rem' }}
            >
              {submitting ? <span className="spinner" /> : 'Save & Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
