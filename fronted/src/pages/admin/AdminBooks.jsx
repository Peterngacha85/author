import { useState, useEffect } from 'react';
import { Book, Headphones, Trash2, ExternalLink } from 'lucide-react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

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
                <th>Title & Author</th>
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
                        style={{ width: 40, height: 60, objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600 }}>{book.title}</div>
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
                          const getFileUrl = (b) => {
                            if (b.type === 'ebook') return b.fileUrl?.url || b.fileUrl;
                            return b.chapters?.[0]?.url || b.fileUrl?.url || b.fileUrl;
                          };
                          const url = getFileUrl(book);
                          if (url) window.open(url, '_blank');
                          else toast.error('File not found');
                        }}
                        className="btn btn-sm btn-outline" 
                        title="View File"
                      >
                        <ExternalLink size={14} />
                      </button>
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
        </div>
      )}
    </div>
  );
}
