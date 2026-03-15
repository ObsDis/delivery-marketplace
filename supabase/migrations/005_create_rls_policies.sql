-- 005: Enable RLS and create policies
-- Run this FIFTH

-- ============================================
-- Enable RLS on all tables
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipper_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES
-- ============================================
-- Anyone authenticated can read any profile (needed for names/ratings on listings)
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- DRIVER PROFILES
-- ============================================
CREATE POLICY "Driver profiles are viewable by authenticated users"
  ON driver_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Drivers can update own driver profile"
  ON driver_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- SHIPPER PROFILES
-- ============================================
CREATE POLICY "Shipper profiles are viewable by authenticated users"
  ON shipper_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Shippers can update own shipper profile"
  ON shipper_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- DELIVERIES
-- ============================================
-- Shippers can see all posted/bidding deliveries + their own deliveries
-- Drivers can see posted/bidding deliveries + deliveries assigned to them
CREATE POLICY "Users can view available and own deliveries"
  ON deliveries FOR SELECT
  TO authenticated
  USING (
    status IN ('posted', 'bidding')
    OR shipper_id = auth.uid()
    OR driver_id = auth.uid()
  );

-- Only shippers can create deliveries
CREATE POLICY "Shippers can create deliveries"
  ON deliveries FOR INSERT
  TO authenticated
  WITH CHECK (
    shipper_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'shipper'
    )
  );

-- Shippers can update their own deliveries (cancel, accept bid, etc.)
CREATE POLICY "Shippers can update own deliveries"
  ON deliveries FOR UPDATE
  TO authenticated
  USING (shipper_id = auth.uid())
  WITH CHECK (shipper_id = auth.uid());

-- Drivers can update deliveries assigned to them (status: picked_up, in_transit, delivered, proof_of_delivery)
CREATE POLICY "Drivers can update assigned deliveries"
  ON deliveries FOR UPDATE
  TO authenticated
  USING (driver_id = auth.uid())
  WITH CHECK (driver_id = auth.uid());

-- ============================================
-- BIDS
-- ============================================
-- Shippers can see bids on their deliveries
CREATE POLICY "Shippers can view bids on their deliveries"
  ON bids FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deliveries
      WHERE deliveries.id = bids.delivery_id
        AND deliveries.shipper_id = auth.uid()
    )
  );

-- Drivers can see their own bids
CREATE POLICY "Drivers can view own bids"
  ON bids FOR SELECT
  TO authenticated
  USING (driver_id = auth.uid());

-- Drivers can create bids
CREATE POLICY "Drivers can create bids"
  ON bids FOR INSERT
  TO authenticated
  WITH CHECK (
    driver_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'driver'
    )
  );

-- Drivers can update their own bids (withdraw)
CREATE POLICY "Drivers can update own bids"
  ON bids FOR UPDATE
  TO authenticated
  USING (driver_id = auth.uid())
  WITH CHECK (driver_id = auth.uid());

-- ============================================
-- PAYMENTS
-- ============================================
-- Users can see payments they're involved in
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (shipper_id = auth.uid() OR driver_id = auth.uid());

-- Only server/service role should insert payments (via API routes)
-- No INSERT policy for authenticated users — payments created server-side

-- ============================================
-- REVIEWS
-- ============================================
-- Anyone authenticated can read reviews
CREATE POLICY "Reviews are viewable by authenticated users"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

-- Users can create reviews for deliveries they participated in
CREATE POLICY "Users can create reviews for their deliveries"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    reviewer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM deliveries
      WHERE deliveries.id = reviews.delivery_id
        AND deliveries.status = 'delivered'
        AND (deliveries.shipper_id = auth.uid() OR deliveries.driver_id = auth.uid())
    )
  );

-- ============================================
-- MESSAGES
-- ============================================
-- Users can see messages for deliveries they're involved in
CREATE POLICY "Users can view messages for their deliveries"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deliveries
      WHERE deliveries.id = messages.delivery_id
        AND (deliveries.shipper_id = auth.uid() OR deliveries.driver_id = auth.uid())
    )
  );

-- Users can send messages for deliveries they're involved in
CREATE POLICY "Users can send messages for their deliveries"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM deliveries
      WHERE deliveries.id = messages.delivery_id
        AND (deliveries.shipper_id = auth.uid() OR deliveries.driver_id = auth.uid())
    )
  );
