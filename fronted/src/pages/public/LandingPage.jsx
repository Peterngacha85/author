import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Headphones, ShieldCheck, Lock, ArrowRight, Star, Menu, X, LayoutDashboard, Facebook, Youtube, CheckCircle, Smartphone, Heart, Zap, Play, Pause, Volume2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
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
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * duration;
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="lp-audio-player">
      <audio ref={audioRef} src={chapter.url} preload="metadata" />

      {chapters.length > 1 && (
        <div className="lp-audio-chapters">
          {chapters.map((ch, i) => (
            <button
              key={ch._id}
              className={`lp-audio-chapter-btn${i === currentIdx ? ' active' : ''}`}
              onClick={() => { setCurrentIdx(i); setPlaying(false); }}
            >
              {ch.title || `Chapter ${i + 1}`}
            </button>
          ))}
        </div>
      )}

      <div className="lp-audio-controls">
        <button className="lp-audio-play-btn" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <div className="lp-audio-info">
          <span className="lp-audio-chapter-name">{chapter.title || 'Free Sample'}</span>
          <div className="lp-audio-progress-bar" onClick={seek}>
            <div
              className="lp-audio-progress-fill"
              style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
            />
          </div>
          <div className="lp-audio-times">
            <span>{fmt(currentTime)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [samples, setSamples] = useState([]);
  const [heroBook, setHeroBook] = useState(null);
  const [heroReviews, setHeroReviews] = useState([]);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [showSynopsisModal, setShowSynopsisModal] = useState(false);

  useEffect(() => {
    API.get('/books/samples')
      .then(res => setSamples(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    API.get('/books')
      .then(res => {
        if (!res.data.length) return;
        const book = res.data[0];
        setHeroBook(book);
        API.get(`/books/${book._id}/reviews`)
          .then(r => setHeroReviews(r.data))
          .catch(() => {});
      })
      .catch(() => {});
  }, []);

  const dashboardPath = user?.role === 'admin' ? '/admin' : '/dashboard';

  return (
    <div className="landing-root">
      {/* Atmospheric Background Glows */}
      <div className="landing-bg-glow-1" />
      <div className="landing-bg-glow-2" />
      <div className="landing-bg-glow-3" />

      {/* ===== Navigation ===== */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <div className="landing-logo-icon">📚</div>
          Joe Books
        </div>

        <button 
          className="landing-menu-toggle" 
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`landing-nav-links ${menuOpen ? 'open' : ''}`}>
          {user ? (
            <Link 
              to={dashboardPath}
              className="landing-nav-cta"
              onClick={() => setMenuOpen(false)}
            >
              <LayoutDashboard size={16} /> My Dashboard
            </Link>
          ) : (
            <>
              <Link 
                to="/login" 
                className="landing-nav-link"
                onClick={() => setMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="landing-nav-cta"
                onClick={() => setMenuOpen(false)}
              >
                Get the Book
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ===== HERO — Kobo-style: book left, content right ===== */}
      <section className="landing-hero">
        <div className="landing-hero-inner">

          {/* Text Side — right on desktop, bottom on mobile */}
          <div className="landing-hero-text">
            <span className="landing-hero-tagline">A Novel by Joseph Kaburu</span>
            <span className="landing-hero-narrator">Narrated by: Guy Barnes</span>

            <h1 className="landing-hero-heading">
              One message.
              <span className="landing-hero-heading-accent">
                And everything fell apart.
              </span>
            </h1>

            <p className="landing-hero-subtitle">
              "A single Text that Stole Forever Promised"
            </p>

            {heroBook?.description && (
              <div className="landing-hero-synopsis-section">
                <span className="landing-synopsis-label">Synopsis</span>
                <p className="landing-hero-synopsis">
                  {heroBook.description.length > 220
                    ? heroBook.description.slice(0, 220) + '…'
                    : heroBook.description}
                </p>
                {heroBook.description.length > 220 && (
                  <button className="landing-hero-read-more" onClick={() => setShowSynopsisModal(true)}>
                    Read More
                  </button>
                )}
              </div>
            )}

            <div className="landing-hero-buttons">
              <Link to={user ? dashboardPath : "/register"} className="landing-cta-primary">
                <BookOpen size={20} />
                Read Now — KES 150
              </Link>
              <Link to={user ? dashboardPath : "/register"} className="landing-cta-secondary">
                <Headphones size={20} />
                Listen — KES 200
              </Link>
            </div>

            <div className="landing-trust-row">
              <div className="landing-trust-item">
                <Lock size={14} />
                <span>Secure M-Pesa Payment</span>
              </div>
              <div className="landing-trust-item">
                <Zap size={14} />
                <span>Instant Access</span>
              </div>
              <div className="landing-trust-item">
                <Smartphone size={14} />
                <span>Read on Any Device</span>
              </div>
            </div>
          </div>

          {/* Book Cover Side — left on desktop, top on mobile */}
          <div className="landing-hero-book">
            <Link to={user ? dashboardPath : "/register"} className="landing-book-wrapper">
              <img
                src="/images/african-touch-image.jpeg"
                alt="African touch hero image"
                className="landing-book-image"
              />
              <div className="landing-book-badge">🔥 Get the message!</div>
            </Link>

            {heroBook && (
              <button
                className="landing-hero-rating-row"
                onClick={() => setShowReviewsModal(true)}
                aria-label="View all reviews"
              >
                <div className="landing-hero-rating-stars">
                  {[1,2,3,4,5].map(i => (
                    <Star
                      key={i}
                      size={18}
                      fill={i <= Math.round(heroBook.avgRating || 0) ? '#FFB800' : 'none'}
                      color={i <= Math.round(heroBook.avgRating || 0) ? '#FFB800' : '#555'}
                    />
                  ))}
                </div>
                <span className="landing-hero-rating-label">
                  {heroBook.avgRating ? heroBook.avgRating.toFixed(1) : '—'}&nbsp;
                  ({heroBook.reviewCount || 0} {heroBook.reviewCount === 1 ? 'review' : 'reviews'})
                </span>
                <span className="landing-hero-rating-cta">See all reviews →</span>
              </button>
            )}
          </div>

        </div>
      </section>

      {/* ===== Social Proof / Emotional Testimonial ===== */}
      <section className="landing-social-proof">
        <div className="landing-social-proof-inner">
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.3rem', marginBottom: '1.5rem' }}>
            {[1,2,3,4,5].map(i => <Star key={i} size={18} fill="#FF4D4D" color="#FF4D4D" />)}
          </div>
          <p className="landing-testimonial">
            "I opened it out of curiosity. I finished it in one sitting."
          </p>
          <p className="landing-testimonial-author">— Early Reader Review</p>
        </div>
      </section>

      {/* ===== Free Preview Section ===== */}
      {samples.length > 0 && (
        <section className="landing-preview-section">
          <div className="landing-preview-header">
            <h2 className="landing-preview-title">Try Before You Buy</h2>
            <p className="landing-preview-subtitle">The Sample</p>
          </div>

          <div className="landing-preview-grid">
            {samples.map(book => (
              <div key={book._id} className="landing-preview-card">
                <div className="landing-preview-card-top">
                  {book.coverImage?.url && (
                    <img
                      src={book.coverImage.url}
                      alt={book.title}
                      className="landing-preview-cover"
                    />
                  )}
                  <div className="landing-preview-meta">
                    <span className="landing-preview-type">
                      {book.type === 'audiobook' ? <><Headphones size={14} /> Audiobook Sample</> : <><BookOpen size={14} /> eBook Sample</>}
                    </span>
                    <h3 className="landing-preview-book-title">{book.title}</h3>
                    {book.type === 'audiobook' && (
                      <p className="landing-preview-narrator">Narrated by: Guy Barnes</p>
                    )}
                  </div>
                </div>

                {book.type === 'audiobook' && book.chapters?.length > 0 && (
                  <AudioSamplePlayer chapters={book.chapters} />
                )}

                {book.type === 'ebook' && book.ebookFiles?.length > 0 && (
                  <Link to={user ? dashboardPath : '/register'} className="landing-preview-read-btn">
                    <BookOpen size={16} /> Read Free Sample
                  </Link>
                )}

                <Link to={user ? dashboardPath : '/register'} className="landing-preview-cta">
                  Get Full Access <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== Pricing / Format Selection ===== */}
      <section className="landing-pricing" id="pricing">
        <div className="landing-pricing-header">
          <h2 className="landing-pricing-title">Choose Your Experience</h2>
          <p className="landing-pricing-subtitle">
            Read at your pace or listen on the go. Both formats deliver the full emotional journey.
          </p>
        </div>

        <div className="landing-pricing-grid">
          {/* eBook Card */}
          <div className="landing-price-card">
            <div className="landing-price-card-icon">
              <BookOpen size={26} />
            </div>
            <div className="landing-price-card-type">eBook</div>
            <div className="landing-price-card-name">Read It</div>
            <div className="landing-price-amount">
              150 <span className="landing-price-currency">KES</span>
            </div>
            <div className="landing-price-note">One-time payment • Yours forever</div>
            
            <ul className="landing-price-features">
              <li><CheckCircle size={16} /> Instant access after payment</li>
              <li><CheckCircle size={16} /> Read on phone, tablet, or laptop</li>
              <li><CheckCircle size={16} /> Remembers your last page</li>
              <li><CheckCircle size={16} /> Yours to keep forever</li>
            </ul>

            <Link to={user ? dashboardPath : "/register"} className="landing-price-btn landing-price-btn-primary">
              Start Reading <ArrowRight size={16} style={{ marginLeft: '0.4rem' }} />
            </Link>
            <div className="landing-payment-badge">
              <Lock size={12} /> Secure M-Pesa Payment
            </div>
          </div>

          {/* Audiobook Card — Popular */}
          <div className="landing-price-card landing-price-card-popular">
            <div className="landing-price-card-icon">
              <Headphones size={26} />
            </div>
            <div className="landing-price-card-type">Audiobook</div>
            <div className="landing-price-card-name">Feel It</div>
            <div className="landing-price-narrator">Narrated by: Guy Barnes</div>
            <div className="landing-price-amount">
              200 <span className="landing-price-currency">KES</span>
            </div>
            <div className="landing-price-note">One-time payment • Listen anywhere</div>
            
            <ul className="landing-price-features">
              <li><CheckCircle size={16} /> Listen on any device</li>
              <li><CheckCircle size={16} /> Free preview available</li>
              <li><CheckCircle size={16} /> Feel every emotion</li>
            </ul>

            <Link to={user ? dashboardPath : "/register"} className="landing-price-btn landing-price-btn-primary">
              Start Listening <ArrowRight size={16} style={{ marginLeft: '0.4rem' }} />
            </Link>
            <div className="landing-payment-badge">
              <Lock size={12} /> Secure M-Pesa Payment
            </div>
          </div>
        </div>
      </section>

      {/* ===== Emotional Hook / About the Story ===== */}
      <section className="landing-about">
        <div className="landing-about-inner">
          <h2 className="landing-about-heading">
            Some stories are written.<br />
            <span style={{ color: '#FF4D4D' }}>This one was lived.</span>
          </h2>
          <p className="landing-about-text">
            <em>Just One Text</em> is not fiction pulled from thin air. It's a raw, unflinching story born from real heartbreak, real choices, and the moment when one message changed everything.
          </p>
          <p className="landing-about-text">
            If you've ever trusted the wrong person, loved too hard, or had your world collapse in an instant — you'll see yourself in these pages.
          </p>
          <Link to={user ? dashboardPath : "/register"} className="landing-about-cta">
            <Heart size={18} />
            Start reading now!
          </Link>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <div className="landing-logo">
              <div className="landing-logo-icon">📚</div>
              Joe Books
            </div>
            <p>Powerful stories inspired by real experiences. Read or listen, anytime, anywhere.</p>
          </div>

          <div className="landing-footer-columns">
            <div className="landing-footer-col">
              <h4>Platform</h4>
              <Link to="/login">Browse eBooks</Link>
              <Link to="/login">Audiobooks</Link>
            </div>
            <div className="landing-footer-col">
              <h4>Connect</h4>
              <div className="landing-footer-socials">
                <a 
                  href="https://www.facebook.com/profile.php?id=61578864759969" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="landing-footer-social-link fb"
                  aria-label="Facebook"
                >
                  <Facebook size={16} />
                </a>
                <a 
                  href="https://www.tiktok.com/@joetales25" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="landing-footer-social-link tt"
                  aria-label="TikTok"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/>
                  </svg>
                </a>
                <a 
                  href="https://www.youtube.com/@kaburujoseph2025" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="landing-footer-social-link yt"
                  aria-label="YouTube"
                >
                  <Youtube size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="landing-footer-bottom">
          © 2026 Joe Books. All rights reserved. Developed by{' '}
          <a href="https://fastweb.co.ke" target="_blank" rel="noopener noreferrer">
            Fastweb Technologies
          </a>
        </div>
      </footer>

      {/* ===== Reviews Modal ===== */}
      {showReviewsModal && (
        <div className="lp-modal-overlay" onClick={() => setShowReviewsModal(false)}>
          <div className="lp-modal" onClick={e => e.stopPropagation()}>
            <div className="lp-modal-header">
              <h2 className="lp-modal-title">Reader Reviews</h2>
              <button className="lp-modal-close" onClick={() => setShowReviewsModal(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            {heroBook && (
              <div className="lp-modal-rating-summary">
                {[1,2,3,4,5].map(i => (
                  <Star
                    key={i}
                    size={22}
                    fill={i <= Math.round(heroBook.avgRating || 0) ? '#FFB800' : 'none'}
                    color={i <= Math.round(heroBook.avgRating || 0) ? '#FFB800' : '#555'}
                  />
                ))}
                <span className="lp-modal-rating-num">
                  {heroBook.avgRating ? heroBook.avgRating.toFixed(1) : '—'} out of 5
                </span>
                <span className="lp-modal-rating-count">
                  ({heroBook.reviewCount || 0} {heroBook.reviewCount === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}
            <div className="lp-modal-reviews-list">
              {heroReviews.length === 0 ? (
                <p className="lp-modal-empty">No reviews yet. Be the first to review!</p>
              ) : heroReviews.map(r => (
                <div key={r._id} className="lp-modal-review-item">
                  <div className="lp-modal-review-top">
                    <div className="lp-modal-review-stars">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={14} fill={i <= r.rating ? '#FFB800' : 'none'} color={i <= r.rating ? '#FFB800' : '#555'} />
                      ))}
                    </div>
                    <span className="lp-modal-review-author">{r.userName}</span>
                    {r.createdAt && (
                      <span className="lp-modal-review-date">
                        {new Date(r.createdAt).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <p className="lp-modal-review-text">"{r.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== Synopsis Modal ===== */}
      {showSynopsisModal && heroBook?.description && (
        <div className="lp-modal-overlay" onClick={() => setShowSynopsisModal(false)}>
          <div className="lp-modal" onClick={e => e.stopPropagation()}>
            <div className="lp-modal-header">
              <h2 className="lp-modal-title">Synopsis</h2>
              <button className="lp-modal-close" onClick={() => setShowSynopsisModal(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <p className="lp-modal-synopsis-text">{heroBook.description}</p>
          </div>
        </div>
      )}

    </div>
  );
}
