import AuthRingGallery from './AuthRingGallery.jsx';

/** Left panel — original layout: white base, black circle bulging right. */
export default function AuthModalVisual() {
  return (
    <div className="hidden lg:flex relative w-[45%] h-full bg-card overflow-hidden group isolate">
      <div className="absolute inset-0 bg-card z-0" />

      {/* 35% of circle inside panel, 65% outside (left) — 1:1 ratio */}
      <div
        className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-[65%] w-[180%] aspect-square rounded-full bg-[#1b1b1b] z-[1] pointer-events-none"
        aria-hidden
      />

      <div className="absolute inset-0 z-10 pointer-events-none">
        <AuthRingGallery />
      </div>
    </div>
  );
}
