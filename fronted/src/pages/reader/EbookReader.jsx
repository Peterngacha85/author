import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, BookOpen, FileText } from 'lucide-react';
import { ReactReader } from 'react-reader';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import ReviewSection from '../../components/ReviewSection';
import StoryReader from './StoryReader';



export default function EbookReader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('story');
  const [location, setLocation] = useState(0);
  const [rendition, setRendition] = useState(null);

  // Reader settings
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState('light');

  const THEMES = {
    light: { bg: '#ffffff', text: '#1a1a1a' },
    sepia: { bg: '#f4ecd8', text: '#5b4636' },
    dark: { bg: '#1a1a1a', text: '#e0e0e0' },
  };

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Helper to safely check if file is EPUB
  const isEpub = (bookData) => {
    if (!bookData?.fileUrl) return false;
    
    // 1. Check explicit format field from DB (saved during upload)
    const format = (bookData.fileUrl.format || '').toLowerCase();
    if (format === 'epub') return true;
    if (format === 'pdf') return false; // Explicitly NOT an epub
    
    // 2. Fallback for URLs
    const rawUrl = bookData.fileUrl.url || (typeof bookData.fileUrl === 'string' ? bookData.fileUrl : '');
    const url = rawUrl.toLowerCase();
    if (!url) return false;
    
    // Check extension or specific epub markers
    return url.endsWith('.epub') || (url.includes('/ebooks/') && url.includes('epub'));
  };



  useEffect(() => {
    API.get(`/books/${id}`)
      .then(res => {
        setBook(res.data);
        if (isEpub(res.data)) {
          setViewMode('epub');
        } else {
          setViewMode('story');
        }
      })
      .catch((err) => setError(err.response?.data?.msg || 'Could not load book'))
      .finally(() => setLoading(false));
  }, [id]);

  // Re-apply theme & font whenever they change via rendition
  useEffect(() => {
    if (!rendition) return;
    rendition.themes.default({
      body: {
        background: `${THEMES[theme].bg} !important`,
        color: `${THEMES[theme].text} !important`,
        'font-size': `${fontSize}px !important`,
        'line-height': '1.8 !important',
        padding: '1rem 2rem !important',
      }
    });
    rendition.themes.select('default');
  }, [theme, fontSize, rendition]);

  useEffect(() => {
    // Basic anti-piracy: disable right-click context menu
    const handleContext = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContext);
    
    // Keyboard navigation
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        const nextBtn = document.querySelector('button[title="Next Page"]');
        if (nextBtn && !nextBtn.disabled) nextBtn.click();
      } else if (e.key === 'ArrowLeft') {
        const prevBtn = document.querySelector('button[title="Previous Page"]');
        if (prevBtn && !prevBtn.disabled) prevBtn.click();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContext);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-base)' }}><span className="spinner spinner-lg"></span></div>;
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>{error}</div>;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
      {/* Reader Header */}
      <header style={{ 
        display: 'flex', alignItems: 'center', padding: '0.75rem 1rem', 
        background: THEMES[theme].bg, 
        borderBottom: '1px solid rgba(128,128,128,0.2)', 
        gap: '0.75rem',
        flexWrap: 'wrap'
      }}>
        <button onClick={() => navigate(isAdmin ? '/admin/books' : '/dashboard/ebooks')} className="btn btn-outline" style={{ padding: '0.5rem', border: 'none', background: 'transparent', color: THEMES[theme].text }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1rem', margin: 0, color: THEMES[theme].text }}>{book?.title}</h1>
          <div style={{ fontSize: '0.8rem', opacity: 0.6, color: THEMES[theme].text }}>{book?.author}</div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={() => setFontSize(s => Math.max(12, s - 2))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: THEMES[theme].text, fontSize: '1rem' }}>A-</button>
          <span style={{ fontSize: '0.75rem', color: THEMES[theme].text }}>{fontSize}px</span>
          <button onClick={() => setFontSize(s => Math.min(36, s + 2))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: THEMES[theme].text, fontSize: '1rem' }}>A+</button>
          {Object.keys(THEMES).map(t => (
            <button key={t} onClick={() => setTheme(t)} style={{ 
              width: 20, height: 20, borderRadius: '50%', background: THEMES[t].bg,
              border: theme === t ? '2px solid var(--color-primary)' : '1px solid rgba(0,0,0,0.2)',
              cursor: 'pointer', transform: theme === t ? 'scale(1.2)' : 'scale(1)', transition: 'transform 0.2s'
            }} title={t} />
          ))}
        </div>
      </header>

      {/* PDF Viewport Area - Scrollable Container */}
      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-base)' }}>
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', minHeight: '80vh' }}>
          <div className="pdf-container-secure reader-view-port">
            {!book?.fileUrl ? (
              <div style={{ 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                height: '100%', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
                <h3 style={{ color: 'var(--text-primary)' }}>Access Restricted</h3>
                <p style={{ maxWidth: 300, fontSize: '0.9rem' }}>
                  This content is not available. This usually happens if your account is restricted or the purchase is not confirmed.
                </p>
                <button onClick={() => navigate(-1)} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                  Go Back
                </button>
              </div>
            ) : viewMode === 'epub' ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', background: THEMES[theme].bg }}>
                {/* Top Pagination */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.4rem 1rem',
                  background: THEMES[theme].bg,
                  borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
                  gap: '0.5rem'
                }}>
                  <button
                    onClick={() => rendition?.prev()}
                    style={{ background: 'none', border: `1px solid ${theme === 'dark' ? '#555' : '#ccc'}`, borderRadius: 6, padding: '0.3rem 0.8rem', cursor: 'pointer', color: THEMES[theme].text, display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>
                  <span style={{ fontSize: '0.75rem', color: THEMES[theme].text, opacity: 0.6 }}>Swipe or use arrows to navigate</span>
                  <button
                    onClick={() => rendition?.next()}
                    style={{ background: 'none', border: `1px solid ${theme === 'dark' ? '#555' : '#ccc'}`, borderRadius: 6, padding: '0.3rem 0.8rem', cursor: 'pointer', color: THEMES[theme].text, display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>

                {/* EPUB Viewer */}
                <div style={{ flex: 1, position: 'relative', background: THEMES[theme].bg }}>
                  <ReactReader
                    url={book?.fileUrl?.url || book?.fileUrl}
                    location={location}
                    locationChanged={(epubcfi) => setLocation(epubcfi)}
                    swipeable={true}
                    getRendition={(rend) => {
                      setRendition(rend);
                      rend.themes.default({
                        body: {
                          background: `${THEMES[theme].bg} !important`,
                          color: `${THEMES[theme].text} !important`,
                          'font-size': `${fontSize}px !important`,
                          'line-height': '1.8 !important',
                          padding: '1rem 2rem !important',
                        }
                      });
                      rend.themes.select('default');
                    }}
                    epubOptions={{
                      openAs: 'epub',
                      spread: 'none'
                    }}
                  />
                </div>
              </div>
            ) : (
              <div style={{ height: 'calc(100vh - 120px)', width: '100%' }}>
                <StoryReader url={book?.fileUrl?.url || book?.fileUrl} />
              </div>
            )}
          </div>
          {/* Transparent overlay blocks deep-click interactions on the canvas */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none', userSelect: 'none' }} />
        </div>

        {/* Reviews Section at the bottom */}
        {book && <ReviewSection bookId={id} />}
      </div>

      <style>{`
        .pdf-container-secure {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        .reader-view-port {
          width: 100%;
          max-width: 1000px;
          height: 100%;
          margin: 0 auto;
        }

        /* Mobile adjustments */
        @media (max-width: 768px) {
          .reader-view-port {
             max-width: 100vw !important;
             width: 100vw !important;
          }
          header {
            padding: 0.75rem !important;
            gap: 0.5rem !important;
          }
          header h1 {
            font-size: 1rem !important;
          }
          .pdf-container-secure {
            height: calc(100vh - 100px) !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          
          /* Hide the default side-buttons for better space utilization on mobile */
          div[style*="position: absolute"][style*="top: 50%"] {
            display: none !important;
          }

          /* Ensure the reader inner container has no extra margin */
          div[style*="position: absolute"][style*="inset: 0px"] {
             padding: 0 !important;
          }
        }

        @media (max-width: 480px) {
          header h1 {
            max-width: 200px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      `}</style>
    </div>
  );
}
