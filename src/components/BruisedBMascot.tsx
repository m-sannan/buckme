import React from 'react';

interface BruisedBMascotProps {
  variant?: 'bruised' | 'sad';
  className?: string;
}

export const BruisedBMascot: React.FC<BruisedBMascotProps> = ({
  variant = 'bruised',
  className = 'w-28 h-28',
}) => {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Soft ground shadow */}
      <ellipse cx="82" cy="134" rx="34" ry="7" fill="#000000" opacity="0.14" />

      {/* Plump 3D rounded lavender 'b' blob side rim */}
      <path
        d="M44 40 C44 26 58 22 62 34 L62 56 C70 50 82 48 94 50 C114 54 126 70 124 92 C122 116 102 130 78 128 C54 126 42 110 42 86 L44 40 Z"
        fill="#7C3AED"
        opacity="0.35"
      />

      {/* Main plump blob body (compact rounded 'b' character from GTA 6) */}
      <ellipse cx="84" cy="88" rx="42" ry="38" fill="#C4B5FD" />
      <path
        d="M48 34 C48 25 59 25 60 34 L62 76 L46 78 L48 34 Z"
        fill="#C4B5FD"
      />
      <ellipse cx="78" cy="84" rx="36" ry="32" fill="#DDD6FE" opacity="0.45" />

      {/* Sad eyebrows */}
      <path
        d="M64 67 Q71 63 77 67"
        stroke="#4C1D95"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M90 67 Q96 63 102 67"
        stroke="#4C1D95"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Half-lidded white eyes with dark pupils */}
      <ellipse cx="71" cy="79" rx="7" ry="6" fill="#FFFFFF" />
      <ellipse cx="96" cy="79" rx="7" ry="6" fill="#FFFFFF" />
      <circle cx="71" cy="80" r="3.2" fill="#3B0764" />
      <circle cx="96" cy="80" r="3.2" fill="#3B0764" />
      {/* Upper eyelids creating tired/droopy expression */}
      <path
        d="M63 77 Q71 73 79 77"
        stroke="#4C1D95"
        strokeWidth="2"
        strokeLinecap="round"
        fill="#C4B5FD"
      />
      <path
        d="M88 77 Q96 73 104 77"
        stroke="#4C1D95"
        strokeWidth="2"
        strokeLinecap="round"
        fill="#C4B5FD"
      />

      {/* Small sad frown */}
      <path
        d="M77 96 Q84 90 91 96"
        stroke="#4C1D95"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {variant === 'bruised' && (
        <g transform="rotate(28 104 54)">
          {/* Band-aid on upper-right brow */}
          <rect x="92" y="47" width="24" height="11" rx="5.5" fill="#FDE68A" stroke="#F59E0B" strokeWidth="1.2" />
          <rect x="99" y="49.5" width="10" height="6" rx="1.5" fill="#FBBF24" opacity="0.65" />
        </g>
      )}

      {variant === 'sad' && (
        <path
          d="M101 87 C101 83 105 80 108 84 C111 88 107 95 104 97 C101 95 98 90 101 87 Z"
          fill="#93C5FD"
        />
      )}

      {/* Gold coins at bottom right */}
      <circle cx="108" cy="126" r="8.5" fill="#FBBF24" />
      <circle cx="108" cy="126" r="6.2" fill="#F59E0B" />
      <text
        x="108"
        y="129.5"
        textAnchor="middle"
        fontSize="9"
        fontWeight="700"
        fill="#78350F"
      >
        $
      </text>
    </svg>
  );
};

export default BruisedBMascot;
