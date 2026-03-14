import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Headphones, Trash2, ExternalLink, Plus, Edit2, X, Save } from 'lucide-react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function AdminBooks({ filter }) {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editingBook, setEditingBook] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', author: '', price: '', description: '' });
  const [savingEdit, setSavingEdit] = useState(false);

  // Confirm Modal State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, [filter]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await API.get('/books');
      if (filter) {
        setBooks(res.data.filter(b => b.type === filter));
      } else {
        setBooks(res.data);
      }
    } catch (err) {
      toast.error('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setBookToDelete(id);
    setIsConfirmOpen(true);
  };

  const deleteBook = async () => {
    if (!bookToDelete) return;
    try {
      await API.delete(`/admin/books/${bookToDelete}`);
      setBooks(books.filter(b => b._id !== bookToDelete));
      toast.success('Book deleted successfully');
    } catch (err) {
      toast.error('Failed to delete book');
    } finally {
      setBookToDelete(null);
    }
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setEditForm({
      title: book.title || '',
      author: book.author || '',
      price: book.price || '',
      description: book.description || ''
    });
  };

  const closeEditModal = () => {
    setEditingBook(null);
  };

  const handleEditChange = (e) => {
    setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.title.trim() || !editForm.price) return toast.error('Title and price are required');
    setSavingEdit(true);
    try {
      const res = await API.put(`/books/${editingBook._id}`, editForm);
      setBooks(books.map(b => b._id === editingBook._id ? { ...b, ...res.data.book } : b));
      toast.success('Book updated successfully');
      closeEditModal();
    } catch (err) {
      toast.error('Failed to update book');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>📚 Library Management</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
            Manage your eBooks and Audiobooks catalog
          </p>
        </div>
        <div className="badge badge-purple">{books.length} Total Items</div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <span className="spinner spinner-lg" />
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ minWidth: 250 }}>Title & Author</th>
                <th>Type</th>
                <th>Price</th>
                <th>Purchases</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No books found in the library.
                  </td>
                </tr>
              )}
              {books.map((book) => (
                <tr key={book._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img 
                        src={book.coverImage?.url || book.coverImage || 'https://via.placeholder.com/40x60'} 
                        alt={book.title} 
                        style={{ width: 40, height: 60, objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                          {book.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{book.author}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {book.type === 'ebook' ? <Book size={14} color="#FF385C" /> : <Headphones size={14} color="#008489" />}
                      <span style={{ textTransform: 'capitalize' }}>{book.type}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 700 }}>KES {book.price?.toLocaleString()}</td>
                  <td>
                    <span className="badge badge-pink">{book.purchaseCount || 0}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => openEditModal(book)}
                        className="btn btn-sm btn-outline" 
                        style={{ color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
                        title="Edit Book Details"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => {
                          if (book.type === 'ebook') navigate(`/reader/read/${book._id}`);
                          else navigate(`/reader/listen/${book._id}`);
                        }}
                        className="btn btn-sm btn-outline" 
                        title="View reader"
                      >
                        <ExternalLink size={14} />
                      </button>
                      {book.type === 'audiobook' && (
                        <button 
                          onClick={() => navigate(`/admin/books/reorder/${book._id}`)}
                          className="btn btn-sm btn-outline" 
                          style={{ color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
                          title="Reorder Chapters"
                        >
                          <Plus size={14} />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteClick(book._id)}
                        className="btn btn-sm btn-danger" 
                        title="Delete Book"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Book Modal */}
      {editingBook && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Edit Book Details</h3>
              <button onClick={closeEditModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={saveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input 
                  className="form-input" 
                  name="title" 
                  value={editForm.title} 
                  onChange={handleEditChange} 
                  required 
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Author</label>
                  <input 
                    className="form-input" 
                    name="author" 
                    value={editForm.author} 
                    onChange={handleEditChange} 
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Price (KES) *</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    name="price" 
                    value={editForm.price} 
                    onChange={handleEditChange} 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-input" 
                  name="description" 
                  rows={4} 
                  value={editForm.description} 
                  onChange={handleEditChange} 
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={closeEditModal} className="btn btn-outline" disabled={savingEdit}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={savingEdit}>
                  {savingEdit ? <span className="spinner" /> : <><Save size={16} /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reusable Confirm Modal */}
      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={deleteBook}
        title="Delete Book"
        message="Are you sure you want to delete this book? This action cannot be undone and will remove it from all users' libraries."
        confirmText="Delete Book"
      />
    </div>
  );
}
