-- 006: Create indexes, distance calculation, and rating triggers
-- Run this LAST

-- ============================================
-- INDEXES
-- ============================================

-- Deliveries: most common queries
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_shipper_id ON deliveries(shipper_id);
CREATE INDEX idx_deliveries_driver_id ON deliveries(driver_id);
CREATE INDEX idx_deliveries_created_at ON deliveries(created_at DESC);
CREATE INDEX idx_deliveries_status_created ON deliveries(status, created_at DESC);

-- Bids
CREATE INDEX idx_bids_delivery_id ON bids(delivery_id);
CREATE INDEX idx_bids_driver_id ON bids(driver_id);
CREATE INDEX idx_bids_status ON bids(status);

-- Payments
CREATE INDEX idx_payments_delivery_id ON payments(delivery_id);
CREATE INDEX idx_payments_shipper_id ON payments(shipper_id);
CREATE INDEX idx_payments_driver_id ON payments(driver_id);

-- Reviews
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX idx_reviews_delivery_id ON reviews(delivery_id);

-- Messages
CREATE INDEX idx_messages_delivery_id ON messages(delivery_id);
CREATE INDEX idx_messages_created_at ON messages(delivery_id, created_at);

-- ============================================
-- DISTANCE CALCULATION (Haversine formula)
-- ============================================
-- Calculates straight-line distance in miles between two lat/lng points.
-- This runs automatically when coordinates are set on a delivery.

CREATE OR REPLACE FUNCTION calculate_distance_miles(
  lat1 DECIMAL, lng1 DECIMAL,
  lat2 DECIMAL, lng2 DECIMAL
)
RETURNS DECIMAL AS $$
DECLARE
  r CONSTANT DECIMAL := 3958.8; -- Earth radius in miles
  dlat DECIMAL;
  dlng DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  IF lat1 IS NULL OR lng1 IS NULL OR lat2 IS NULL OR lng2 IS NULL THEN
    RETURN NULL;
  END IF;

  dlat := radians(lat2 - lat1);
  dlng := radians(lng2 - lng1);
  a := sin(dlat / 2) ^ 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng / 2) ^ 2;
  c := 2 * asin(sqrt(a));

  RETURN round((r * c)::DECIMAL, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Auto-calculate distance when delivery coordinates change
CREATE OR REPLACE FUNCTION auto_calculate_distance()
RETURNS TRIGGER AS $$
BEGIN
  NEW.distance_miles := calculate_distance_miles(
    NEW.pickup_lat, NEW.pickup_lng,
    NEW.delivery_lat, NEW.delivery_lng
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER delivery_auto_distance
  BEFORE INSERT OR UPDATE OF pickup_lat, pickup_lng, delivery_lat, delivery_lng
  ON deliveries
  FOR EACH ROW EXECUTE FUNCTION auto_calculate_distance();

-- ============================================
-- RATING UPDATE TRIGGER
-- ============================================
-- When a new review is inserted, recalculate the reviewee's average rating.

CREATE OR REPLACE FUNCTION update_rating_on_review()
RETURNS TRIGGER AS $$
DECLARE
  new_avg DECIMAL(3,2);
  new_count INTEGER;
  reviewee_role user_role;
BEGIN
  -- Get the role of the person being reviewed
  SELECT role INTO reviewee_role FROM profiles WHERE id = NEW.reviewee_id;

  -- Calculate new average and count
  SELECT AVG(rating)::DECIMAL(3,2), COUNT(*)
  INTO new_avg, new_count
  FROM reviews
  WHERE reviewee_id = NEW.reviewee_id;

  -- Update the appropriate profile table
  IF reviewee_role = 'driver' THEN
    UPDATE driver_profiles
    SET rating_avg = new_avg, rating_count = new_count
    WHERE id = NEW.reviewee_id;
  ELSIF reviewee_role = 'shipper' THEN
    UPDATE shipper_profiles
    SET rating_avg = new_avg, rating_count = new_count
    WHERE id = NEW.reviewee_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER after_review_insert
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_rating_on_review();

-- ============================================
-- ENABLE REALTIME (for messages and delivery status updates)
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE deliveries;
ALTER PUBLICATION supabase_realtime ADD TABLE bids;
