// Safely convert any YouTube URL (watch link, short link, or embed link)
// into an embeddable URL. Returns "" when there is no usable URL so callers
// can avoid rendering a broken iframe.
export function getYouTubeEmbedUrl(url?: string): string {
  if (!url) return "";

  if (url.includes("youtube.com/embed/")) {
    return url;
  }

  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }

  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }

  // Unrecognized / non-YouTube URL: return "" so callers show the fallback
  // instead of rendering a broken iframe.
  return "";
}
