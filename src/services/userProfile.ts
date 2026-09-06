import type { UserProfile } from "../types/user";
import { getProfile, patchProfile } from "../api/account";

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  if (!uid) return null;
  return getProfile();
}

export async function saveUserProfile(
  uid: string,
  data: { firstName: string; lastName: string; phone: string }
): Promise<UserProfile> {
  if (!uid) throw new Error("You must be signed in.");
  return patchProfile(data);
}
