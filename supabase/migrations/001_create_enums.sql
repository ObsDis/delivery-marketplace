-- 001: Create all custom enum types
-- Run this FIRST in the Supabase SQL Editor

CREATE TYPE user_role AS ENUM ('shipper', 'driver', 'admin');

CREATE TYPE vehicle_type AS ENUM ('sedan', 'suv', 'pickup', 'cargo_van', 'box_truck');

CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'past_due', 'canceled');

CREATE TYPE shipper_tier AS ENUM ('free', 'business', 'pro', 'enterprise');

CREATE TYPE item_size AS ENUM ('small', 'medium', 'large', 'xl', 'xxl', 'full_van');

CREATE TYPE delivery_status AS ENUM (
  'posted',
  'bidding',
  'accepted',
  'picked_up',
  'in_transit',
  'delivered',
  'canceled',
  'disputed'
);

CREATE TYPE bid_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');

CREATE TYPE payment_status AS ENUM (
  'pending',
  'charged',
  'payout_scheduled',
  'paid_out',
  'refunded'
);

CREATE TYPE reviewer_role AS ENUM ('shipper', 'driver');
