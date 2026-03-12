import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Headphones, Trash2, ExternalLink, Plus, Edit2, Check, X } from 'lucide-react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminBooks() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await API.get('/books');
      setBooks(res.data);
    } catch (err) {
      toast.error('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  const deleteBook = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book? This action cannot be undone.')) return;
    try {
      await API.delete(`/admin/books/${id}`);
      setBooks(books.filter(b => b._id !== id));
      toast.success('Book deleted successfully');
    } catch (err) {
      toast.error('Failed to delete book');
    }
  };

  const startEdit = (book) => {
    setEditingId(book._id);
    setEditTitle(book.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const saveEdit = async (id) => {
    if (!editTitle.trim()) return toast.error('Title cannot be empty');
    setSavingEdit(true);
    try {
      const res = await API.put(`/books/${id}`, { title: editTitle.trim() });
      setBooks(books.map(b => b._id === id ? { ...b, title: res.data.book.title } : b));
      toast.success('Title updated');
      cancelEdit();
    } catch (err) {
      toast.error('Failed to update title');
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
                        {editingId === book._id ? (
                           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <input 
                                autoFocus
                                className="form-input"
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.9rem' }}
                                value={editTitle}
                                onChange={e => setEditTitle(e.target.value)}
                                disabled={savingEdit}
                              />
                              <button onClick={() => saveEdit(book._id)} className="btn btn-sm btn-success" style={{ padding: '0.3rem' }} disabled={savingEdit}>
                                {savingEdit ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }}/> : <Check size={14}/>}
                              </button>
                              <button onClick={cancelEdit} className="btn btn-sm btn-outline" style={{ padding: '0.3rem' }} disabled={savingEdit}>
                                <X size={14}/>
                              </button>
                           </div>
                        ) : (
                           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                              {book.title}
                              <button onClick={() => startEdit(book)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', display: 'flex', padding: 2, opacity: 0.7 }} title="Edit Title" className="edit-btn">
                                <Edit2 size={12} />
                              </button>
                           </div>
                        )}
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
                        onClick={() => deleteBook(book._id)}
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
          <style>{`
            .data-table tr:hover .edit-btn { opacity: 1; }
            .edit-btn { transition: opacity 0.2s; }
          `}</style>
        </div>
      )}
    </div>
  );
}
