export function BuckMeLogo({
  className = "h-8 w-8",
  color = "#6124A8",
  innerColor = "#F8F7FC",
}: {
  className?: string;
  color?: string;
  innerColor?: string;
}) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className} aria-label="BuckMe logo">
      {/* Speed lines on left */}
      <rect x="6" y="34" width="16" height="6" rx="3" fill={color} />
      <rect x="2" y="52" width="20" height="6" rx="3" fill={color} />
      <rect x="10" y="70" width="14" height="6" rx="3" fill={color} />
      {/* Lowercase b */}
      <path
        d="M24 14H40V42C44.5 36.5 52 33 60.5 33C76.5 33 88 45.5 88 61.5C88 77.5 76.5 90 60.5 90C45.5 90 34 78.5 34 62V14H24Z"
        fill={color}
      />
      <circle cx="60.5" cy="61.5" r="14.5" fill={innerColor} />
    </svg>
  );
}

export function DualAvatars() {
  return (
    <div className="flex items-center -space-x-2" aria-label="Jason and Lucia">
      {/* Jason */}
      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-amber-200 to-amber-500 text-xs font-bold text-stone-900 shadow-sm">
        J
      </div>
      {/* Lucia */}
      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-rose-300 to-purple-600 text-xs font-bold text-white shadow-sm">
        L
      </div>
    </div>
  );
}

export function BruisedBMascot({ className = "h-24 w-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} aria-label="BuckMe mascot">
      {/* Ground shadow */}
      <ellipse cx="60" cy="106" rx="28" ry="5" fill="#D1D5DB" />
      {/* Cute bruised purple b body */}
      <path
        d="M36 22C36 16.5 40.5 12 46 12C51.5 12 56 16.5 56 22V44C60 40 66 38 72 38C88 38 98 51 98 68C98 86 85 98 67 98C49 98 36 85 36 67V22Z"
        fill="#A78BFA"
      />
      <path
        d="M36 22C36 16.5 40.5 12 46 12V98C40 94 36 82 36 67V22Z"
        fill="#6D28D9"
      />
      {/* Band-aid */}
      <rect
        x="52"
        y="46"
        width="24"
        height="9"
        rx="4"
        transform="rotate(-8 52 46)"
        fill="#F3E8FF"
        stroke="#7C3AED"
        strokeWidth="1.5"
      />
      {/* Sad eyes */}
      <circle cx="56" cy="64" r="3.5" fill="#1F2937" />
      <circle cx="74" cy="64" r="3.5" fill="#1F2937" />
      {/* Sad eyebrows */}
      <path d="M51 59L60 61" stroke="#4C1D95" strokeWidth="2" strokeLinecap="round" />
      <path d="M79 59L70 61" stroke="#4C1D95" strokeWidth="2" strokeLinecap="round" />
      {/* Frown */}
      <path d="M59 77C62 73 68 73 71 77" stroke="#4C1D95" strokeWidth="2.5" strokeLinecap="round" />
      {/* Tear drop */}
      <path d="M78 69C78 72 81 74 81 74C81 74 84 72 84 69C84 67 81 64 81 64C81 64 78 67 78 69Z" fill="#E0F2FE" />
      {/* Little gold coin */}
      <circle cx="84" cy="95" r="7" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
      <text x="81.5" y="98.5" fill="#92400E" fontSize="9" fontWeight="bold">$</text>
    </svg>
  );
}

export function SplashOverlay({ onSkip }: { onSkip: () => void }) {
  return (
    <button
      type="button"
      onClick={onSkip}
      className="animate-bm-splash buckme-gradient buckme-pattern fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-white"
    >
      <BuckMeLogo className="h-24 w-24 drop-shadow-lg" color="#EAE8F0" innerColor="#6D28D9" />
      <span className="mt-3 text-4xl font-extrabold tracking-tight text-[#EAE8F0]">
        buckme
      </span>
      <p className="mt-3 text-sm font-medium tracking-wide text-purple-100/90">
        Thank you for bucking with us
      </p>
    </button>
  );
}
