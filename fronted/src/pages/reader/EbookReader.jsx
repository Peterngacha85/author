import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Viewer, Worker, ViewMode, ScrollMode } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import { ArrowLeft, ChevronLeft, ChevronRight, BookOpen, FileText } from 'lucide-react';
import { ReactReader } from 'react-reader';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import ReviewSection from '../../components/ReviewSection';
import StoryReader from './StoryReader';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/page-navigation/lib/styles/index.css';

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
    const url = bookData?.fileUrl?.url || bookData?.fileUrl;
    return typeof url === 'string' && url.toLowerCase().endsWith('.epub');
  };

  // Page Navigation Plugin for programmatic control
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { GoToPreviousPage, GoToNextPage } = pageNavigationPluginInstance;

  // Customize toolbar to remove download/print buttons for regular users
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => [],
    renderToolbar: (Toolbar) => (
      <Toolbar>
        {(slots) => {
          const { 
            ZoomOut, Zoom, ZoomIn, GoToPreviousPage: ToolbarPrev, CurrentPageInput, 
            NumberOfPages, GoToNextPage: ToolbarNext, EnterFullScreen, Download, Print 
          } = slots;
          return (
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '4px' }}>
              <div style={{ padding: '0 2px' }}><ZoomOut /></div>
              <div style={{ padding: '0 2px' }}><Zoom /></div>
              <div style={{ padding: '0 2px' }}><ZoomIn /></div>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <ToolbarPrev />
                <div style={{ display: 'flex', alignItems: 'center', margin: '0 8px' }}>
                  <CurrentPageInput /> <span style={{ padding: '0 4px' }}>/</span> <NumberOfPages />
                </div>
                <ToolbarNext />
              </div>
              <div style={{ padding: '0 2px' }}><EnterFullScreen /></div>
              {isAdmin && (
                <>
                  <div style={{ padding: '0 2px' }}><Download /></div>
                  <div style={{ padding: '0 2px' }}><Print /></div>
                </>
              )}
            </div>
          );
        }}
      </Toolbar>
    )
  });

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

        {/* View Mode Toggle (Only for PDFs) */}
        {book?.fileUrl && !isEpub(book) && (
          <div style={{ marginLeft: 'auto', display: 'flex', background: 'var(--bg-input)', padding: '4px', borderRadius: 'var(--radius-md)', gap: '4px' }}>
            <button 
              onClick={() => setViewMode('story')} 
              className={`view-toggle-btn ${viewMode === 'story' ? 'active' : ''}`}
              title="Story Mode (Reflowable)"
            >
              <BookOpen size={16} /> <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Story Mode</span>
            </button>
            <button 
              onClick={() => setViewMode('pdf')} 
              className={`view-toggle-btn ${viewMode === 'pdf' ? 'active' : ''}`}
              title="Original PDF View"
            >
              <FileText size={16} /> <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Original PDF</span>
            </button>
          </div>
        )}
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
            ) : viewMode === 'story' ? (
              <div style={{ height: 'calc(100vh - 120px)', width: '100%' }}>
                <StoryReader url={book?.fileUrl?.url || book?.fileUrl} />
              </div>
            ) : (
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                <div style={{ position: 'relative', height: '100%', padding: '0 20px' }}>
                  {/* Fixed Navigation Overlays */}
                  <div style={{ position: 'fixed', left: '2rem', top: '50%', transform: 'translateY(-50%)', zIndex: 1000 }}>
                     <GoToPreviousPage>
                        {(props) => (
                          <button 
                            className="nav-btn-fixed" 
                            onClick={props.onClick} 
                            disabled={props.isDisabled}
                            title="Previous Page"
                          >
                            <ChevronLeft size={36} />
                          </button>
                        )}
                     </GoToPreviousPage>
                  </div>

                  <div style={{ position: 'fixed', right: '2rem', top: '50%', transform: 'translateY(-50%)', zIndex: 1000 }}>
                     <GoToNextPage>
                        {(props) => (
                          <button 
                            className="nav-btn-fixed" 
                            onClick={props.onClick} 
                            disabled={props.isDisabled}
                            title="Next Page"
                          >
                            <ChevronRight size={36} />
                          </button>
                        )}
                     </GoToNextPage>
                  </div>

                  <div className="pdf-viewer-wrapper" style={{ height: 'calc(100vh - 180px)', width: '100%', maxWidth: 900, margin: '0 auto' }}>
                    <Viewer
                      key={book._id}
                      fileUrl={book?.fileUrl?.url || book?.fileUrl}
                      plugins={[defaultLayoutPluginInstance, pageNavigationPluginInstance]}
                      theme="light"
                      viewMode={ViewMode.SinglePage}
                      scrollMode={ScrollMode.Page}
                    />
                  </div>
                </div>
              </Worker>
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
        .nav-btn-fixed {
          background: var(--bg-surface);
          border: 2px solid var(--color-primary);
          color: var(--color-primary);
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .nav-btn-fixed:hover:not(:disabled) {
          background: var(--color-primary);
          color: white;
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 12px 32px rgba(255, 56, 92, 0.3);
        }
        .nav-btn-fixed:disabled {
          opacity: 0.15;
          cursor: not-allowed;
          filter: grayscale(1);
        }
        .pdf-viewer-wrapper {
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          border-radius: 8px;
          overflow: hidden;
          background: white;
        }
        .view-toggle-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.8rem;
          border-radius: var(--radius-sm);
          border: none;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }
        .view-toggle-btn:hover {
          color: var(--text-primary);
          background: rgba(128,128,128,0.1);
        }
        .view-toggle-btn.active {
          background: white;
          color: var(--color-primary);
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        /* Mobile adjustments */
        @media (max-width: 1100px) {
          .nav-btn-fixed {
            width: 50px;
            height: 50px;
            bottom: 30px;
            top: auto;
            transform: none;
          }
          .nav-btn-fixed:first-of-type {
            left: 20px;
          }
          .nav-btn-fixed:last-of-type {
            right: 20px;
          }
          .nav-btn-fixed:hover:not(:disabled) {
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}
