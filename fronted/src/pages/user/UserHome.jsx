import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Headphones, ShoppingBag, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import BookCard from '../../components/BookCard';
import PaymentModal from '../../components/PaymentModal';

export default function UserHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    API.get('/books')
      .then(res => setBooks(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const ebooks     = books.filter(b => b.type === 'ebook');
  const audiobooks = books.filter(b => b.type === 'audiobook');
  // TEMPORARY: Show all books as purchased for testing
  const purchasedIds = books.map(b => b._id); // Was: user?.purchasedItems || [];

  const stats = [
    { icon: '📚', label: 'Total eBooks',     value: ebooks.length,     color: 'rgba(255,56,92,0.1)' },
    { icon: '🎧', label: 'Audiobooks',       value: audiobooks.length, color: 'rgba(0,132,137,0.1)' },
    { icon: '✅', label: 'My Collection',    value: purchasedIds.length, color: 'rgba(0,166,153,0.1)' },
    { icon: '⭐', label: 'Staff Picks',      value: Math.min(books.length, 3), color: 'rgba(255,180,0,0.1)' },
  ];

  return (
    <div className="fade-in">
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-primary) 0%, #C2006A 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '2.5rem',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(255,56,92,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: 'white'
      }}>
        <div style={{ position: 'absolute', right: '-30px', top: '-30px', width: 200, height: 200, background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', right: '60px', bottom: '-50px', width: 150, height: 150, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.25rem' }}>Good {new Date().getHours() < 12 ? 'morning' : 'day'},</div>
          <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 2rem)', margin: 0 }}>
            {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', marginTop: '0.4rem', fontSize: '0.9rem' }}>
            Your personal digital library awaits
          </p>
          <button onClick={() => navigate('/dashboard/ebooks')} className="btn" style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(10px)' }}>
            Browse Books <BookOpen size={16} />
          </button>
        </div>
        <div style={{ fontSize: '5rem', position: 'relative', display: 'none' }}>📖</div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.color }}>{s.icon}</div>
            <div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{loading ? '–' : s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Featured eBooks */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem' }}>📚 eBooks</h2>
          <button onClick={() => navigate('/dashboard/ebooks')} className="btn btn-outline btn-sm">View All</button>
        </div>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><span className="spinner spinner-lg" /></div>
        ) : ebooks.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📭</div><div className="empty-state-text">No eBooks available yet</div></div>
        ) : (
          <div className="books-grid">
            {ebooks.slice(0, 4).map(book => (
              <BookCard key={book._id} book={book} isPurchased={purchasedIds.includes(book._id)}
                onBuy={() => setSelectedBook(book)}
                onRead={() => navigate(`/reader/read/${book._id}`)} />
            ))}
          </div>
        )}
      </div>

      {/* Featured Audiobooks */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem' }}>🎧 Audiobooks</h2>
          <button onClick={() => navigate('/dashboard/audio')} className="btn btn-outline btn-sm">View All</button>
        </div>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><span className="spinner spinner-lg" /></div>
        ) : audiobooks.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🎧</div><div className="empty-state-text">No audiobooks yet</div></div>
        ) : (
          <div className="books-grid">
            {audiobooks.slice(0, 4).map(book => (
              <BookCard key={book._id} book={book} isPurchased={purchasedIds.includes(book._id)}
                onBuy={() => setSelectedBook(book)}
                onListen={() => navigate(`/reader/listen/${book._id}`)} />
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {selectedBook && (
        <PaymentModal book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}
    </div>
  );
}
