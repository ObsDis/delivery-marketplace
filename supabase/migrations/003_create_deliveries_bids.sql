-- 003: Create deliveries and bids tables
-- Run this THIRD (depends on enums and profiles)

CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipper_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  item_size item_size NOT NULL DEFAULT 'medium',
  item_weight_lbs DECIMAL(8,2),
  item_quantity INTEGER NOT NULL DEFAULT 1,
  image_urls TEXT[] DEFAULT '{}',
  pickup_address TEXT NOT NULL,
  pickup_lat DECIMAL(10,7),
  pickup_lng DECIMAL(10,7),
  delivery_address TEXT NOT NULL,
  delivery_lat DECIMAL(10,7),
  delivery_lng DECIMAL(10,7),
  distance_miles DECIMAL(8,2),
  pickup_window_start TIMESTAMPTZ,
  pickup_window_end TIMESTAMPTZ,
  delivery_deadline TIMESTAMPTZ,
  max_bid_amount DECIMAL(10,2),
  auto_bid_enabled BOOLEAN DEFAULT false,
  insurance_required BOOLEAN DEFAULT false,
  insurance_value DECIMAL(10,2),
  status delivery_status NOT NULL DEFAULT 'posted',
  accepted_bid_id UUID, -- FK added below after bids table exists
  driver_id UUID REFERENCES profiles(id),
  proof_of_delivery_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  is_auto_quote BOOLEAN DEFAULT false,
  message TEXT,
  status bid_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- One bid per driver per delivery
  UNIQUE(delivery_id, driver_id)
);

-- Now add the FK from deliveries.accepted_bid_id -> bids.id
ALTER TABLE deliveries
  ADD CONSTRAINT fk_accepted_bid
  FOREIGN KEY (accepted_bid_id) REFERENCES bids(id);

-- Auto-update delivery status to 'bidding' when first bid arrives
CREATE OR REPLACE FUNCTION on_bid_created()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE deliveries
  SET status = 'bidding', updated_at = now()
  WHERE id = NEW.delivery_id
    AND status = 'posted';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER after_bid_insert
  AFTER INSERT ON bids
  FOR EACH ROW EXECUTE FUNCTION on_bid_created();

-- Updated_at trigger for deliveries
CREATE TRIGGER deliveries_updated_at
  BEFORE UPDATE ON deliveries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
