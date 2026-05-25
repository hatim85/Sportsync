import { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import Modal from './Modal';

export default function OrderReviewModal({
  open,
  onClose,
  onSubmit,
  submitting,
  productName = 'this product',
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hover, setHover] = useState(0);

  useEffect(() => {
    if (open) {
      setRating(5);
      setComment('');
      setHover(0);
    }
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) return;
    onSubmit({ rating, comment: comment.trim() });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Feedback"
      title="Rate & Review"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <p className="text-sm text-muted-foreground leading-relaxed">
          How was{' '}
          <span className="font-bold text-foreground">{productName}</span>? Your review helps
          other athletes choose the right gear.
        </p>

        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
            Your rating
          </p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                className="p-1 transition-transform hover:scale-110"
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
              >
                <FaStar
                  className={`h-8 w-8 ${
                    n <= (hover || rating) ? 'text-primary' : 'text-muted-foreground/30'
                  }`}
                />
              </button>
            ))}
            <span className="ml-3 text-sm font-black text-foreground">{rating} / 5</span>
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="review-comment"
            className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground"
          >
            Your review (optional)
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Share your experience — fit, quality, performance..."
            className="w-full border border-border rounded-sm p-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 border border-border py-3 text-[10px] font-black uppercase tracking-widest text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-primary text-primary-foreground py-3 text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
