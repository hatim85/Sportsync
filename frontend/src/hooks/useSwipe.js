import { useState } from 'react';

export const useSwipe = ({ onSwipedLeft, onSwipedRight, swipeThreshold = 50 }) => {
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > swipeThreshold;
        const isRightSwipe = distance < -swipeThreshold;

        if (isLeftSwipe && onSwipedLeft) {
            onSwipedLeft();
        }
        if (isRightSwipe && onSwipedRight) {
            onSwipedRight();
        }
    };

    return {
        onTouchStart,
        onTouchMove,
        onTouchEnd
    };
};
