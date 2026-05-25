import { useState, useEffect } from 'react';
import Modal from './Modal';

const RETURN_REASONS = [
  'Product not as described',
  'Wrong size or fit',
  'Damaged or defective',
  'Received wrong item',
  'Quality not satisfactory',
  'Other',
];

export default function ReturnRequestModal({ open, onClose, onSubmit, submitting }) {
  const [selected, setSelected] = useState(RETURN_REASONS[0]);
  const [details, setDetails] = useState('');

  useEffect(() => {
    if (open) {
      setSelected(RETURN_REASONS[0]);
      setDetails('');
    }
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const reason =
      selected === 'Other'
        ? details.trim() || 'Customer requested return'
        : details.trim()
          ? `${selected}: ${details.trim()}`
          : selected;
    onSubmit(reason);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Returns"
      title="Request Return"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Tell us why you&apos;d like to return this order. You have{' '}
          <span className="font-bold text-foreground">15 days</span> from delivery. Refunds are
          processed after pickup.
        </p>

        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
            Reason
          </p>
          <div className="flex flex-wrap gap-2">
            {RETURN_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setSelected(r)}
                className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                  selected === r
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-secondary/50 text-foreground hover:border-primary/50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="return-details"
            className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground"
          >
            {selected === 'Other' ? 'Please describe' : 'Additional details (optional)'}
          </label>
          <textarea
            id="return-details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={4}
            placeholder="Add any details to help us process your return faster..."
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
            disabled={submitting || (selected === 'Other' && !details.trim())}
            className="flex-1 bg-amber-600 text-white py-3 text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Return Request'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
