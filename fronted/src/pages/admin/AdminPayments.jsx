import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle } from 'lucide-react';

export default function AdminPayments() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState({});

  useEffect(() => {
    API.get('/payments/all')
      .then(res => setTransactions(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const verify = async (txId, status) => {
    try {
      await API.post('/payments/verify', { transactionId: txId, status, adminComment: comment[txId] || '' });
      toast.success(`Payment ${status}!`);
      setTransactions(prev => prev.map(t => t._id === txId ? { ...t, status } : t));
    } catch {
      toast.error('Action failed');
    }
  };

  const statusBadge = (s) => {
    const map = { pending: 'badge-yellow', verified: 'badge-green', confirmed: 'badge-green', rejected: 'badge-red' };
    return <span className={`badge ${map[s] || 'badge-yellow'}`}>{s}</span>;
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2>💳 Payment Verification</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.25rem' }}>Review and confirm or reject M-Pesa payments</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><span className="spinner spinner-lg" /></div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Book</th>
                <th>M-Pesa Code</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Admin Note</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No transactions yet</td></tr>
              )}
              {transactions.map(tx => (
                <tr key={tx._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{tx.userId?.name || 'Unknown'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tx.userId?.phone}</div>
                  </td>
                  <td>{tx.bookId?.title || '—'}</td>
                  <td>
                    <div style={{ wordBreak: 'break-all', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {tx.mpesaCode}
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--color-accent)' }}>KES {tx.amount?.toLocaleString()}</td>
                  <td>{statusBadge(tx.status)}</td>
                  <td>
                    {tx.status === 'pending' ? (
                      <input className="form-input" style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', width: 140 }}
                        placeholder="Optional note..."
                        value={comment[tx._id] || ''}
                        onChange={e => setComment(prev => ({ ...prev, [tx._id]: e.target.value }))} />
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{tx.adminComment || '—'}</span>
                    )}
                  </td>
                  <td>
                    {tx.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => verify(tx._id, 'verified')} className="btn btn-success btn-sm" title="Confirm">
                          <CheckCircle size={14} />
                        </button>
                        <button onClick={() => verify(tx._id, 'rejected')} className="btn btn-danger btn-sm" title="Reject">
                          <XCircle size={14} />
                        </button>
                      </div>
                    )}
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
