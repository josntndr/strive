type BrandMarkProps = {
  className?: string;
  size?: number;
  priority?: boolean;
};

/**
 * Strive BrandMark: The 3D Sculpted Athletic Letter "S" Monogram on warm flame-coral squircle badge.
 */
export function BrandMark({ className = "", size = 40, priority = false }: BrandMarkProps) {
  return (
    <img
      src="/strive-logo.png"
      alt="Strive"
      width={size}
      height={size}
      className={`object-contain select-none shrink-0 ${className}`}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
