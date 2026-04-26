import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, userId: null });

  useEffect(() => {
    API.get('/admin/users')
      .then(res => setUsers(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleAccess = async (userId, currentStatus) => {
    try {
      await API.put(`/admin/users/${userId}/toggle`);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, disabled: !currentStatus } : u));
      toast.success('User access updated');
    } catch {
      toast.error('Failed to update access');
    }
  };

  const requestDelete = (userId) => {
    setConfirmModal({ isOpen: true, userId });
  };

  const executeDelete = async () => {
    const userId = confirmModal.userId;
    if (!userId) return;
    try {
      await API.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      toast.success('User deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to delete user');
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2>👥 Users</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
          {users.length} registered user{users.length !== 1 ? 's' : ''}
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <span className="spinner spinner-lg" />
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Books</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No users registered yet</td></tr>
              )}
              {users.filter(u => u.role !== 'admin').map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="avatar avatar-sm avatar-initials">
                        {u.profilePhoto
                          ? <img src={u.profilePhoto} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                          : <span style={{ fontSize: '0.7rem' }}>{u.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}</span>
                        }
                      </div>
                      <span style={{ fontWeight: 600 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{u.phone}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{u.email || '—'}</td>
                  <td>
                    <span className="badge badge-purple">{u.purchasedItems?.length || 0} books</span>
                  </td>
                  <td>
                    <span className={`badge ${u.disabled ? 'badge-red' : 'badge-green'}`}>
                      {u.disabled ? 'Disabled' : 'Active'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => toggleAccess(u._id, u.disabled)}
                        className={`btn btn-sm ${u.disabled ? 'btn-success' : 'btn-warning'}`}>
                        {u.disabled ? 'Enable' : 'Disable'}
                      </button>
                      <button
                        onClick={() => requestDelete(u._id)}
                        className="btn btn-sm btn-danger">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, userId: null })}
        onConfirm={executeDelete}
        title="Delete User"
        message="Are you sure you want to completely delete this user? This cannot be undone."
        confirmText="Yes, Delete User"
      />
    </div>
  );
}
