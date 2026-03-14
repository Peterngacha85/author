import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Trash2 } from 'lucide-react';

export default function AdminPayments() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState({});
  const [tab, setTab] = useState('pending'); // 'pending' or 'history'

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
      setTransactions(prev => prev.map(t => t._id === txId ? { ...t, status, adminComment: comment[txId] || '' } : t));
    } catch {
      toast.error('Action failed');
    }
  };

  const deleteTx = async (txId) => {
    if (!window.confirm("Are you sure you want to delete this payment record?")) return;
    try {
      await API.delete(`/payments/${txId}`);
      toast.success('Payment record deleted');
      setTransactions(prev => prev.filter(t => t._id !== txId));
    } catch {
      toast.error('Failed to delete payment');
    }
  };

  const statusBadge = (s) => {
    const map = { pending: 'badge-yellow', verified: 'badge-green', confirmed: 'badge-green', rejected: 'badge-red' };
    return <span className={`badge ${map[s] || 'badge-yellow'}`}>{s}</span>;
  };

  const filteredTransactions = transactions.filter(tx => tab === 'pending' ? tx.status === 'pending' : tx.status !== 'pending');

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>💳 Payment Verification</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.25rem' }}>Review and manage M-Pesa payments</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button onClick={() => setTab('pending')} className={`btn ${tab === 'pending' ? 'btn-primary' : 'btn-outline'} btn-sm`}>
          Pending Verification
        </button>
        <button onClick={() => setTab('history')} className={`btn ${tab === 'history' ? 'btn-primary' : 'btn-outline'} btn-sm`}>
          History
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><span className="spinner spinner-lg" /></div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '20%' }}>User</th>
                <th style={{ width: '25%' }}>Book</th>
                <th style={{ width: '15%' }}>M-Pesa Code</th>
                <th style={{ width: '12%' }}>Amount</th>
                <th style={{ width: '10%' }}>Status</th>
                <th style={{ width: '15%' }}>Admin Note</th>
                <th style={{ width: '10%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No {tab} transactions</td></tr>
              )}
              {filteredTransactions.map(tx => (
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
                      <input className="form-input" style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', width: '100%' }}
                        placeholder="Optional note..."
                        value={comment[tx._id] || ''}
                        onChange={e => setComment(prev => ({ ...prev, [tx._id]: e.target.value }))} />
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{tx.adminComment || '—'}</span>
                    )}
                  </td>
                  <td>
                    {tx.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => verify(tx._id, 'verified')} className="btn btn-success btn-sm" title="Confirm">
                          <CheckCircle size={14} />
                        </button>
                        <button onClick={() => verify(tx._id, 'rejected')} className="btn btn-danger btn-sm" title="Reject">
                          <XCircle size={14} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => deleteTx(tx._id)} className="btn btn-danger btn-sm" title="Delete">
                          <Trash2 size={14} />
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
