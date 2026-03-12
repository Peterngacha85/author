import { Lock, BookOpen, Headphones } from 'lucide-react';

export default function BookCard({ book, isPurchased, onBuy, onRead, onListen }) {
  const isAudio = book.type === 'audiobook';

  return (
    <div className="book-card">
      {/* Cover */}
      {book.coverImage?.url
        ? <img src={book.coverImage.url} alt={book.title} className="book-card-cover" />
        : <div className="book-card-cover-placeholder">{isAudio ? '🎧' : '📚'}</div>
      }

      {/* Lock icon for unpurchased */}
      {!isPurchased && (
        <div className="book-card-lock">
          <Lock size={14} color="white" />
        </div>
      )}

      <div className="book-card-body">
        <div className="book-card-title">{book.title}</div>
        <div className="book-card-author">by {book.author}</div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', gap: '0.5rem' }}>
          <span className="book-card-price">KES {book.price?.toLocaleString()}</span>
          {isPurchased ? (
            <button
              onClick={isAudio ? onListen : onRead}
              className="btn btn-primary btn-sm"
              style={{ padding: '0.35rem 0.75rem' }}>
              {isAudio ? <><Headphones size={12} /> Listen</> : <><BookOpen size={12} /> Read</>}
            </button>
          ) : (
            <button onClick={onBuy} className="btn btn-outline btn-sm" style={{ padding: '0.35rem 0.75rem' }}>
              Buy
            </button>
          )}
        </div>

        {/* Sample tag for audio */}
        {isAudio && !isPurchased && book.chapters?.some(c => c.isSample) && (
          <div style={{ marginTop: '0.5rem' }}>
            <span className="badge badge-purple">🎵 Free Sample</span>
          </div>
        )}
      </div>
    </div>
  );
}
