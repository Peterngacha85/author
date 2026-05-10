import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, User, MessageSquare, ArrowLeft, CheckCircle } from 'lucide-react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [form, setForm] = useState({ phone: '', name: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
      toast.success(res.data.msg);
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="auth-page">
        <div className="auth-card fade-in" style={{ textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(0, 166, 153, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <CheckCircle size={32} color="#00A699" />
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Request Submitted!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Your password reset request has been sent to our admin team. 
            They will reach out to you via your phone number or email shortly.
          </p>
          <Link to="/login" className="btn btn-primary btn-full btn-lg">
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

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
    </div>
  );
}
