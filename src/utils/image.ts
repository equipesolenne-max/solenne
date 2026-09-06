const MEDIA_BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api$/, "/media")
  : "http://127.0.0.1:8000/media";

/**
 * Resolves a raw image path from the backend into a fully qualified URL.
 * Handles:
 * 1. Full URLs (http://...)
 * 2. Data URLs (data:image/...)
 * 3. Relative paths (/media/...)
 * 4. Raw paths (products/image.jpg)
 */
export function getImageUrl(path: string | undefined | null): string {
  if (!path) {
    return "https://placehold.co/1000x1250/F3EDE1/1B2A46?text=Solenne";
  }

  // If it's already a full URL or base64, return it as is
  if (path.startsWith("http") || path.startsWith("data:") || path.startsWith("blob:")) {
    return path;
  }

  // If it starts with /media/, prepend the origin
  if (path.startsWith("/media/")) {
    const origin = MEDIA_BASE_URL.replace(/\/media$/, "");
    return `${origin}${path}`;
  }

  // Otherwise, assume it's a raw path relative to media root
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${MEDIA_BASE_URL}/${cleanPath}`;
}
