import { useEffect } from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

/**
 * Renders nothing visually itself, but:
 *  - When OFFLINE: applies grayscale filter + prevents scroll on <body>
 *  - When ONLINE:  restores everything
 *  - Shows a fixed bottom banner while offline
 */
export default function OfflineOverlay() {
    const { isOnline } = useNetworkStatus();

    // Toggle grayscale + scroll-lock on the document body
    useEffect(() => {
        const root = document.documentElement;

        if (!isOnline) {
            root.style.filter = 'grayscale(100%)';
            root.style.overflow = 'hidden';
            root.style.pointerEvents = 'none';       // disable all clicks
        } else {
            root.style.filter = '';
            root.style.overflow = '';
            root.style.pointerEvents = '';
        }

        return () => {
            // Cleanup on unmount — always restore
            root.style.filter = '';
            root.style.overflow = '';
            root.style.pointerEvents = '';
        };
    }, [isOnline]);

    if (isOnline) return null;

    return (
        // This banner itself must bypass pointer-events: none on root
        <div
            style={{ pointerEvents: 'all' }}
            className="fixed bottom-0 left-0 right-0 z-[9999] flex items-center justify-center gap-3 bg-primary text-primary-foreground py-3 px-6"
        >
            {/* Animated pulse dot */}
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase">
                You're offline — Please check your internet connection
            </p>
        </div>
    );
}
