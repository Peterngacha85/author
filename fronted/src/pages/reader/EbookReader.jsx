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
  const [viewMode, setViewMode] = useState('story'); // 'story' (reflow), 'pdf' (original), 'epub'
  const [location, setLocation] = useState(0); // For EPUB location
  const [epubData, setEpubData] = useState(null);
  const [loadingEpub, setLoadingEpub] = useState(false);

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
          
          // Pre-fetch EPUB data to resolve CORS and identification issues
          const fileUrl = res.data.fileUrl?.url || res.data.fileUrl;
          if (fileUrl && typeof fileUrl === 'string') {
            const secureUrl = fileUrl.replace('http://', 'https://');
            setLoadingEpub(true);
            fetch(secureUrl)
              .then(response => {
                if (!response.ok) throw new Error('Fetch failed');
                return response.arrayBuffer();
              })
              .then(buffer => setEpubData(buffer))
              .catch(err => console.error('Epub pre-fetch error:', err))
              .finally(() => setLoadingEpub(false));
          }
        } else {
          setViewMode('story');
        }
      })
      .catch((err) => setError(err.response?.data?.msg || 'Could not load book'))
      .finally(() => setLoading(false));
  }, [id]);

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
      <header style={{ display: 'flex', alignItems: 'center', padding: '1rem', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)', gap: '1rem' }}>
        <button onClick={() => navigate(isAdmin ? '/admin/books' : '/dashboard/ebooks')} className="btn btn-outline" style={{ padding: '0.5rem', border: 'none', background: 'transparent' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-primary)' }}>{book?.title}</h1>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{book?.author}</div>
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
              <div style={{ height: 'calc(100vh - 120px)', width: '100%', position: 'relative' }}>
                {loadingEpub ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem' }}>
                    <span className="spinner"></span>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Preparing your book...</p>
                  </div>
                ) : (
                  <ReactReader
                    url={epubData || (book?.fileUrl?.url || book?.fileUrl)}
                    location={location}
                    locationChanged={(epubcfi) => setLocation(epubcfi)}
                    swipeable={true}
                    epubOptions={{
                      openAs: 'epub',
                      spread: 'none' // Force single column
                    }}
                  />
                )}
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
        }

        /* Mobile adjustments */
        @media (max-width: 768px) {
          .reader-view-port {
             max-width: 100% !important;
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
          }
          
          /* Hide the default side-buttons for better space utilization on mobile */
          /* ReactReader uses internal elements that can be targeted like this: */
          div[style*="position: absolute"][style*="top: 50%"] {
            display: none !important;
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
