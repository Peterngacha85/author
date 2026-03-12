import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';

const MPESA_TILL = '07200145';

export default function PaymentModal({ book, onClose }) {
  const [mpesaCode, setMpesaCode] = useState('');
  const [loading, setLoading]     = useState(false);
  const [copied, setCopied]       = useState(false);
  const paymentMode = import.meta.env.VITE_PAYMENT_MODE || 'MANUAL';

  const copyTill = () => {
    navigator.clipboard.writeText(MPESA_TILL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mpesaCode.trim()) return toast.error('Please paste your M-Pesa confirmation code');
    setLoading(true);
    try {
      await API.post('/payments/manual', {
        bookId: book._id,
        mpesaCode: mpesaCode.trim(),
        amount: book.price,
      });
      toast.success('Payment submitted! You now have access. Redirect...');
      setTimeout(() => { onClose(); window.location.reload(); }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to submit payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <div className="modal-title gradient-text">{book.title}</div>
            <div className="modal-desc">Complete your M-Pesa payment to unlock this {book.type}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Price */}
        <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Amount</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>KES {book.price?.toLocaleString()}</span>
        </div>

        {/* M-Pesa Instructions */}
        <div style={{ background: 'rgba(0,166,153,0.05)', border: '1px solid rgba(0,166,153,0.15)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--success)', marginBottom: '0.5rem' }}>📱 Lipa na M-Pesa</div>
          <ol style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.83rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <li>Open M-Pesa on your phone</li>
            <li>Go to <strong>Lipa na M-Pesa → Buy Goods</strong></li>
            <li>Enter Till Number:
              <button onClick={copyTill} style={{ marginLeft: '0.5rem', background: 'var(--success)', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 700, padding: '0.2rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                {MPESA_TILL} {copied ? <Check size={12} /> : <Copy size={12} />}
              </button>
            </li>
            <li>Enter amount: <strong>KES {book.price?.toLocaleString()}</strong></li>
            <li>Complete & copy the <strong>confirmation message</strong></li>
          </ol>
        </div>

        {/* Code Input */}
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Paste M-Pesa Confirmation Message</label>
            <textarea
              className="form-input"
              rows={4}
              placeholder="e.g. SL7XGT3U0Z confirmed. Ksh600 sent to KABURU READS on 12/3/26 at 10:15 AM. New M-PESA balance is Ksh1,234.00..."
              value={mpesaCode}
              onChange={e => setMpesaCode(e.target.value)}
              style={{ resize: 'vertical', minHeight: 90 }}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <span className="spinner" /> : '✅ Submit Payment & Get Access'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
          Access is granted immediately but will be verified by admin. Fraudulent codes will result in revocation.
        </p>
      </div>
    </div>
  );
}
