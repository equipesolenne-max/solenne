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

/**
 * Optimizes an image before upload.
 * Resizes to max 1920px width/height and compresses to JPEG/WebP.
 */
export async function optimizeImage(file: File): Promise<File | Blob> {
  // Don't optimize non-image files or SVGs
  if (!file.type.startsWith("image/") || file.type.includes("svg")) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const MAX_WIDTH = 1920;
      const MAX_HEIGHT = 1920;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Determine output format and quality
      // Use original type if it's png (to preserve transparency) else jpeg
      const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";

      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Only use optimized if it's actually smaller
            if (blob.size < file.size) {
                resolve(new File([blob], file.name, { type: outputType }));
            } else {
                resolve(file);
            }
          } else {
            resolve(file);
          }
        },
        outputType,
        0.82 // Quality
      );
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}
