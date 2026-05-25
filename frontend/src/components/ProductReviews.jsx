import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import toast from 'react-hot-toast';

const StarDisplay = ({ rating, size = 'sm' }) => {
  const r = Math.round(Number(rating) || 0);
  const cls = size === 'lg' ? 'h-4 w-4' : 'h-3 w-3';
  return (
    <div className="flex items-center gap-0.5 text-primary">
      {[1, 2, 3, 4, 5].map((i) => (
        <FaStar key={i} className={`${cls} ${i <= r ? 'opacity-100' : 'opacity-25'}`} />
      ))}
    </div>
  );
};

const ProductReviews = ({
  reviews = [],
  rating = 0,
  reviewsCount = 0,
  userCanReview = false,
  eligibleOrderId = null,
  productId = null,
  userId = null,
  onReviewSubmitted,
}) => {
  const [formRating, setFormRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      toast.error('Please sign in to leave a review');
      return;
    }
    if (!eligibleOrderId || !productId) return;

    setSubmitting(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_PORT}/api/reviews/order/${eligibleOrderId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            productId,
            rating: formRating,
            comment,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit review');
      toast.success('Thank you for your review!');
      setComment('');
      onReviewSubmitted?.(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="border-t border-border pt-12 mt-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-foreground">
            Customer Reviews
          </h2>
          <div className="flex items-center gap-3 mt-2">
            <StarDisplay rating={rating} size="lg" />
            <span className="text-sm font-bold text-foreground">
              {Number(rating).toFixed(1)} / 5
            </span>
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
              ({reviewsCount} {reviewsCount === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>
      </div>

      {userCanReview && (
        <form
          onSubmit={handleSubmit}
          className="mb-10 p-6 border border-border rounded-lg bg-secondary/30 space-y-4"
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">
            Rate this product
          </p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setFormRating(n)}
                className="p-1"
              >
                <FaStar
                  className={`h-6 w-6 ${n <= formRating ? 'text-primary' : 'text-muted-foreground/40'}`}
                />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this gear..."
            rows={3}
            className="w-full border border-border rounded-sm p-3 text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary text-primary-foreground px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((r) => (
            <div key={r._id} className="border-b border-border pb-6 last:border-0">
              <div className="flex items-center justify-between gap-4 mb-2">
                <p className="text-sm font-bold text-foreground">
                  {r.userName || 'Customer'}
                </p>
                <StarDisplay rating={r.rating} />
              </div>
              {r.comment && (
                <p className="text-sm text-muted-foreground leading-relaxed">{r.comment}</p>
              )}
              <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest">
                {new Date(r.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold text-center py-8">
          No reviews yet — be the first to review
        </p>
      )}
    </section>
  );
};

export default ProductReviews;
export { StarDisplay };
