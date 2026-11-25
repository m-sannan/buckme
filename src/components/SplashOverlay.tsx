import React from 'react';
import { BuckMeLogo } from './BuckMeLogo';

interface SplashOverlayProps {
  onSkip: () => void;
}

export const SplashOverlay: React.FC<SplashOverlayProps> = ({ onSkip }) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSkip}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onSkip();
      }}
      className="fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(155deg, #5B21B6 0%, #6D28D9 50%, #7C3AED 100%)',
      }}
    >
      {/* Diagonal b watermark overlay matching the GTA 6 BuckMe splash screen */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.07]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="buckme-watermark"
              x="0"
              y="0"
              width="68"
              height="68"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(-20)"
            >
              <text
                x="10"
                y="44"
                fontSize="32"
                fontWeight="800"
                fill="white"
                fontFamily="system-ui, sans-serif"
              >
                b
              </text>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#buckme-watermark)" />
        </svg>
      </div>

      {/* Centered GTA 6 BuckMe logo + wordmark */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <BuckMeLogo
          className="h-28 w-28"
          color="#FFFFFF"
          showWordmark={false}
        />
        <div className="mt-4 text-5xl font-extrabold tracking-tight text-white">
          buckme
        </div>
      </div>
    </div>
  );
};

export default SplashOverlay;
