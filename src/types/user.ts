export interface UserProfile {
  uid: string;
  firstName?: string;
  lastName?: string;
  name: string;
  email: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerAddress {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  address: string;
  wilaya: string;
  commune: string;
  postalCode?: string;
  isDefault: boolean;
  createdAt?: string;
}
