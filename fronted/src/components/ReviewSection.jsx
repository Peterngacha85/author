import { useState, useEffect } from 'react';
import { Star, Send, Trash2 } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function ReviewSection({ bookId }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [bookId]);

  const fetchReviews = async () => {
    try {
      const res = await API.get(`/books/${bookId}/reviews`);
      setReviews(res.data);
    } catch (err) {
      console.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return toast.error('Please select a star rating');
    if (!comment.trim()) return toast.error('Please add a comment');

    setSubmitting(true);
    try {
      const res = await API.post(`/books/${bookId}/reviews`, { rating, comment });
      setReviews(prev => [res.data, ...prev]);
      setRating(0);
      setComment('');
      toast.success('Review submitted!');
    } catch (err) {
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await API.delete(`/books/reviews/${reviewId}`);
      setReviews(prev => prev.filter(r => r._id !== reviewId));
      toast.success('Review deleted');
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}><span className="spinner" /></div>;

  return (
    <div className="reviews-container">
      <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Star size={20} fill="var(--color-primary)" color="var(--color-primary)" />
        Ratings & Reviews
      </h3>

      {/* Review Form */}
      {user && !user.disabled && (
        <form className="review-form fade-in" onSubmit={handleSubmit}>
          <div style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Overall Rating</div>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="star-btn"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
              >
                <Star
                  size={24}
                  fill={(hover || rating) >= star ? 'var(--color-primary)' : 'none'}
                  color={(hover || rating) >= star ? 'var(--color-primary)' : 'var(--text-muted)'}
                />
              </button>
            ))}
          </div>

          <div className="form-group">
            <textarea
              className="form-input"
              placeholder="What did you think of this book?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              style={{ resize: 'none' }}
              disabled={submitting}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-sm" disabled={submitting} style={{ marginTop: '0.5rem' }}>
            {submitting ? <span className="spinner" /> : <><Send size={14} /> Submit Review</>}
          </button>
        </form>
      )}

      {/* Review List */}
      <div className="reviews-list">
        {reviews.length === 0 ? (
          <div className="empty-reviews">
            No reviews yet. Be the first to review!
          </div>
        ) : (
          reviews.map((rev) => (
            <div key={rev._id} className="review-card slide-up">
              <div className="review-header">
                <div>
                  <div className="review-user">{rev.userName}</div>
                  <div className="star-rating" style={{ margin: '0.25rem 0', gap: '0.25rem' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        fill={rev.rating >= s ? '#FFB800' : 'none'}
                        color={rev.rating >= s ? '#FFB800' : 'var(--text-muted)'}
                      />
                    ))}
                  </div>
                </div>
                <div className="review-date">{new Date(rev.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="review-comment">{rev.comment}</div>

              {user?.role === 'admin' && (
                <button
                  onClick={() => deleteReview(rev._id)}
                  className="delete-review-btn"
                  title="Delete Review"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
