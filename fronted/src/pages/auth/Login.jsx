import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const { login, user, loading } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ phone: '', password: '' });

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [user, loading, navigate]);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Security Restriction: Only @gmail.com allowed if email is used
    if (form.phone.includes('@') && !form.phone.toLowerCase().endsWith('@gmail.com')) {
      toast.error('Only @gmail.com email addresses are allowed');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login(form.phone, form.password);
      toast.success('Welcome back!');
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Login failed. Check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />

      <div className="auth-card fade-in">
        <div className="auth-logo">
          <div className="auth-logo-icon">📚</div>
          <div>
            <div className="auth-title gradient-text">Welcome Back</div>
            <div className="auth-subtitle">Sign in to your reading account</div>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email or Phone Number</label>
            <div className="form-input-icon-wrap">
              <Phone size={16} className="icon" />
              <input type="text" name="phone" placeholder="e.g. 07... or joe@gmail.com" className="form-input"
                value={form.phone} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="form-input-icon-wrap">
              <Lock size={16} className="icon" />
              <input type={showPass ? 'text' : 'password'} name="password" placeholder="Your password"
                className="form-input" value={form.password} onChange={handleChange} required
                style={{ paddingRight: '2.75rem' }} />
              <button type="button" onClick={() => setShowPass(p => !p)}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>


          <button type="submit" className="btn btn-primary btn-full btn-lg glow-pulse" disabled={isSubmitting} style={{ marginTop: '0.5rem' }}>
            {isSubmitting ? <span className="spinner" /> : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
