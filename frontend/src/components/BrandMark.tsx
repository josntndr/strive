type BrandMarkProps = {
  className?: string;
};

/**
 * Strive brand glyph: An Olympic Barbell loaded with bumper plates seamlessly
 * integrated with a muscular athletic letter "S" monogram.
 *
 * Aligned with Strive's athletic performance ethos (lifting, progressive overload,
 * precision strength architecture).
 */
export function BrandMark({ className = "" }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Olympic Barbell Sleeve / Bar */}
      <line
        x1="2"
        y1="12"
        x2="22"
        y2="12"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        opacity={0.55}
      />

      {/* Left Loaded Bumper Plates */}
      <rect
        x="2.4"
        y="7"
        width="2"
        height="10"
        rx="1"
        fill="currentColor"
        opacity={0.95}
      />
      <rect
        x="5.1"
        y="8.5"
        width="1.5"
        height="7"
        rx="0.75"
        fill="currentColor"
        opacity={0.75}
      />
      <circle cx="7.4" cy="12" r="0.75" fill="currentColor" opacity={0.95} />

      {/* Right Loaded Bumper Plates */}
      <circle cx="16.6" cy="12" r="0.75" fill="currentColor" opacity={0.95} />
      <rect
        x="17.4"
        y="8.5"
        width="1.5"
        height="7"
        rx="0.75"
        fill="currentColor"
        opacity={0.75}
      />
      <rect
        x="19.6"
        y="7"
        width="2"
        height="10"
        rx="1"
        fill="currentColor"
        opacity={0.95}
      />

      {/* Bold Muscular Letter 'S' Monogram (Front layer) */}
      <path
        d="M15.8 7.5C14.8 6.5 13.4 5.8 11.8 5.8C8.8 5.8 7 7.4 7 9.8C7 13.5 17 12.5 17 16.2C17 18.6 15 20.2 12.2 20.2C10 20.2 8.4 19.2 7.5 17.8"
        stroke="currentColor"
        strokeWidth={2.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
