import React, { useCallback, useEffect, useState } from 'react';
import { FaStar } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Pagination from './Pagination';

const REVIEWS_PER_PAGE = 5;

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
  productId = null,
  rating: initialRating = 0,
  reviewsCount: initialReviewsCount = 0,
  userCanReview = false,
  eligibleOrderId = null,
  userId = null,
  onReviewSubmitted,
}) => {
  const [formRating, setFormRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(initialReviewsCount);
  const [displayRating, setDisplayRating] = useState(initialRating);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const fetchReviews = useCallback(
    async (pageNum) => {
      if (!productId) return;
      setLoadingReviews(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_PORT}/api/reviews/product/${productId}?page=${pageNum}&limit=${REVIEWS_PER_PAGE}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load reviews');

        setReviews(data.reviews || []);
        setTotalReviews(data.totalReviews ?? data.reviewsCount ?? 0);
        setDisplayRating(data.rating ?? 0);
        setTotalPages(Math.max(1, data.totalPages ?? 1));
      } catch (err) {
        toast.error(err.message);
        setReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    },
    [productId]
  );

  useEffect(() => {
    setPage(1);
    setTotalReviews(initialReviewsCount);
    setDisplayRating(initialRating);
  }, [productId, initialReviewsCount, initialRating]);

  useEffect(() => {
    fetchReviews(page);
  }, [page, fetchReviews]);

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
      setDisplayRating(data.rating ?? displayRating);
      setTotalReviews(data.reviewsCount ?? totalReviews + 1);
      onReviewSubmitted?.(data);
      setPage(1);
      await fetchReviews(1);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const rangeStart = totalReviews === 0 ? 0 : (page - 1) * REVIEWS_PER_PAGE + 1;
  const rangeEnd = Math.min(page * REVIEWS_PER_PAGE, totalReviews);

  return (
    <section className="border-t border-border pt-12 mt-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-foreground">
            Customer Reviews
          </h2>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <StarDisplay rating={displayRating} size="lg" />
            <span className="text-sm font-bold text-foreground">
              {Number(displayRating).toFixed(1)} / 5
            </span>
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
              ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
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

      {loadingReviews ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : reviews.length > 0 ? (
        <>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Showing {rangeStart}–{rangeEnd} of {totalReviews}
          </p>
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
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
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
