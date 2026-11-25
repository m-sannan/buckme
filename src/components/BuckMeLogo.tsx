import React from 'react';

interface BuckMeLogoProps {
  className?: string;
  color?: string;
  innerColor?: string;
  showWordmark?: boolean;
}

export const BuckMeLogo: React.FC<BuckMeLogoProps> = ({
  className = 'w-12 h-12',
  color = '#FFFFFF',
  showWordmark = false,
}) => {
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg
        viewBox="0 0 100 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        aria-hidden="true"
      >
        {/* Exact BuckMe 'b' mark traced from GTA 6 reference (evenodd cutout for inner ring + right pill) */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="
            M 9 0
            L 37 0
            C 41 0 43 3 42 7
            L 39 27
            C 45 24 52 22 60 22
            C 82 22 100 40 100 62
            C 100 86 81 105 56 107
            L 50 108
            C 51 110 49 110 46 110
            L 19 110
            C 15 110 14 107 16 105
            C 18 103 21 102 25 102
            L 29 102
            C 20 96 15 86 15 74
            L 4 74
            C 1 74 0 72 0 69
            C 0 67 2 65 5 65
            L 16 65
            L 21 40
            L 11 40
            C 8 40 7 38 7 35
            C 7 33 9 31 12 31
            L 22 31
            L 26 9
            L 9 9
            C 6 9 5 7 5 4.5
            C 5 2 6 0 9 0
            Z

            M 58 41
            C 46 41 37 50 37 62
            C 37 74 46 83 58 83
            C 68 83 77 76 79 66
            L 71 66
            C 68 66 67 64 67 62
            C 67 60 68 58 71 58
            L 79 58
            C 77 48 68 41 58 41
            Z
          "
          fill={color}
        />
      </svg>

      {showWordmark && (
        <span
          className="mt-1 font-extrabold tracking-tight text-[0.7em] leading-none select-none"
          style={{ color }}
        >
          buckme
        </span>
      )}
    </div>
  );
};

export default BuckMeLogo;
