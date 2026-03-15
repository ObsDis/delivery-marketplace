-- 002: Create profiles, driver_profiles, shipper_profiles
-- Run this SECOND (depends on enums from 001)

-- Base profile extending auth.users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  business_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Extra info for drivers
CREATE TABLE driver_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_type vehicle_type NOT NULL DEFAULT 'sedan',
  service_zip_codes TEXT[] DEFAULT '{}',
  auto_quote_settings JSONB DEFAULT '{
    "per_mile_rate": 1.50,
    "size_rates": {
      "small": 15,
      "medium": 25,
      "large": 40,
      "xl": 60,
      "xxl": 85,
      "full_van": 120
    },
    "speed_surcharge_percent": 20
  }'::jsonb,
  stripe_connect_account_id TEXT,
  subscription_status subscription_status NOT NULL DEFAULT 'trial',
  subscription_id TEXT,
  rating_avg DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Extra info for shippers
CREATE TABLE shipper_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT,
  company_address TEXT,
  stripe_customer_id TEXT,
  subscription_tier shipper_tier NOT NULL DEFAULT 'free',
  rating_avg DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at on profiles
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER driver_profiles_updated_at
  BEFORE UPDATE ON driver_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER shipper_profiles_updated_at
  BEFORE UPDATE ON shipper_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile + role-specific profile on signup
-- This trigger fires when a new user is inserted into auth.users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_val user_role;
BEGIN
  -- Default role from metadata, fallback to 'shipper'
  user_role_val := COALESCE(
    (NEW.raw_user_meta_data->>'role')::user_role,
    'shipper'
  );

  -- Create base profile
  INSERT INTO profiles (id, role, full_name, email, phone)
  VALUES (
    NEW.id,
    user_role_val,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL)
  );

  -- Create role-specific profile
  IF user_role_val = 'driver' THEN
    INSERT INTO driver_profiles (id) VALUES (NEW.id);
  ELSIF user_role_val = 'shipper' THEN
    INSERT INTO shipper_profiles (id) VALUES (NEW.id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
