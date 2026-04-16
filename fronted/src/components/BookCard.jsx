import { Lock, BookOpen, Headphones } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function BookCard({ book, isPurchased, onBuy, onRead, onListen }) {
  const isAudio = book.type === 'audiobook';
  const navigate = useNavigate();

  const { user } = useAuth();

  const handleCardClick = () => {
    if (book.comingSoon) {
      import('react-hot-toast').then(({ default: toast }) => {
        toast.success('This book will be available soon!');
      });
      return;
    }

    if (user?.disabled) {
      import('react-hot-toast').then(({ default: toast }) => {
        toast.error('Account restricted. Please contact admin.');
      });
      return;
    }

    if (isPurchased) {
      if (isAudio) onListen();
      else onRead();
    } else {
      // Just let it navigate, don't trigger inline Buy modal
      navigate(`/dashboard/book/${book._id}`);
    }
  };

  return (
    <div className="book-card" onClick={(e) => {
      // Allow card click to always navigate to details unless clicking buttons
      navigate(`/dashboard/book/${book._id}`);
    }} style={{ cursor: 'pointer' }}>
      {/* Cover */}
      {book.coverImage?.url || book.coverImage
        ? <img src={book.coverImage?.url || book.coverImage} alt={book.title} className="book-card-cover" />
        : <div className="book-card-cover-placeholder">{isAudio ? '🎧' : '📚'}</div>
      }

      {/* Lock icon for unpurchased */}
      {!isPurchased && !book.comingSoon && (
        <div className="book-card-lock">
          <Lock size={14} color="white" />
        </div>
      )}



      <div className="book-card-body">
        <div className="book-card-title">{book.title}</div>
        <div className="book-card-author">by {book.author}</div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', gap: '0.5rem' }}>
          {book.comingSoon ? (
            <span style={{ background: 'rgba(0, 0, 0, 0.08)', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600, color: '#444' }}>Coming Soon</span>
          ) : (
            <span className="book-card-price" style={{ fontSize: '0.9rem' }}>KES {book.price?.toLocaleString()}</span>
          )}
          {isPurchased && !book.comingSoon ? (
            <button
              onClick={(e) => { e.stopPropagation(); isAudio ? onListen() : onRead(); }}
              className="btn btn-primary btn-sm"
              style={{ padding: '0.35rem 0.75rem' }}>
              {isAudio ? <><Headphones size={12} /> Listen</> : <><BookOpen size={12} /> Read</>}
            </button>
          ) : book.comingSoon ? (
            <button className="btn btn-outline btn-sm" disabled style={{ padding: '0.35rem 0.75rem', opacity: 0.6 }}>
              Soon
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {isAudio && book.chapters?.some(c => c.isSample) && (
                <button onClick={(e) => { e.stopPropagation(); onListen ? onListen() : navigate(`/reader/listen/${book._id}`); }} className="btn btn-outline btn-sm" style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}>
                  Sample
                </button>
              )}
              <button onClick={(e) => { e.stopPropagation(); onBuy(); }} className="btn btn-primary btn-sm" style={{ padding: '0.35rem 0.75rem' }}>
                Buy
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
