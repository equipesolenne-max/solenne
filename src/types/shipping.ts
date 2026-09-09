export type DeliveryMethod = "home_delivery" | "stop_desk";

export interface ShippingRate {
  wilaya_code: number;
  wilaya_name: string;
  home_delivery_price: number;
  stop_desk_price: number;
  return_price: number;
  is_active: boolean;
}
