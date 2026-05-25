import { FaTimes } from 'react-icons/fa';

export default function Modal({ open, onClose, title, eyebrow, children, maxWidth = 'max-w-md' }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div
        className={`bg-card border border-border shadow-xl w-full ${maxWidth} relative animate-fadeIn max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-start justify-between gap-4">
          <div>
            {eyebrow && (
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">
                {eyebrow}
              </p>
            )}
            <h3 id="modal-title" className="text-sm font-black uppercase tracking-tight text-foreground">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors shrink-0"
            aria-label="Close"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6 md:p-8">{children}</div>
      </div>
    </div>
  );
}
