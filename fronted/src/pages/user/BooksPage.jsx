import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import BookCard from '../../components/BookCard';
import PaymentModal from '../../components/PaymentModal';
import { useAuth } from '../../context/AuthContext';

export default function BooksPage({ type }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [search, setSearch] = useState('');

  const isAudio = type === 'audiobook';
  const purchasedIds = user?.purchasedItems?.map(String) || [];

  useEffect(() => {
    API.get('/books')
      .then(res => setBooks(res.data.filter(b => b.type === type)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [type]);

  const filtered = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>{isAudio ? '🎧 Audiobooks' : '📚 eBooks'}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {books.length} {isAudio ? 'audiobook' : 'eBook'}{books.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <input
          className="form-input"
          style={{ maxWidth: 250 }}
          placeholder="🔍 Search books..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <span className="spinner spinner-lg" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">{isAudio ? '🎧' : '📚'}</div>
          <div className="empty-state-text">{search ? 'No books match your search' : `No ${isAudio ? 'audiobooks' : 'eBooks'} available yet`}</div>
        </div>
      ) : (
        <div className="books-grid">
          {filtered.map(book => (
            <BookCard
              key={book._id}
              book={book}
              isPurchased={purchasedIds.includes(String(book._id))}
              onBuy={() => setSelectedBook(book)}
              onRead={() => navigate(`/reader/read/${book._id}`)}
              onListen={() => navigate(`/reader/listen/${book._id}`)}
            />
          ))}
        </div>
      )}

      {selectedBook && (
        <PaymentModal book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}
    </div>
  );
}
