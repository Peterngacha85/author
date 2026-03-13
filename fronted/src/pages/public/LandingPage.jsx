import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Headphones, ShieldCheck, CreditCard, ArrowRight, Star, Menu, X, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './LandingPage.css';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const dashboardPath = user?.role === 'admin' ? '/admin' : '/dashboard';

  // Premium Aesthetic Palette (derived from screenshot)
  const colors = {
    charcoal: '#0A0A0B',
    deepRed: '#4A0404',
    bloodRed: '#8B0000',
    brightRed: '#9B1B1B', // More cinematic red from screenshot
    surface: '#121214',
    textPrimary: '#FFFFFF',
    textSecondary: '#D1D1D1',
    border: 'rgba(255, 255, 255, 0.08)',
    accentRed: '#FF4D4D' // For the "right in your pocket" text
  };

  return (
    <div style={{ 
      background: 'linear-gradient(180deg, #0A0A0B 0%, #3B0404 100%)', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      color: colors.textPrimary, 
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Cinematic Background Glows */}
      <div style={{ position: 'absolute', top: '10%', right: '-10%', width: '600px', height: '600px', background: `radial-gradient(circle, ${colors.brightRed}15 0%, transparent 70%)`, filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '20%', left: '-5%', width: '500px', height: '500px', background: `radial-gradient(circle, ${colors.deepRed}25 0%, transparent 70%)`, filter: 'blur(120px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Navigation */}
      <nav style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        padding: '1.25rem 5%', background: 'rgba(10, 10, 11, 0.8)', 
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${colors.border}`,
        position: 'sticky', top: 0, zIndex: 100 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            width: 32, height: 32, 
            background: colors.brightRed, 
            borderRadius: '6px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: '1rem'
          }}>📚</div>
            Joe Books
        </div>

        {/* Hamburger Toggle */}
        <button 
          className="landing-menu-toggle" 
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Nav Links */}
        <div className={`landing-nav-links ${menuOpen ? 'open' : ''}`}>
          {user ? (
            <Link 
              to={dashboardPath}
              style={{ 
                background: colors.brightRed, 
                color: 'white',
                padding: '0.6rem 1.2rem', 
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onClick={() => setMenuOpen(false)}
            >
              <LayoutDashboard size={16} />
              My Dashboard
            </Link>
          ) : (
            <>
              <Link 
                to="/login" 
                style={{ color: colors.textPrimary, fontWeight: 500, textDecoration: 'none', fontSize: '0.9rem' }}
                onClick={() => setMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                style={{ 
                  background: colors.brightRed, 
                  color: 'white',
                  padding: '0.6rem 1.2rem', 
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
                onClick={() => setMenuOpen(false)}
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        padding: '8rem 5% 6rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
          maxWidth: 1200, width: '100%', gap: '4rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: '1 1 500px', maxWidth: 550 }}>
            <h1 
              className="landing-hero-heading"
              style={{ 
                fontSize: 'clamp(3rem, 5vw, 4.2rem)', lineHeight: 1.1, marginBottom: '1.5rem', 
                color: colors.textPrimary, fontWeight: 800, letterSpacing: '-1.5px' 
              }}
            >
              Your premium digital library, <br />
              <span style={{ color: colors.accentRed }}>right in your pocket.</span>
            </h1>
            <p style={{ fontSize: '1.1rem', color: colors.textSecondary, marginBottom: '2.5rem', lineHeight: 1.6, maxWidth: 480 }}>
              Discover thousands of inspiring eBooks and Audiobooks. Written for Kenyans, by Kenyans. Secure your copy today and read anywhere, anytime.
            </p>
            <div className="landing-hero-buttons">
              <Link to={user ? dashboardPath : "/register"} style={{ 
                fontSize: '1rem', padding: '1rem 2rem', background: colors.brightRed,
                color: 'white', borderRadius: '6px', fontWeight: 700, textDecoration: 'none'
              }}>
                {user ? 'Go to Dashboard' : 'Start Reading'}
              </Link>
              <Link to={user ? dashboardPath : "/login"} style={{ 
                fontSize: '1rem', padding: '1rem 2rem', color: colors.textPrimary, 
                border: `1px solid ${colors.border}`, borderRadius: '6px', fontWeight: 600, textDecoration: 'none',
                background: 'rgba(255,255,255,0.02)'
              }}>
                {user ? 'View Catalog' : 'Sign In'}
              </Link>
            </div>
            
            <div className="landing-stats">
              <div><div style={{ fontSize: '1.5rem', fontWeight: 800, color: colors.textPrimary }}>10K+</div><div style={{ fontSize: '0.8rem', color: colors.textSecondary }}>Active Readers</div></div>
              <div><div style={{ fontSize: '1.5rem', fontWeight: 800, color: colors.textPrimary }}>500+</div><div style={{ fontSize: '0.8rem', color: colors.textSecondary }}>Premium Books</div></div>
              <div><div style={{ fontSize: '1.5rem', fontWeight: 800, color: colors.textPrimary }}>4.9/5</div><div style={{ fontSize: '0.8rem', color: colors.textSecondary }}>Average Rating</div></div>
            </div>
          </div>

          <div style={{ flex: '1 1 500px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ 
              position: 'relative', 
              width: '100%', maxWidth: 500,
              borderRadius: '24px', overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
            }}>
              <img 
                src="/images/hero.png" 
                alt="Reader" 
                style={{ width: '100%', display: 'block' }} 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section (Screenshot Style) */}
      <section style={{ 
        padding: '6rem 5%', 
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: colors.textPrimary }}>Why choose Joe Books?</h2>
        <p style={{ color: colors.textSecondary, fontSize: '1rem', maxWidth: 600, margin: '0 auto 4rem', lineHeight: 1.5 }}>
          We built a platform that respects authors and provides an unmatched reading experience.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {[
            { icon: ShieldCheck, title: 'Anti-Piracy Security', desc: 'Secure viewers ensure books cannot be downloaded or screenshotted. Authors are protected.' },
            { icon: CreditCard, title: 'Easy M-Pesa Payments', desc: 'Seamlessly pay via Lipa na M-Pesa. Instant access inside the app upon confirmation.' },
            { icon: BookOpen, title: 'High Quality eBooks', desc: 'Read comfortably with our custom PDF viewer. Remembers your last read page automatically.' },
            { icon: Headphones, title: 'Premium Audiobooks', desc: 'Listen on the go. Enjoy free samples before you buy, with an intuitive playback interface.' },
          ].map((f, i) => (
            <div key={i} style={{ 
              padding: '2.5rem 2rem', 
              background: 'rgba(255, 255, 255, 0.02)', 
              borderRadius: '12px', 
              border: `1px solid ${colors.border}`,
              textAlign: 'left',
              backdropFilter: 'blur(5px)'
            }}>
              <div style={{ width: 44, height: 44, borderRadius: '8px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <f.icon size={20} color={colors.accentRed} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: 700, color: colors.textPrimary }}>{f.title}</h3>
              <p style={{ color: colors.textSecondary, lineHeight: 1.5, fontSize: '0.9rem' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Book Section (Clean Screenshot Blend) */}
      <section style={{ 
        padding: '8rem 5%',
        borderTop: `1px solid ${colors.border}`,
        display: 'flex', justifyContent: 'center'
      }}>
        <div className="landing-featured-inner">
          <div style={{ flex: '1 1 350px' }}>
            <div style={{ 
              position: 'relative', 
              borderRadius: '16px', overflow: 'hidden',
              boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
              border: `1px solid ${colors.border}`
            }}>
              <img 
                src="/images/cover.png" 
                alt="Book Cover" 
                style={{ width: '100%', display: 'block' }} 
              />
              <div style={{ 
                position: 'absolute', top: '15px', right: '15px', 
                background: colors.accentRed, padding: '0.5rem 1rem',
                borderRadius: '6px', fontWeight: 800, fontSize: '0.8rem'
              }}>
                FEATURED
              </div>
            </div>
          </div>
          <div style={{ flex: '2 1 500px' }}>
            <h2 
              className="landing-featured-title"
              style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1, color: colors.textPrimary }}
            >
              Just One Text
            </h2>
            <p style={{ fontSize: '1.2rem', color: colors.textSecondary, lineHeight: 1.7, marginBottom: '2rem' }}>
              A powerful story about love, choices, and the life-changing impact of a single decision. Experience the journey that everyone is talking about.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem' }}>
              {[1,2,3,4,5].map(i => <Star key={i} size={18} fill={colors.accentRed} color={colors.accentRed} />)}
            </div>
            <Link to={user ? dashboardPath : "/login"} style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '0.75rem', 
              color: 'white', background: colors.brightRed, 
              padding: '1rem 2rem', borderRadius: '6px', fontWeight: 700, textDecoration: 'none'
            }}>
              {user ? 'CONTINUE READING' : 'START READING'} <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer (Screenshot Style) */}
      <footer style={{ padding: '5rem 5% 3rem', borderTop: `1px solid ${colors.border}`, background: '#000' }}>
        <div className="landing-footer-inner">
          <div style={{ flex: '1 1 300px' }}>
               <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>Joe Books</span>
            <p style={{ color: '#888', fontSize: '0.9rem', maxWidth: 300, lineHeight: 1.5 }}>
              Empowering Kenyan authors and readers with a secure, premium digital library.
            </p>
          </div>
          <div className="landing-footer-columns">
            <div>
              <h4 style={{ color: 'white', marginBottom: '1.25rem', fontSize: '1rem' }}>Platform</h4>
              <Link to="/login" style={{ display: 'block', color: '#888', textDecoration: 'none', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Browse eBooks</Link>
              <Link to="/login" style={{ display: 'block', color: '#888', textDecoration: 'none', fontSize: '0.9rem' }}>Audiobooks</Link>
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: '1.25rem', fontSize: '1rem' }}>Company</h4>
              <span style={{ display: 'block', color: '#888', marginBottom: '0.75rem', fontSize: '0.9rem', cursor: 'pointer' }}>About Us</span>
              <span style={{ display: 'block', color: '#888', fontSize: '0.9rem', cursor: 'pointer' }}>Contact</span>
            </div>
          </div>
        </div>
          © 2026 Joe Books. All rights reserved.
      </footer>
    </div>
  );
}
