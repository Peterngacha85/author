import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, BookOpen, Headphones, Star } from 'lucide-react';
import API from '../../api/axios';
import ReviewSection from '../../components/ReviewSection';
import PaymentModal from '../../components/PaymentModal';

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    Promise.all([
      API.get(`/books/${id}`),
      API.get(`/books/${id}/reviews`)
    ]).then(([bookRes, reviewsRes]) => {
      setBook(bookRes.data);
      setReviews(reviewsRes.data);
    })
    .catch(err => setError(err.response?.data?.msg || 'Failed to load book details'))
    .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><span className="spinner spinner-lg"></span></div>;
  if (error) return <div className="fade-in" style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>{error}</div>;
  if (!book) return null;

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const isAudio = book.type === 'audiobook';
  const isAdmin = user?.role === 'admin';
  const isPurchased = isAdmin || (user?.purchasedItems || []).includes(book._id);
  const hasSample = isAudio && book.chapters?.some(c => c.isSample);

  return (
    <div className="fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Header Back Button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm" style={{ border: 'none', background: 'transparent', padding: '0.5rem 0' }}>
          <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} /> Back
        </button>
      </div>

      {/* Main Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 300px) 1fr', gap: '3rem', marginBottom: '3rem' }}>
        
        {/* Left Column: Cover & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ 
            width: '100%', aspectRatio: '2/3', 
            background: 'var(--bg-surface)', 
            borderRadius: 'var(--radius-lg)', 
            overflow: 'hidden',
            boxShadow: 'var(--shadow-md)',
            position: 'relative'
          }}>
            {book.comingSoon && (
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 600, zIndex: 10 }}>
                Coming Soon
              </div>
            )}
            {book.coverImage?.url || book.coverImage
              ? <img src={book.coverImage?.url || book.coverImage} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>{isAudio ? '🎧' : '📚'}</div>
            }
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              KES {book.price?.toLocaleString()}
            </div>

            {book.comingSoon ? (
              <button disabled className="btn btn-outline" style={{ width: '100%', opacity: 0.6 }}>
                Not Yet Available
              </button>
            ) : isPurchased ? (
              <button onClick={() => navigate(`/reader/${isAudio ? 'listen' : 'read'}/${book._id}`)} className="btn btn-primary" style={{ width: '100%' }}>
                {isAudio ? <><Headphones size={18} /> Listen Now</> : <><BookOpen size={18} /> Read Now</>}
              </button>
            ) : (
              <>
                <button onClick={() => {
                  if (user?.disabled) return toast.error('Account restricted');
                  setShowPayment(true);
                }} className="btn btn-primary" style={{ width: '100%' }}>
                  Buy Now
                </button>
                
                {hasSample && (
                  <button onClick={() => navigate(`/reader/listen/${book._id}`)} className="btn btn-outline" style={{ width: '100%' }}>
                    <Headphones size={18} /> Listen to Sample
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Column: Info & Synopsis */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span className={`badge ${isAudio ? 'badge-purple' : 'badge-pink'}`} style={{ textTransform: 'capitalize' }}>
              {book.type}
            </span>
            {book.comingSoon && <span className="badge badge-yellow">Coming Soon</span>}
          </div>
          
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', lineHeight: 1.2 }}>{book.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', margin: 0 }}>by <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{book.author}</span></p>
            {avgRating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,184,0,0.1)', color: '#FFB800', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
                <Star size={14} fill="#FFB800" /> {avgRating} ({reviews.length} reviews)
              </div>
            )}
          </div>

          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              Synopsis
            </h3>
            <div style={{ lineHeight: 1.8, color: 'var(--text-secondary)', fontSize: '1.05rem', whiteSpace: 'pre-line', maxWidth: '700px' }}>
              {book.description || 'No description provided.'}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <ReviewSection bookId={book._id} onReviewAdded={(newRev) => setReviews([newRev, ...reviews])} />

      {/* Payment Modal */}
      {showPayment && <PaymentModal book={book} onClose={() => setShowPayment(false)} />}
    </div>
  );
}
