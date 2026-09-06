const MAX_TOTAL_IMAGE_SIZE = 700 * 1024;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`Unable to read ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

export async function uploadProductImages(files: File[], _prefix = "products"): Promise<string[]> {
  if (files.length === 0) return [];
  if (files.reduce((sum, file) => sum + file.size, 0) > MAX_TOTAL_IMAGE_SIZE) {
    throw new Error("Product images are too large. Keep the combined image size below 700 KB.");
  }
  return Promise.all(files.map(fileToDataUrl));
}
