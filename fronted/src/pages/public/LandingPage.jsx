import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Headphones, Play, Pause, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import { useCurrency } from '../../context/CurrencyContext';
import { FEATURED, buildRows, findGroup, titleKey, useCatalog } from './useCatalog';
import { SiteNav, SiteFooter, BookFeatureCard, BookRow, Modal } from './SiteChrome';
import './LandingPage.css';

function AudioSamplePlayer({ chapters }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const chapter = chapters[currentIdx];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onEnded = () => {
      if (currentIdx < chapters.length - 1) {
        setCurrentIdx(i => i + 1);
      } else {
        setPlaying(false);
        setCurrentTime(0);
      }
    };
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended', onEnded);
    };
  }, [currentIdx, chapters.length]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.load();
    setCurrentTime(0);
    setDuration(0);
    if (playing) audio.play().catch(() => setPlaying(false));
  }, [currentIdx]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().catch(() => setPlaying(false));
      setPlaying(true);
    }
  };

  const seek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="jb-player">
      <audio ref={audioRef} src={chapter.url} preload="metadata" />
      {chapters.length > 1 && (
        <div className="jb-player-chapters">
          {chapters.map((ch, i) => (
            <button
              key={ch._id}
              className={i === currentIdx ? 'active' : ''}
              onClick={() => { setCurrentIdx(i); setPlaying(false); }}
            >
              {ch.title || `Chapter ${i + 1}`}
            </button>
          ))}
        </div>
      )}
      <div className="jb-player-row">
        <button className="jb-player-play" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <div className="jb-player-info">
          <span className="jb-player-name">{chapter.title || 'Free sample'}</span>
          <div className="jb-player-bar" onClick={seek}>
            <div style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }} />
          </div>
          <div className="jb-player-times"><span>{fmt(currentTime)}</span><span>{fmt(duration)}</span></div>
        </div>
      </div>
    </div>
  );
}

