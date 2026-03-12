import { Lock, BookOpen, Headphones } from 'lucide-react';

export default function BookCard({ book, isPurchased, onBuy, onRead, onListen }) {
  const isAudio = book.type === 'audiobook';

  const handleCardClick = () => {
    if (isPurchased) {
      if (isAudio) onListen();
      else onRead();
    } else {
      // Allow listening to samples even if not purchased
      if (isAudio && book.chapters?.some(c => c.isSample)) {
        onListen();
      } else {
        onBuy();
      }
    }
  };

  return (
    <div className="book-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      {/* Cover */}
      {book.coverImage?.url || book.coverImage
        ? <img src={book.coverImage?.url || book.coverImage} alt={book.title} className="book-card-cover" />
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
          <span className="book-card-price" style={{ fontSize: '0.9rem' }}>KES {book.price?.toLocaleString()}</span>
          {isPurchased ? (
            <button
              onClick={isAudio ? onListen : onRead}
              className="btn btn-primary btn-sm"
              style={{ padding: '0.35rem 0.75rem' }}>
              {isAudio ? <><Headphones size={12} /> Listen</> : <><BookOpen size={12} /> Read</>}
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {isAudio && book.chapters?.some(c => c.isSample) && (
                <button onClick={(e) => { e.stopPropagation(); onListen(); }} className="btn btn-outline btn-sm" style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}>
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
