type BrandMarkProps = {
  className?: string;
};

/**
 * Strive brand glyph: an upward "progress" stroke (a rising path with an
 * arrow head) that reads as forward momentum / striving. Uses currentColor so
 * it inherits text color (e.g. text-white inside the brand badge).
 */
export function BrandMark({ className = "" }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3.5 15.5 L9.5 9.5 L13 13 L20 5.5" />
      <path d="M20 10.5 L20 5.5 L15 5.5" />
    </svg>
  );
}
