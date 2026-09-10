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
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Upper Kinetic Athletic Blade */}
      <path d="M3.5 4H20.5L14 11H8.5L11.5 7.5H3.5V4Z" />
      {/* Lower Kinetic Athletic Blade */}
      <path d="M20.5 20H3.5L10 13H15.5L12.5 16.5H20.5V20Z" />
    </svg>
  );
}
