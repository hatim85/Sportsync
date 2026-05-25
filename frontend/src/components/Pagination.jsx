/** Shared prev / next + page numbers for list views */
export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  start = Math.max(1, end - maxVisible + 1);

  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-14 pt-8 border-t border-border">
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-4 py-2 border border-border rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        {start > 1 && (
          <>
            <button
              type="button"
              onClick={() => onPageChange(1)}
              className="min-w-[2.25rem] h-9 px-2 border border-border rounded-sm text-[10px] font-black hover:bg-secondary transition-colors"
            >
              1
            </button>
            {start > 2 && <span className="text-muted-foreground text-xs px-1">…</span>}
          </>
        )}
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`min-w-[2.25rem] h-9 px-2 rounded-sm text-[10px] font-black transition-colors ${
              p === page
                ? 'bg-primary text-primary-foreground'
                : 'border border-border hover:bg-secondary'
            }`}
          >
            {p}
          </button>
        ))}
        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="text-muted-foreground text-xs px-1">…</span>}
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              className="min-w-[2.25rem] h-9 px-2 border border-border rounded-sm text-[10px] font-black hover:bg-secondary transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-sm text-[10px] font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
