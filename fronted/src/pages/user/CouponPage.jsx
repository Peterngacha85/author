import { useState } from 'react';
import { Tag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function CouponPage() {
  const { updateUser } = useAuth();
  const [couponCode, setCouponCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return toast.error('Enter a coupon code');
    setRedeeming(true);
    try {
      const res = await API.post('/coupons/redeem', { code: couponCode.trim() });
      updateUser(res.data.user);
      setCouponCode('');
      toast.success('Coupon redeemed! You now have access to all books.');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to redeem coupon');
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 480 }}>
      <h2 style={{ marginBottom: '0.5rem' }}>🎫 Redeem Coupon</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Enter a one-time coupon code from the admin to unlock all books instantly.
      </p>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(194,0,106,0.12)',
            border: '1px solid rgba(194,0,106,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Tag size={28} color="var(--color-primary)" />
          </div>
        </div>

        <form onSubmit={handleRedeem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Coupon Code</label>
            <input
              className="form-input"
              placeholder="e.g. A1B2C3D4E5"
              value={couponCode}
              onChange={e => setCouponCode(e.target.value.toUpperCase())}
              style={{ letterSpacing: '0.1em', fontWeight: 600, fontSize: '1.1rem', textAlign: 'center' }}
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={redeeming} style={{ height: '3rem', fontSize: '1rem' }}>
            {redeeming ? <span className="spinner" /> : '🎫 Redeem Code'}
          </button>
        </form>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1.25rem' }}>
          Codes are one-time use only. Contact the admin if you have issues.
        </p>
      </div>
    </div>
  );
}
