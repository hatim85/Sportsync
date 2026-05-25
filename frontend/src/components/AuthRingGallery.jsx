import React, { useEffect, useState } from 'react';
import { AUTH_RING_ASSETS } from '../constants/authRingAssets.js';

const RING_INTERVAL_MS = 5000;

export default function AuthRingGallery() {
  const [ringIndex, setRingIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRingIndex((prev) => (prev + 1) % AUTH_RING_ASSETS.length);
    }, RING_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-start pl-10 pointer-events-none">
      <div className="relative flex items-center justify-center">
        {AUTH_RING_ASSETS.map((asset, i) => {
          let diff = i - ringIndex;
          if (diff > 3) diff -= AUTH_RING_ASSETS.length;
          if (diff < -2) diff += AUTH_RING_ASSETS.length;

          const radius = 520;
          const theta = (diff * 21) * (Math.PI / 125);
          const ty = -radius * Math.sin(theta);
          const tx = -(radius - radius * Math.cos(theta)) + 320;

          const isVisible = Math.abs(diff) <= 1;

          return (
            <div
              key={asset.src}
              className={`absolute transition-all duration-[1500ms] ease-in-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
              style={{
                transform: `translate(${tx}px, ${ty}px) scale(${diff === 0 ? 1.2 : Math.abs(diff) === 1 ? 0.76 : 0.52})`,
                zIndex: 10 - Math.abs(diff),
              }}
            >
              <div className="w-64 h-64 flex items-center justify-center p-3">
                <img
                  src={asset.src}
                  alt={asset.alt}
                  draggable={false}
                  className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.55)] animate-pulse-slow"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
