import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, userId: null });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Strip phone numbers down to the local part so 07..., 2547... and +2547... all match
  const phoneDigits = (p) => (p || '').replace(/\D/g, '').replace(/^(254|0)/, '');

  const nonAdmins = users.filter(u => u.role !== 'admin');
  const query = search.trim().toLowerCase();
  const queryDigits = phoneDigits(query);
  const filteredUsers = nonAdmins.filter(u => {
    if (statusFilter === 'active' && u.disabled) return false;
    if (statusFilter === 'disabled' && !u.disabled) return false;
    if (!query) return true;
    return (
      u.name?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query) ||
      (queryDigits.length >= 3 && phoneDigits(u.phone).includes(queryDigits))
    );
  });

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
          {nonAdmins.length} registered user{nonAdmins.length !== 1 ? 's' : ''}
          {(query || statusFilter !== 'all') && ` · ${filteredUsers.length} shown`}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <input
          className="form-input"
          style={{ flex: '1 1 240px' }}
          placeholder="Search by name, phone or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="form-input"
          style={{ flex: '0 0 auto', width: 'auto' }}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </select>
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
              {filteredUsers.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  {nonAdmins.length === 0 ? 'No users registered yet' : 'No users match your search'}
                </td></tr>
              )}
              {filteredUsers.map(u => (
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
