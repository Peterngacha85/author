import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import ReviewSection from '../../components/ReviewSection';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

export default function EbookReader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Customize toolbar to remove download/print buttons for regular users
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => [],
    renderToolbar: (Toolbar) => (
      <Toolbar>
        {(slots) => {
          const { 
            ZoomOut, Zoom, ZoomIn, GoToPreviousPage, CurrentPageInput, 
            NumberOfPages, GoToNextPage, EnterFullScreen, Download, Print 
          } = slots;
          return (
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '4px' }}>
              <div style={{ padding: '0 2px' }}><ZoomOut /></div>
              <div style={{ padding: '0 2px' }}><Zoom /></div>
              <div style={{ padding: '0 2px' }}><ZoomIn /></div>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <GoToPreviousPage />
                <div style={{ display: 'flex', alignItems: 'center', margin: '0 8px' }}>
                  <CurrentPageInput /> <span style={{ padding: '0 4px' }}>/</span> <NumberOfPages />
                </div>
                <GoToNextPage />
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
      .then(res => setBook(res.data))
      .catch((err) => setError(err.response?.data?.msg || 'Could not load book'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    // Basic anti-piracy: disable right-click context menu
    const handleContext = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContext);
    return () => document.removeEventListener('contextmenu', handleContext);
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
            ) : (
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                <Viewer
                  fileUrl={book?.fileUrl?.url || book?.fileUrl}
                  plugins={[defaultLayoutPluginInstance]}
                  theme="light"
                />
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
          /* Prevent text selection */
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      `}</style>
    </div>
  );
}
