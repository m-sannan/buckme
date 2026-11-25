import React from 'react';

interface DualAvatarsProps {
  className?: string;
}

export const DualAvatars: React.FC<DualAvatarsProps> = ({ className = '' }) => {
  return (
    <div className={`relative inline-flex items-center ${className}`} aria-hidden="true">
      {/* Jason – warm tan circle */}
      <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-[#D4A574] to-[#B8845C] text-xs font-semibold text-white shadow-sm">
        J
      </div>

      {/* Lucia – warm rose/pink circle (overlapping) */}
      <div className="relative -ml-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-[#E8A0B8] to-[#D4789C] text-xs font-semibold text-white shadow-sm">
        L
      </div>
    </div>
  );
};

export default DualAvatars;
