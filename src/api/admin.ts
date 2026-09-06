import { adminApi as api } from "./client";
import type { CategoryRecord, CollectionRecord, OrderRecord, ProductRecord, StoreSettings, CustomerRecord } from "../types/admin";
import type { NotificationRecord, ContactMessage, Conversation, MessageStatus } from "../types/communication";

function collection<T>(value: T[] | { results: T[] }) { return Array.isArray(value) ? value : value.results; }
function product(value: Record<string, unknown>): ProductRecord {
  return {
    ...value,
    id: String(value.id),
    compare_at_price: Number(value.compare_at_price ?? value.compareAtPrice ?? 0),
    is_new: Boolean(value.is_new ?? value.new),
    created_at: String(value.created_at ?? value.createdAt ?? ""),
    category: typeof value.category === "string" ? value.category : "",
    collection: typeof value.collection === "string" ? value.collection : "",
    variants: value.variants ?? [],
    images: value.images ?? [],
    colors: value.colors ?? []
  } as ProductRecord;
}
function order(value: Record<string, unknown>): OrderRecord {
  return {
    ...value,
    id: String(value.id),
    order_number: String(value.order_number ?? value.orderNumber ?? ""),
    shipping_cost: Number(value.shipping_cost ?? value.shippingCost ?? 0),
    payment_method: String(value.payment_method ?? value.paymentMethod ?? ""),
    payment_status: value.payment_status ?? value.paymentStatus,
    created_at: String(value.created_at ?? value.createdAt ?? ""),
    items: value.items ?? [],
    shipping: value.shipping ?? {}
  } as OrderRecord;
}

export async function listAdmin<T>(resource: string, query = "") {
  const value = await api.get<unknown[]>(`/admin/${resource}/${query}`);
  const values = collection(value as unknown[] | { results: unknown[] });
  if (resource === "products") return values.map((item) => product(item as Record<string, unknown>)) as T[];
  if (resource === "orders") return values.map((item) => order(item as Record<string, unknown>)) as T[];
  return values as T[];
}
export async function getAdmin<T>(resource: string, id: string) { const value = await api.get<Record<string, unknown>>(`/admin/${resource}/${id}/`); return (resource === "products" ? product(value) : resource === "orders" ? order(value) : value) as T; }
function payload(resource: string, value: object) {
  if (resource !== "products") return value;
  const item = value as Record<string, unknown>;
  return {
    ...item,
    compare_at_price: item.compare_at_price,
    is_new: item.is_new,
    category_id: item.category_id,
    collection_id: item.collection_id,
    variants: undefined,
    colors: undefined,
    created_at: undefined
  };
}
export async function createAdmin<T>(resource: string, value: object) {
  if (value instanceof FormData) return api.post<T>(`/admin/${resource}/`, value);
  return api.post<T>(`/admin/${resource}/`, payload(resource, value));
}
export async function updateAdmin<T>(resource: string, id: string, value: object) {
  if (value instanceof FormData) return api.patch<T>(`/admin/${resource}/${id}/`, value);
  return api.patch<T>(`/admin/${resource}/${id}/`, payload(resource, value));
}
export async function deleteAdmin(resource: string, id: string) { return api.delete<void>(`/admin/${resource}/${id}/`); }
export async function getDashboard() { return api.get<Record<string, number>>("/admin/dashboard/"); }
export async function getSettings() { return api.get<StoreSettings>("/admin/settings/"); }
export async function updateSettings(value: StoreSettings) { return api.put<StoreSettings>("/admin/settings/store/", value); }
export async function updateStock(id: string, stock: number) { return api.post<ProductRecord>(`/admin/products/${id}/stock/`, { stock }); }
export async function updateVariant(productId: string, variant: { name: string; stock?: number; hex?: string }) { return api.post(`/admin/products/${productId}/variants/`, variant); }
export async function uploadProductImage(id: string, file: File) { const form = new FormData(); form.append("image", file); return api.post(`/admin/products/${id}/images/`, form); }
export async function deleteProductImage(productId: string, imageId: string) { return api.delete(`/admin/products/${productId}/images/${imageId}/`); }

// Admin Notifications
export async function getAdminNotifications() {
  const res = await api.get<NotificationRecord[] | { results: NotificationRecord[] }>("/admin/notifications/");
  return Array.isArray(res) ? res : res.results;
}

// Admin Contact Management
export async function listContactMessages(status?: MessageStatus) {
  const query = status ? `?status=${status}` : "";
  const res = await api.get<ContactMessage[] | { results: ContactMessage[] }>(`/admin/contact-messages/${query}`);
  return Array.isArray(res) ? res : res.results;
}
export async function getAdminConversation(id: string) { return api.get<Conversation>(`/admin/contact-messages/${id}/`); }
export async function adminReplyToMessage(id: string, text: string) { return api.post(`/admin/contact-messages/${id}/reply/`, { text }); }
export async function updateMessageStatus(id: string, status: MessageStatus) { return api.patch(`/admin/contact-messages/${id}/`, { status }); }

export type { CategoryRecord, CollectionRecord, OrderRecord, ProductRecord, StoreSettings, CustomerRecord };
