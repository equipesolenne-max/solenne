export function readableApiError(reason: unknown, fallback: string) {
  const message = reason instanceof Error ? reason.message : "";
  if (message.includes("permission-denied") || message.includes("403")) return "You do not have permission to perform this action.";
  if (message.includes("network-request-failed") || message.includes("Failed to fetch")) return "Network error. Check your connection and try again.";
  if (message.includes("401")) return "Your session has expired. Please sign in again.";
  if (message.includes("404")) return "The requested resource was not found.";
  if (message.includes("500")) return "A server error occurred. Please try again later.";
  return message || fallback;
}
