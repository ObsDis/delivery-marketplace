export type UserRole = "shipper" | "driver" | "admin";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Delivery {
  id: string;
  shipper_id: string;
  title: string;
  description: string;
  pickup_address: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_address: string;
  dropoff_lat: number;
  dropoff_lng: number;
  distance_miles: number;
  weight_lbs: number | null;
  dimensions: string | null;
  pickup_date: string;
  pickup_time_window: string | null;
  budget: number;
  status: DeliveryStatus;
  assigned_driver_id: string | null;
  created_at: string;
  updated_at: string;
}

export type DeliveryStatus =
  | "posted"
  | "bidding"
  | "assigned"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "cancelled";

export interface Bid {
  id: string;
  delivery_id: string;
  driver_id: string;
  amount: number;
  message: string | null;
  status: BidStatus;
  created_at: string;
}

export type BidStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export interface DriverProfile {
  user_id: string;
  vehicle_type: string;
  license_plate: string;
  stripe_connect_id: string | null;
  subscription_status: SubscriptionStatus;
  subscription_id: string | null;
  rating: number;
  total_deliveries: number;
}

export type SubscriptionStatus =
  | "active"
  | "past_due"
  | "cancelled"
  | "none";
