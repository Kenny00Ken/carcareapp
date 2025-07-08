-- Car Care Connect PostgreSQL Schema
-- This schema is designed to work with Firebase Data Connect

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role TEXT CHECK (role IN ('CarOwner','Mechanic','Dealer')) NOT NULL,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- cars table
CREATE TABLE cars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INT CHECK (year BETWEEN 1900 AND EXTRACT(YEAR FROM NOW())),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- requests table
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mechanic_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending','in_progress','completed')) DEFAULT 'pending',
  urgency TEXT CHECK (urgency IN ('low','medium','high','critical')) DEFAULT 'medium',
  location TEXT,
  estimated_hours INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- parts table
CREATE TABLE parts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dealer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  image_url TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  stock INT DEFAULT 0 CHECK (stock >= 0),
  min_stock_threshold INT DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- diagnoses table (enhanced)
CREATE TABLE diagnoses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  mechanic_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  details TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low','medium','high','critical')) NOT NULL,
  estimated_cost NUMERIC(10,2) CHECK (estimated_cost >= 0),
  actual_cost NUMERIC(10,2) CHECK (actual_cost >= 0),
  parts_used UUID[] DEFAULT '{}',
  image_urls TEXT[] DEFAULT '{}',
  resolution_time INTERVAL,
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_notes TEXT,
  status TEXT CHECK (status IN ('draft','submitted','approved','completed')) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPZ DEFAULT NOW()
);

-- transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_id UUID REFERENCES parts(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mechanic_id UUID REFERENCES users(id) ON DELETE SET NULL,
  diagnosis_id UUID REFERENCES diagnoses(id) ON DELETE SET NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  status TEXT CHECK (status IN ('pending','approved','rejected','completed')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('info','success','warning','error')) DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);

CREATE INDEX idx_cars_owner_id ON cars(owner_id);
CREATE INDEX idx_cars_make_model ON cars(make, model);

CREATE INDEX idx_requests_owner_id ON requests(owner_id);
CREATE INDEX idx_requests_mechanic_id ON requests(mechanic_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_urgency ON requests(urgency);
CREATE INDEX idx_requests_created_at ON requests(created_at DESC);

CREATE INDEX idx_parts_dealer_id ON parts(dealer_id);
CREATE INDEX idx_parts_category ON parts(category);
CREATE INDEX idx_parts_stock ON parts(stock);
CREATE INDEX idx_parts_price ON parts(price);

CREATE INDEX idx_diagnoses_request_id ON diagnoses(request_id);
CREATE INDEX idx_diagnoses_mechanic_id ON diagnoses(mechanic_id);
CREATE INDEX idx_diagnoses_severity ON diagnoses(severity);
CREATE INDEX idx_diagnoses_status ON diagnoses(status);

CREATE INDEX idx_transactions_part_id ON transactions(part_id);
CREATE INDEX idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX idx_transactions_mechanic_id ON transactions(mechanic_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Create triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cars_updated_at BEFORE UPDATE ON cars FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parts_updated_at BEFORE UPDATE ON parts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_diagnoses_updated_at BEFORE UPDATE ON diagnoses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (optional)
-- Insert sample users
INSERT INTO users (id, role, name, phone, email, address) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'CarOwner', 'John Doe', '+1234567890', 'john.doe@example.com', '123 Main St, City, State'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Mechanic', 'Jane Smith', '+1234567891', 'jane.smith@example.com', '456 Oak Ave, City, State'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Dealer', 'Bob Johnson', '+1234567892', 'bob.johnson@example.com', '789 Pine Rd, City, State');

-- Insert sample cars
INSERT INTO cars (owner_id, make, model, year) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Toyota', 'Camry', 2020),
  ('550e8400-e29b-41d4-a716-446655440001', 'Honda', 'Civic', 2018);

-- Insert sample parts
INSERT INTO parts (dealer_id, name, description, category, price, stock) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 'Brake Pads - Toyota Camry', 'High-quality brake pads for Toyota Camry 2018-2022', 'Brakes', 89.99, 25),
  ('550e8400-e29b-41d4-a716-446655440003', 'Oil Filter - Honda Civic', 'Premium oil filter for Honda Civic 2016-2021', 'Engine', 24.99, 15);

-- Note: This schema is designed to work with Firebase Data Connect
-- Make sure to configure your Firebase project accordingly 