import { useState, useEffect } from 'react';
import { BookOpen, Users, CreditCard, TrendingUp } from 'lucide-react';
import API from '../../api/axios';

export default function AdminHome() {
  const [stats, setStats] = useState({ books: 0, users: 0, payments: 0, revenue: 0 });
  const [recentTx, setRecentTx] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/books'),
      API.get('/admin/users'),
      API.get('/payments/all'),
    ]).then(([books, users, payments]) => {
      const revenue = payments.data
        .filter(p => p.status === 'confirmed')
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      setStats({ books: books.data.length, users: users.data.length, payments: payments.data.length, revenue });
      setRecentTx(payments.data.slice(0, 5));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

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
              </tr>
            </thead>
            <tbody>
              {recentTx.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No transactions yet</td></tr>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
