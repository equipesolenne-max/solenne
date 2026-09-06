import { seedCategories, seedCollections, seedProducts } from "../data/adminMockData";
import { createAdmin, listAdmin } from "../api/admin";
import type { CategoryRecord, CollectionRecord } from "../types/admin";

export async function seedCatalog() {
  // 1. Create categories
  const categories: CategoryRecord[] = [];
  for (const cat of seedCategories) {
    try {
      const created = await createAdmin<CategoryRecord>("categories", cat);
      categories.push(created);
    } catch {
      // Ignore if exists
    }
  }

  // 2. Create collections
  const collections: CollectionRecord[] = [];
  for (const col of seedCollections) {
    try {
      const created = await createAdmin<CollectionRecord>("collections", col);
      collections.push(created);
    } catch {
      // Ignore
    }
  }

  // Refresh lists to be sure we have real IDs
  const allCats = await listAdmin<CategoryRecord>("categories");
  const allCols = await listAdmin<CollectionRecord>("collections");

  // 3. Create products
  for (const prod of seedProducts) {
    const category = allCats.find(c => c.name === prod.category);
    const collection = allCols.find(c => c.name === prod.collection);

    const payload = {
      ...prod,
      category_id: category?.id,
      collection_id: collection?.id,
      // Pass the placeholder URLs so they are saved to the 'images' JSONField
      images: prod.images
    };

    try {
      await createAdmin("products", payload);
    } catch (err) {
      console.error("Failed to seed product:", prod.name, err);
    }
  }
}
