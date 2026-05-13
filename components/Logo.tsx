export function Logo({ size = 56 }: { size?: number }) {
  return (
    <svg viewBox="0 0 140 140" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGradHand" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22C1A2" />
          <stop offset="100%" stopColor="#5C4DFF" />
        </linearGradient>
      </defs>

      {/* C exterior */}
      <path
        d="M 108 38 A 40 40 0 1 0 108 102"
        stroke="#1B2A4E"
        strokeWidth="9"
        fill="none"
        strokeLinecap="round"
      />

      {/* Personas (cabeza + cuerpo) con degradado por posición */}
      <circle cx="48" cy="62" r="4" fill="#22C1A2" />
      <rect x="44" y="66" width="8" height="20" rx="3" fill="#22C1A2" />

      <circle cx="60" cy="56" r="4.5" fill="#3DAAB5" />
      <rect x="55.5" y="60" width="9" height="26" rx="3" fill="#3DAAB5" />

      <circle cx="72" cy="50" r="5" fill="#4A90E2" />
      <rect x="67" y="54" width="10" height="32" rx="3" fill="#4A90E2" />

      <circle cx="84" cy="56" r="4.5" fill="#7570E0" />
      <rect x="79.5" y="60" width="9" height="26" rx="3" fill="#7570E0" />

      <circle cx="96" cy="62" r="4" fill="#5C4DFF" />
      <rect x="92" y="66" width="8" height="20" rx="3" fill="#5C4DFF" />

      {/* Mano */}
      <path
        d="M 36 88 Q 70 112 104 88 Q 100 100 90 104 Q 70 110 50 104 Q 40 100 36 88 Z"
        fill="url(#logoGradHand)"
      />
    </svg>
  );
}
