export function getInventoryStatus(stock: number, lowStockThreshold: number) {
  if (stock <= 0) return "Out of Stock";
  if (stock <= lowStockThreshold) return "Low Stock";
  return "In Stock";
}
