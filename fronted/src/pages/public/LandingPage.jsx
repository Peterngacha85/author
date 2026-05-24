import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Headphones, ShieldCheck, Lock, ArrowRight, Star, Menu, X, LayoutDashboard, Facebook, Youtube, CheckCircle, Smartphone, Heart, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './LandingPage.css';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

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

      {/* ===== HERO — Emotion-First, Book-Focused ===== */}
      <section className="landing-hero">
        <div className="landing-hero-inner">
          {/* Text Side */}
          <div className="landing-hero-text">
            <span className="landing-hero-tagline">A Novel by Joseph Kaburu</span>
            
            <h1 className="landing-hero-heading">
              One message.
              <span className="landing-hero-heading-accent">
                And everything fell apart.
              </span>
            </h1>

            <p className="landing-hero-subtitle">
              "A Single Text That Steals Forever Promised"
            </p>

            <p className="landing-hero-emotion">
              If you've ever loved someone so deeply that a single message could shatter your world — this story was written for you. Read it. Feel it. Live it.
            </p>

            <div className="landing-hero-buttons">
              <Link 
                to={user ? dashboardPath : "/register"} 
                className="landing-cta-primary"
              >
                <Headphones size={20} />
                Listen — KES 200
              </Link>
              <Link 
                to={user ? dashboardPath : "/register"} 
                className="landing-cta-secondary"
              >
                <BookOpen size={20} />
                Read Now — KES 150
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

          {/* Book Cover Side */}
          <div className="landing-hero-book">
            <Link to={user ? dashboardPath : "/register"} className="landing-book-wrapper" style={{ display: 'block', textDecoration: 'none' }}>
              <img 
                src="/images/african-touch-image.jpeg" 
                alt="African touch hero image" 
                className="landing-book-image"
              />
              <div className="landing-book-badge">🔥 New Release</div>
            </Link>
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

            <Link to={user ? dashboardPath : "/register"} className="landing-price-btn landing-price-btn-secondary">
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
            <div className="landing-price-amount">
              200 <span className="landing-price-currency">KES</span>
            </div>
            <div className="landing-price-note">One-time payment • Listen anywhere</div>
            
            <ul className="landing-price-features">
              <li><CheckCircle size={16} /> Professional narration</li>
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
                  href="https://www.tiktok.com/@jkabul25" 
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
    </div>
  );
}
