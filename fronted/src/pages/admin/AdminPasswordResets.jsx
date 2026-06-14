import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { Clock, CheckCircle, Trash2, MessageSquare, UserCheck } from 'lucide-react';

export default function AdminPasswordResets() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'resolved', 'self-resolved'

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await API.get('/api/admin/password-resets');
      setRequests(res.data);
    } catch {
      toast.error('Failed to load password reset requests');
    } finally {
      setLoading(false);
    }
  };

  const resolveRequest = async (id) => {
    try {
      await API.put(`/api/admin/password-resets/${id}/resolve`, { adminNote: 'Password reset handled' });
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status: 'resolved' } : r));
      toast.success('Request marked as resolved');
    } catch {
      toast.error('Failed to resolve request');
    }
  };

  const deleteRequest = async (id) => {
    try {
      await API.delete(`/api/admin/password-resets/${id}`);
      setRequests(prev => prev.filter(r => r._id !== id));
      toast.success('Request deleted');
    } catch {
      toast.error('Failed to delete request');
    }
  };

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const selfResolvedCount = requests.filter(r => r.status === 'self-resolved').length;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2>🔑 Password Reset Requests</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
          {pendingCount} pending request{pendingCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['all', 'pending', 'resolved', 'self-resolved'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}
          >
            {f === 'self-resolved' ? 'Self-Resolved' : f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'pending' && pendingCount > 0 && (
              <span style={{
                background: 'var(--danger)', color: 'white',
                borderRadius: '50%', width: 20, height: 20,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700, marginLeft: '0.4rem'
              }}>
                {pendingCount}
              </span>
            )}
            {f === 'self-resolved' && selfResolvedCount > 0 && (
              <span style={{
                background: 'var(--color-primary)', color: 'white',
                borderRadius: '50%', width: 20, height: 20,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700, marginLeft: '0.4rem'
              }}>
                {selfResolvedCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <span className="spinner spinner-lg" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-text">No {filter !== 'all' ? filter : ''} requests found</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(req => (
            <div
              key={req._id}
              className="glass-card"
              style={{
                padding: '1.25rem 1.5rem',
                borderLeft: req.status === 'pending'
                  ? '4px solid var(--warning)'
                  : req.status === 'self-resolved'
                  ? '4px solid var(--color-primary)'
                  : '4px solid var(--success)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>
                      {req.name || 'Unknown User'}
                    </span>
                    <span className={`badge ${req.status === 'pending' ? 'badge-yellow' : req.status === 'self-resolved' ? 'badge-pink' : 'badge-green'}`}>
                      {req.status === 'pending' ? '⏳ Pending' : req.status === 'self-resolved' ? '🔐 Self-Resolved' : '✅ Resolved'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    📱 <strong>{req.phone}</strong>
                  </div>

                  {req.message && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <MessageSquare size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span>{req.message}</span>
                    </div>
                  )}

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={12} />
                    {new Date(req.createdAt).toLocaleString()}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, alignItems: 'center' }}>
                  {req.status === 'pending' && (
                    <button
                      onClick={() => resolveRequest(req._id)}
                      className="btn btn-sm btn-success"
                    >
                      <CheckCircle size={14} /> Resolve
                    </button>
                  )}
                  {req.status === 'self-resolved' && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                      <UserCheck size={15} /> User reset their own password
                    </span>
                  )}
                  <button
                    onClick={() => deleteRequest(req._id)}
                    className="btn btn-sm btn-danger"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
