const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

/**
 * Resolves an image source into a fully qualified URL.
 * Since the new architecture uses a dedicated Media API,
 * we just need to ensure the URL is absolute.
 */
export function getImageUrl(path: string | undefined | null): string {
  if (!path) {
    return "https://placehold.co/1000x1250/F3EDE1/1B2A46?text=Solenne";
  }

  // If it's already an absolute URL (e.g. from the backend serializer), return it
  if (path.startsWith("http")) {
    return path;
  }

  // If it's a relative path starting with /api/media/, prepend the origin
  if (path.startsWith("/api/media/")) {
    try {
      const origin = new URL(API_BASE_URL).origin;
      return `${origin}${path}`;
    } catch {
      // Fallback if URL parsing fails
      return path;
    }
  }

  // Fallback for any other unexpected cases
  return path;
}
