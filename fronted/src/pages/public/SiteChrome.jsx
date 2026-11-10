import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, X, Facebook, Youtube, Instagram } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import CurrencySelector from '../../components/CurrencySelector';
import PaymentModal from '../../components/PaymentModal';

export function SiteNav() {
  const { user } = useAuth();
  const dashboardPath = user?.role === 'admin' ? '/admin' : '/dashboard';

  return (
    <header className="jb-container jb-nav">
      <Link to="/" className="jb-logo">
        <span className="jb-logo-icon"><BookOpen size={22} strokeWidth={1.6} /></span>
        <span className="jb-logo-text">Joe Books</span>
      </Link>
      <nav className="jb-nav-links">
        <CurrencySelector />
        {user
          ? <Link to={dashboardPath} className="jb-nav-link">My dashboard</Link>
          : <Link to="/login" className="jb-nav-link">Sign in</Link>}
        <Link to="/books" className="jb-btn jb-btn-dark">Browse books</Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="jb-footer">
      <div className="jb-container jb-footer-main">
        <span className="jb-footer-brand">Joe Books</span>
        <span className="jb-footer-trust">
          Secure M-Pesa payment <i>·</i> Instant access <i>·</i> Read on any device
        </span>
      </div>
      <div className="jb-container jb-footer-sub">
        <div className="jb-footer-socials">
          <a href="https://www.facebook.com/profile.php?id=61578864759969" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook size={15} /></a>
          <a href="https://www.tiktok.com/@joetales25" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/></svg>
          </a>
          <a href="https://www.youtube.com/@kaburujoseph2025" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><Youtube size={15} /></a>
          <a href="https://www.instagram.com/kaburujoseph" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={15} /></a>
        </div>
        <span>
          © {new Date().getFullYear()} Joe Books · Developed by{' '}
          <a href="https://fastweb.co.ke" target="_blank" rel="noopener noreferrer">Fastweb Technologies</a>
        </span>
      </div>
    </footer>
  );
}

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="jb-modal-overlay" onClick={onClose}>
      <div className="jb-modal" role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()}>
        <div className="jb-modal-header">
          <h2>{title}</h2>
          <button className="jb-modal-close" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// One featured title. `group` holds its eBook/audiobook records (undefined while loading).
export function BookFeatureCard({ config, group, loaded }) {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [payBook, setPayBook] = useState(null);
  const [showAbout, setShowAbout] = useState(false);

  const cover = config.cover || group?.coverUrl || config.fallbackCover;
  const title = config.title;

  const owns = (record) =>
    user?.role === 'admin' || (user?.purchasedItems || []).map(String).includes(String(record._id));

  const act = (record, mode) => {
    if (!user) return navigate('/register');
    if (owns(record)) return navigate(`/reader/${mode}/${record._id}`);
    if (user.disabled) return toast.error('Account restricted');
    setPayBook(record);
  };

  const actions = [];
  if (group?.ebook && !group.ebook.comingSoon) {
    actions.push({ record: group.ebook, mode: 'read', label: owns(group.ebook) ? 'Read now' : `Read · ${formatPrice(group.ebook.price)}` });
  }
  if (group?.audiobook && !group.audiobook.comingSoon) {
    actions.push({ record: group.audiobook, mode: 'listen', label: owns(group.audiobook) ? 'Listen now' : `Listen · ${formatPrice(group.audiobook.price)}` });
  }

  return (
    <article className={`jb-card jb-card-${config.theme}`}>
      <button type="button" className="jb-cover" onClick={() => setShowAbout(true)} aria-label={`About ${title}`}>
        <img src={cover} alt={`${title} cover`} loading="lazy" />
      </button>
      <div className="jb-card-body">
        <span className="jb-eyebrow">{config.label}</span>
        <h3 className="jb-card-title">{title}</h3>
        <p className="jb-card-blurb">{config.blurb}</p>
        <div className="jb-card-actions">
          {actions.map((a, i) => (
            <button key={a.mode} type="button" className={`jb-btn ${i === 0 ? 'jb-btn-solid' : 'jb-btn-outline'}`} onClick={() => act(a.record, a.mode)}>
              {a.label}
            </button>
          ))}
          {loaded && actions.length === 0 && (
            group
              ? <span className="jb-pill">Coming soon</span>
              : <button type="button" className="jb-btn jb-btn-solid" onClick={() => setShowAbout(true)}>About the novel</button>
          )}
        </div>
      </div>

      {showAbout && (
        <Modal title={title} onClose={() => setShowAbout(false)}>
          <div className="jb-about">
            <img src={cover} alt="" />
            <p>{group?.description || config.blurb}</p>
          </div>
        </Modal>
      )}
      {payBook && <PaymentModal book={payBook} onClose={() => setPayBook(null)} />}
    </article>
  );
}
