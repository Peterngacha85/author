import { useEffect, useState } from 'react';
import { Copy, Plus } from 'lucide-react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await API.get('/coupons');
      setCoupons(res.data);
    } catch (err) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleGenerate = async () => {
    if (!quantity || quantity < 1) return toast.error('Enter a valid quantity');
    setGenerating(true);
    try {
      const res = await API.post('/coupons/generate', { quantity });
      setCoupons(prev => [...res.data, ...prev]);
      toast.success(`${res.data.length} coupon${res.data.length !== 1 ? 's' : ''} created`);
      setQuantity(1);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to generate coupons');
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = async (code) => {
    await navigator.clipboard.writeText(code);
    toast.success('Coupon copied');
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h2>🎟️ Coupon Codes</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
            Create one-time coupon codes and track whether they have been used.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
              className="form-input"
              style={{ width: 100 }}
            />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>codes</span>
          </div>
          <button onClick={handleGenerate} className="btn btn-primary" disabled={generating}>
            <Plus size={16} /> Generate
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <span className="spinner spinner-lg" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎫</div>
          <div className="empty-state-text">No coupons generated yet</div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Status</th>
                <th>Generated</th>
                <th>Used By</th>
                <th>Used At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(coupon => (
                <tr key={coupon._id}>
                  <td style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }}>{coupon.code}</td>
                  <td>
                    <span className={`badge ${coupon.status === 'used' ? 'badge-red' : 'badge-green'}`}>
                      {coupon.status === 'used' ? 'Used' : 'Unused'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{new Date(coupon.createdAt).toLocaleString()}</td>
                  <td>{coupon.usedBy ? coupon.usedBy.name || coupon.usedBy.email : '—'}</td>
                  <td>{coupon.usedAt ? new Date(coupon.usedAt).toLocaleString() : '—'}</td>
                  <td>
                    <button onClick={() => copyCode(coupon.code)} className="btn btn-sm btn-outline">
                      <Copy size={14} /> Copy
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
