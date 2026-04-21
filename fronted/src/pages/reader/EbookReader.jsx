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

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Helper to safely check if file is EPUB
  const isEpub = (bookData) => {
    if (!bookData?.fileUrl) return false;
    
    // 1. Check explicit format field from DB
    if (bookData.fileUrl.format === 'epub') return true;
    
    // 2. Smart Fallback for URLs (Cloudinary raw URLs might not end with .epub)
    const url = bookData.fileUrl.url || bookData.fileUrl;
    if (typeof url !== 'string') return false;
    
    const lowerUrl = url.toLowerCase();
    return lowerUrl.endsWith('.epub') || lowerUrl.includes('/ebooks/') && lowerUrl.includes('epub');
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
          <div style={{ width: '100%', maxWidth: 1000, height: '100%' }} className="pdf-container-secure">
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
                <ReactReader
                  url={book?.fileUrl?.url || book?.fileUrl}
                  location={location}
                  locationChanged={(epubcfi) => setLocation(epubcfi)}
                  swipeable={true}
                />
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


        /* Mobile adjustments */

      `}</style>
    </div>
  );
}
