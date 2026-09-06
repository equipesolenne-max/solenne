import type { CustomerAddress } from "../types/user";
import { addAddress, deleteAddress, getAddresses, setDefaultAddress, updateAddress } from "../api/account";

export async function fetchCustomerAddresses(uid: string): Promise<CustomerAddress[]> {
  if (!uid) return [];
  return getAddresses();
}

export async function addCustomerAddress(
  uid: string,
  data: Omit<CustomerAddress, "id" | "userId">
): Promise<string> {
  if (!uid) throw new Error("You must be signed in.");
  const result = await addAddress(data);
  return result.id;
}

export async function updateCustomerAddress(
  uid: string,
  addressId: string,
  data: Partial<Omit<CustomerAddress, "id" | "userId">>
): Promise<void> {
  if (!uid || !addressId) throw new Error("You must be signed in.");
  await updateAddress(addressId, data);
}

export async function deleteCustomerAddress(uid: string, addressId: string): Promise<void> {
  if (!uid || !addressId) throw new Error("You must be signed in.");
  await deleteAddress(addressId);
}

export async function setDefaultCustomerAddress(uid: string, addressId: string): Promise<void> {
  if (!uid || !addressId) throw new Error("You must be signed in.");
  await setDefaultAddress(addressId);
}
