import { api } from "./client";
import type { CustomerAddress, UserProfile } from "../types/user";
import type { CartItem } from "../contexts/CartProvider";
import type { NotificationRecord, ContactMessage, Conversation } from "../types/communication";

interface ApiAddress {
  id: string;
  full_name: string;
  phone: string;
  address: string;
  wilaya: string;
  commune: string;
  postal_code: string;
  is_default: boolean;
  created_at: string;
}

function toAddress(a: ApiAddress): CustomerAddress {
  return {
    id: String(a.id),
    userId: "", // Scoped to current user in backend
    fullName: a.full_name,
    phone: a.phone,
    address: a.address,
    wilaya: a.wilaya,
    commune: a.commune,
    postalCode: a.postal_code,
    isDefault: a.is_default,
    createdAt: a.created_at
  };
}

export async function getProfile() { return api.get<UserProfile>("/auth/me/"); }
export async function patchProfile(data: { firstName: string; lastName: string; phone: string }) { return api.patch<UserProfile>("/auth/me/", { first_name: data.firstName, last_name: data.lastName, phone: data.phone }); }
export async function getAddresses() {
  const list = await api.get<ApiAddress[]>("/addresses/");
  return list.map(toAddress);
}
export async function addAddress(data: Omit<CustomerAddress, "id" | "userId">) {
  const res = await api.post<ApiAddress>("/addresses/", { full_name: data.fullName, phone: data.phone, address: data.address, wilaya: data.wilaya, commune: data.commune, postal_code: data.postalCode, is_default: data.isDefault });
  return toAddress(res);
}
export async function updateAddress(id: string, data: Partial<Omit<CustomerAddress, "id" | "userId">>) {
  const res = await api.patch<ApiAddress>(`/addresses/${id}/`, { full_name: data.fullName, phone: data.phone, address: data.address, wilaya: data.wilaya, commune: data.commune, postal_code: data.postalCode, is_default: data.isDefault });
  return toAddress(res);
}
export async function deleteAddress(id: string) { return api.delete<void>(`/addresses/${id}/`); }
export async function setDefaultAddress(id: string) {
  const res = await api.post<ApiAddress>(`/addresses/${id}/default/`, {});
  return toAddress(res);
}
export async function getCart() { return api.get<{ items: CartItem[] }>("/cart/"); }
export async function saveCart(items: CartItem[]) { return api.put("/cart/", { items }); }
export async function getWishlist() { return api.get<{ product_ids: string[] }>("/wishlist/"); }
export async function saveWishlist(productIds: string[]) { return api.put("/wishlist/", { product_ids: productIds }); }
export async function getOrders() { return api.get<unknown[] | { results: unknown[] }>("/orders/"); }

// Notifications
export async function getNotifications() {
  const res = await api.get<NotificationRecord[] | { results: NotificationRecord[] }>("/notifications/");
  return Array.isArray(res) ? res : res.results;
}
export async function markNotificationRead(id: string) { return api.post(`/notifications/${id}/read/`, {}); }
export async function markAllNotificationsRead() { return api.post("/notifications/read-all/", {}); }

// Contact & Support
export async function getMyMessages() {
  const res = await api.get<ContactMessage[] | { results: ContactMessage[] }>("/contact-messages/");
  return Array.isArray(res) ? res : res.results;
}
export async function getConversation(id: string) { return api.get<Conversation>(`/contact-messages/${id}/`); }
export async function replyToMessage(id: string, text: string) { return api.post(`/contact-messages/${id}/reply/`, { text }); }
export async function submitContactForm(data: { name: string; email: string; subject: string; message: string }) {
  return api.post("/contact/", data);
}
