import { useState, useEffect } from 'react';
import { BookOpen, Users, CreditCard, TrendingUp, Trash2 } from 'lucide-react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function AdminHome() {
  const [stats, setStats] = useState({ books: 0, users: 0, payments: 0, revenue: 0 });
  const [recentTx, setRecentTx] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [txToDelete, setTxToDelete] = useState(null);

  useEffect(() => {
    Promise.all([
      API.get('/books'),
      API.get('/admin/users'),
      API.get('/payments/all'),
    ]).then(([books, users, payments]) => {
      const confirmedPayments = payments.data.filter(p => p.status === 'confirmed' || p.status === 'verified');
      const revenue = confirmedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      setStats({ books: books.data.length, users: users.data.length, payments: payments.data.length, revenue });
      setRecentTx(payments.data.slice(0, 8)); // Show a few more
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const deleteTx = async () => {
    if (!txToDelete) return;
    try {
      await API.delete(`/payments/${txToDelete}`);
      toast.success('Transaction deleted');
      setRecentTx(prev => prev.filter(t => t._id !== txToDelete));
      setStats(prev => ({ ...prev, payments: prev.payments - 1 })); // Basic stat update
    } catch {
      toast.error('Failed to delete transaction');
    } finally {
      setIsConfirmOpen(false);
      setTxToDelete(null);
    }
  };

  const STATS = [
    { icon: BookOpen,    label: 'Total Books',     value: stats.books,    color: 'rgba(255,56,92,0.1)',   textColor: 'var(--color-primary)' },
    { icon: Users,       label: 'Registered Users', value: stats.users,   color: 'rgba(0,132,137,0.1)', textColor: 'var(--color-secondary)' },
    { icon: CreditCard,  label: 'Transactions',    value: stats.payments, color: 'rgba(255,180,0,0.1)', textColor: '#B27E00' },
    { icon: TrendingUp,  label: 'Revenue (KES)',    value: `${stats.revenue.toLocaleString()}`, color: 'rgba(0,166,153,0.1)',   textColor: 'var(--success)' },
  ];

  const statusBadge = (s) => {
    const map = { pending: 'badge-yellow', confirmed: 'badge-green', rejected: 'badge-red' };
    return <span className={`badge ${map[s] || 'badge-yellow'}`}>{s}</span>;
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.6rem' }}>Admin <span className="gradient-text">Overview</span></h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Welcome back. Here's your system summary.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        {STATS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="stat-card">
              <div className="stat-icon" style={{ background: s.color }}>
                <Icon size={22} color={s.textColor} />
              </div>
              <div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{loading ? '…' : s.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Transactions */}
      <div>
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>🕒 Recent Transactions</h3>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Book</th>
                 <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentTx.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No transactions yet</td></tr>
              )}
              {recentTx.map(tx => (
                <tr key={tx._id}>
                  <td>{tx.userId?.name || 'Unknown'}</td>
                  <td>{tx.bookId?.title || '—'}</td>
                  <td style={{ fontWeight: 700, color: 'var(--color-accent)' }}>KES {tx.amount?.toLocaleString()}</td>
                  <td>{statusBadge(tx.status)}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      onClick={() => { setTxToDelete(tx._id); setIsConfirmOpen(true); }}
                      className="btn btn-sm btn-danger" 
                      style={{ padding: '0.4rem' }}
                      title="Delete transaction"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={deleteTx}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction record? This will also revoke user access to the book."
      />
    </div>
  );
}
