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
      strokeWidth={3.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Pure Athletic Letter 'S' Monogram */}
      <path d="M18.5 6C17.5 4.5 15.2 3.8 12.5 3.8C8.5 3.8 5.2 5.8 5.2 9C5.2 13.5 18.8 11.5 18.8 16C18.8 19.2 15.5 20.8 11.8 20.8C8.5 20.8 6.2 19.5 5.5 18" />
    </svg>
  );
}
