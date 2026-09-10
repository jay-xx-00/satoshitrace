export function ReticleLogo({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className="text-signal"
    >
      <circle cx="24" cy="24" r="21" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.5" />
      <circle
        cx="24"
        cy="24"
        r="15"
        stroke="currentColor"
        strokeOpacity="0.9"
        strokeWidth="1.5"
        strokeDasharray="6 5"
      />
      <path d="M24 1v8M24 39v8M1 24h8M39 24h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M20 15h6.6c2.5 0 4.2 1.4 4.2 3.6 0 1.6-.9 2.8-2.3 3.3 1.8.4 3 1.8 3 3.8 0 2.6-2 4.3-5 4.3H20V15Zm3.2 6.1h3c1.1 0 1.8-.6 1.8-1.6s-.7-1.6-1.8-1.6h-3v3.2Zm0 6h3.3c1.2 0 2-.6 2-1.7s-.8-1.7-2-1.7h-3.3v3.4Z"
        fill="currentColor"
      />
      <path d="M23.2 12v3M27 12v3M23.2 30v3M27 30v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
