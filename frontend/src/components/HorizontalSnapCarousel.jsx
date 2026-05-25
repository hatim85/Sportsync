import React from 'react';

/**
 * Mobile: horizontal swipe, one card in view (snap).
 * Desktop (lg+): CSS grid.
 */
const HorizontalSnapCarousel = ({
  children,
  desktopCols = 4,
  mobileWidth = 'w-[88vw] max-w-[360px]',
  gapClass = 'gap-4 lg:gap-8',
  className = '',
  showSwipeHint = true,
}) => {
  const gridCols =
    desktopCols === 2
      ? 'lg:grid-cols-2'
      : desktopCols === 3
        ? 'lg:grid-cols-3'
        : 'lg:grid-cols-4';

  const items = React.Children.toArray(children);

  return (
    <div className={className}>
      <div
        className={`
          flex ${gapClass} overflow-x-auto snap-x snap-mandatory
          -mx-4 px-4 pb-1
          lg:mx-0 lg:px-0 lg:pb-0 lg:grid ${gridCols} lg:overflow-visible
          [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
        `}
      >
        {items.map((child, index) => (
          <div
            key={child?.key ?? index}
            className={`snap-center shrink-0 ${mobileWidth} lg:w-auto lg:min-w-0 lg:shrink lg:snap-align-none`}
          >
            {child}
          </div>
        ))}
      </div>
      {showSwipeHint && (
        <p className="mt-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground lg:hidden">
          Swipe to explore →
        </p>
      )}
    </div>
  );
};

export default HorizontalSnapCarousel;