function Stars({ value, size = 16 }) {
  return (
    <span className="jb-stars" aria-label={`${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size} fill={i <= Math.round(value) ? 'currentColor' : 'none'} />
      ))}
    </span>
  );
}

const FORMAT_LABEL = { ebook: 'eBook', audiobook: 'Audiobook' };

const avgOf = (list) => (list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0);

function ReviewsModal({ reviews, onClose }) {
  const [book, setBook] = useState('all');
  const [format, setFormat] = useState('all');

  const bookTitles = [...new Set(reviews.map(r => r.bookTitle))];
  const byBook = reviews.filter(r => book === 'all' || r.bookTitle === book);
  const formats = ['ebook', 'audiobook'].filter(f => byBook.some(r => r.bookType === f));
  const visible = byBook.filter(r => format === 'all' || r.bookType === format);

  // Group into "Book · Format" sections, keeping newest-first order inside each.
  const sections = [];
  for (const r of visible) {
    const id = `${r.bookTitle}|${r.bookType}`;
    let s = sections.find(x => x.id === id);
    if (!s) sections.push(s = { id, title: r.bookTitle, type: r.bookType, items: [] });
    s.items.push(r);
  }

  const pickBook = (t) => {
    setBook(t);
    // Reset format if the chosen book has no reviews in it.
    if (format !== 'all' && !reviews.some(r => (t === 'all' || r.bookTitle === t) && r.bookType === format)) setFormat('all');
  };

  return (
    <Modal title="Reader reviews" onClose={onClose}>
      <div className="jb-filters">
        <div className="jb-filter-group" role="group" aria-label="Filter by book">
          <span className="jb-filter-label">Book</span>
          <button className={`jb-chip${book === 'all' ? ' active' : ''}`} onClick={() => pickBook('all')}>
            All books <em>{reviews.length}</em>
          </button>
          {bookTitles.map(t => (
            <button key={t} className={`jb-chip${book === t ? ' active' : ''}`} onClick={() => pickBook(t)}>
              {t} <em>{reviews.filter(r => r.bookTitle === t).length}</em>
            </button>
          ))}
        </div>
        {formats.length > 0 && (
          <div className="jb-filter-group" role="group" aria-label="Filter by format">
            <span className="jb-filter-label">Format</span>
            <button className={`jb-chip${format === 'all' ? ' active' : ''}`} onClick={() => setFormat('all')}>
              All <em>{byBook.length}</em>
            </button>
            {formats.map(f => (
              <button key={f} className={`jb-chip${format === f ? ' active' : ''}`} onClick={() => setFormat(f)}>
                {f === 'audiobook' ? <Headphones size={13} /> : <BookOpen size={13} />}
                {FORMAT_LABEL[f]} <em>{byBook.filter(r => r.bookType === f).length}</em>
              </button>
            ))}
          </div>
        )}
      </div>

      {sections.length === 0 ? (
        <p className="jb-muted">No reviews match these filters yet.</p>
      ) : sections.map(s => (
        <section key={s.id} className="jb-review-section">
          <header className="jb-review-section-head">
            <h3>{s.title} <span className="jb-tag">{FORMAT_LABEL[s.type]}</span></h3>
            <span className="jb-rating"><Stars value={avgOf(s.items)} size={13} /> {avgOf(s.items).toFixed(1)} · {s.items.length}</span>
          </header>
          <div className="jb-review-list">
            {s.items.map(r => (
              <div key={r._id} className="jb-review-item">
                <div className="jb-review-meta">
                  <Stars value={r.rating} size={13} />
                  <strong>{r.userName}</strong>
                  {r.createdAt && (
                    <span className="jb-muted">
                      {new Date(r.createdAt).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
                <p>“{r.comment}”</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </Modal>
  );
}

export default function LandingPage() {
  const { user } = useAuth();
  const { groups, others, books, loaded } = useCatalog();
  const { formatPrice } = useCurrency();
  const comingSoon = buildRows(others, loaded, formatPrice).filter(r => r.comingSoon);
  const [samples, setSamples] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showReviews, setShowReviews] = useState(false);

  const dashboardPath = user?.role === 'admin' ? '/admin' : '/dashboard';

  useEffect(() => {
    API.get('/books/samples').then(res => setSamples(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!books.length) return;
    Promise.all(
      books.map(b => {
        const key = titleKey(b.title);
        // Prefer the clean display title for featured books (DB has e.g. a trailing full stop).
        const bookTitle = FEATURED.find(f => key.includes(f.key))?.title || b.title;
        return API.get(`/books/${b._id}/reviews`)
          .then(r => r.data.map(rv => ({ ...rv, bookTitle, bookType: b.type })))
          .catch(() => []);
      })
    ).then(all => {
      setReviews(all.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    });
  }, [books]);

  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div className="jb">
      <SiteNav />

      <main>
        <section className="jb-container jb-hero">
          <h1 className="jb-display">
            Stories of love, choices
            <em>and consequences.</em>
          </h1>
          <p className="jb-lede">Read on any device or listen on the go. Pay securely with M-Pesa.</p>
        </section>

        <section className="jb-container jb-grid" aria-label="Featured books">
          {FEATURED.map(f => (
            <BookFeatureCard key={f.key} config={f} group={findGroup(groups, f.key)} loaded={loaded} />
          ))}
        </section>

        {samples.length > 0 && (
          <section className="jb-container jb-section">
            <h2 className="jb-h2">Try before you buy</h2>
            <div className="jb-sample-grid">
              {samples.map(book => (
                <div key={book._id} className="jb-sample">
                  <div className="jb-sample-top">
                    {book.coverImage?.url && <img src={book.coverImage.url} alt={book.title} className="jb-sample-cover" />}
                    <div>
                      <span className="jb-eyebrow">
                        {book.type === 'audiobook'
                          ? <><Headphones size={13} /> Audiobook sample</>
                          : <><BookOpen size={13} /> eBook sample</>}
                      </span>
                      <h3 className="jb-sample-title">{book.title}</h3>
                      {book.type === 'audiobook' && <p className="jb-muted">Narrated by Guy Barnes</p>}
                    </div>
                  </div>
                  {book.type === 'audiobook' && book.chapters?.length > 0 && <AudioSamplePlayer chapters={book.chapters} />}
                  {book.type === 'ebook' && book.ebookFiles?.length > 0 && (
                    <Link to={user ? dashboardPath : '/register'} className="jb-btn jb-btn-outline">Read free sample</Link>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {reviews.length > 0 && (
          <section className="jb-container jb-section">
            <div className="jb-section-head">
              <h2 className="jb-h2">What readers say</h2>
              <span className="jb-rating">
                <Stars value={avgRating} /> {avgRating.toFixed(1)} · {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </span>
            </div>
            <div className="jb-review-grid">
              {reviews.slice(0, 3).map(r => (
                <figure key={r._id} className="jb-review">
                  <Stars value={r.rating} size={14} />
                  <blockquote>“{r.comment}”</blockquote>
                  <figcaption>
                    {r.userName}
                    <span className="jb-tag">{r.bookTitle} · {FORMAT_LABEL[r.bookType]}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
            {reviews.length > 3 && (
              <button className="jb-btn jb-btn-outline jb-mt" onClick={() => setShowReviews(true)}>See all reviews</button>
            )}
          </section>
        )}

        <section className="jb-container jb-section">
          <h2 className="jb-h2">Also from Joe Books</h2>
          <div className="jb-rows-tight">
            {comingSoon.map(r => <BookRow key={r.key} item={r} />)}
          </div>
          <div className="jb-strip">
            <div>
              <h3 className="jb-strip-title">Explore the catalogue</h3>
              <p className="jb-muted">Discover more stories by Joseph Kaburu.</p>
            </div>
            <Link to="/books" className="jb-btn jb-btn-outline">Browse all books</Link>
          </div>
        </section>
      </main>

      <SiteFooter />

      {showReviews && (
        <ReviewsModal reviews={reviews} onClose={() => setShowReviews(false)} />
      )}
    </div>
  );
}
