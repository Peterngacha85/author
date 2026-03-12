import { useState, useEffect } from 'react';
import { X, Copy, Check, Smartphone, FileText, ArrowRight } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const MPESA_TILL = '07200145';

export default function PaymentModal({ book, onClose }) {
  const { user } = useAuth();
  const [method, setMethod] = useState('stk'); // 'stk' or 'manual'
  const [phone, setPhone] = useState(user?.phone || '');
  const [mpesaCode, setMpesaCode] = useState('');
  const [loading, setLoading]     = useState(false);
  const [copied, setCopied]       = useState(false);

  const copyTill = () => {
    navigator.clipboard.writeText(MPESA_TILL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSTKPush = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/payments/stk', {
        bookId: book._id,
        phone: phone.trim()
      });
      toast.success('STK Push sent! Enter your PIN on your phone.');
      // Keep modal open, maybe show a "Waiting for confirmation" state
    } catch (err) {
      toast.error(err.response?.data?.msg || 'STK Push failed. Please try manual payment.');
      setMethod('manual');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!mpesaCode.trim()) return toast.error('Please paste your M-Pesa confirmation message');
    setLoading(true);
    try {
      await API.post('/payments/manual', {
        bookId: book._id,
        mpesaCode: mpesaCode.trim(),
        amount: book.price,
      });
      toast.success('Payment submitted! Access granted. Redirecting...');
      setTimeout(() => { onClose(); window.location.reload(); }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to submit payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 450 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <div className="modal-title gradient-text" style={{ fontSize: '1.2rem' }}>{book.title}</div>
            <div className="modal-desc" style={{ fontSize: '0.82rem' }}>Choose your preferred payment method</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Price Tag */}
        <div style={{ background: 'var(--bg-base)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total to Pay</span>
          <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>KES {book.price?.toLocaleString()}</span>
        </div>

        {/* Method Toggle */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <button 
            onClick={() => setMethod('stk')}
            className={`btn btn-sm ${method === 'stk' ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1, display: 'flex', gap: '0.4rem', justifyContent: 'center' }}
          >
            <Smartphone size={16} /> M-Pesa Express
          </button>
          <button 
            onClick={() => setMethod('manual')}
            className={`btn btn-sm ${method === 'manual' ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1, display: 'flex', gap: '0.4rem', justifyContent: 'center' }}
          >
            <FileText size={16} /> Manual Input
          </button>
        </div>

        {method === 'stk' ? (
          <form onSubmit={handleSTKPush} className="fade-in">
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Phone Number (for STK Push)</label>
              <input 
                className="form-input"
                placeholder="07XX XXX XXX or 254..."
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                You will receive a prompt on this phone to enter your M-Pesa PIN.
              </p>
            </div>
            <button type="submit" className="btn btn-primary btn-full shadow-lg" disabled={loading} style={{ height: '3rem', fontSize: '1rem' }}>
              {loading ? <span className="spinner" /> : <>Pay Fast with M-Pesa <ArrowRight size={18} /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleManualSubmit} className="fade-in">
             {/* Manual Instructions */}
             <div style={{ background: 'rgba(0,166,153,0.05)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px dashed var(--color-primary)' }}>
              <p style={{ fontSize: '0.75rem', marginBottom: '0.4rem' }}>Pay to <strong>Buy Goods</strong> Till: 
                <button type="button" onClick={copyTill} className="btn btn-sm btn-outline" style={{ marginLeft: '0.5rem' }}>{MPESA_TILL} {copied ? <Check size={12}/> : <Copy size={12}/>}</button>
              </p>
              <p style={{ fontSize: '0.75rem' }}>Once paid, paste the message below:</p>
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Paste the full M-Pesa confirmation here..."
                value={mpesaCode}
                onChange={e => setMpesaCode(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Confirm Payment'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
           <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Access is granted upon confirmation. Questions? Contact Support.
           </p>
        </div>
      </div>
    </div>
  );
}
