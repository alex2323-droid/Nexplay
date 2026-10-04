-- ===================================================
-- NEXPLAY - Supabase Database Schema
-- Digital Game Recharge Store Platform
-- ===================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN', 'SUPPORT')),
    phone VARCHAR(50),
    saved_player_ids JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Games Table
CREATE TABLE IF NOT EXISTS games (
    id VARCHAR(100) PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    publisher VARCHAR(255) NOT NULL,
    banner_url TEXT NOT NULL,
    icon_url TEXT NOT NULL,
    description TEXT NOT NULL,
    badge VARCHAR(50),
    active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    player_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    faq JSONB DEFAULT '[]'::jsonb,
    important_info TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(100) PRIMARY KEY,
    game_id VARCHAR(100) REFERENCES games(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    currency_amount NUMERIC(12, 2) NOT NULL,
    currency_name VARCHAR(100) NOT NULL,
    original_price NUMERIC(10, 2) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    cost_price NUMERIC(10, 2) NOT NULL,
    provider_product_id VARCHAR(100) NOT NULL,
    is_offer BOOLEAN DEFAULT false,
    discount_percentage INT DEFAULT 0,
    badge VARCHAR(50),
    active BOOLEAN DEFAULT true,
    popular BOOLEAN DEFAULT false,
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    subtotal NUMERIC(10, 2) NOT NULL,
    discount NUMERIC(10, 2) DEFAULT 0,
    coupon_code VARCHAR(50),
    total_amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    payment_method VARCHAR(50) NOT NULL,
    payment_transaction_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'PENDING_PAYMENT' CHECK (status IN ('PENDING_PAYMENT', 'PAID', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED')),
    provider_id VARCHAR(50) DEFAULT 'mock',
    provider_order_id VARCHAR(255),
    provider_status VARCHAR(50),
    provider_message TEXT,
    timeline JSONB DEFAULT '[]'::jsonb,
    test_mode BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(100) REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    game_id VARCHAR(100) REFERENCES games(id),
    game_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    player_data JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10, 2) NOT NULL,
    min_purchase NUMERIC(10, 2) DEFAULT 0,
    max_discount NUMERIC(10, 2),
    max_usage INT DEFAULT 1000,
    current_usage INT DEFAULT 0,
    max_usage_per_user INT DEFAULT 1,
    active BOOLEAN DEFAULT true,
    start_date TIMESTAMP WITH TIME ZONE,
    expiry_date TIMESTAMP WITH TIME ZONE
);

-- Support Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    subject VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    priority VARCHAR(20) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    status VARCHAR(50) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Support Messages Table
CREATE TABLE IF NOT EXISTS support_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id VARCHAR(255) NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    sender_role VARCHAR(50) DEFAULT 'USER',
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Affiliates Table
CREATE TABLE IF NOT EXISTS affiliates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    ref_code VARCHAR(50) UNIQUE NOT NULL,
    commission_rate NUMERIC(5, 2) DEFAULT 5.00,
    total_clicks INT DEFAULT 0,
    total_sales NUMERIC(12, 2) DEFAULT 0,
    total_commission NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Webhook Events Log
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider VARCHAR(100) NOT NULL,
    event VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    order_id VARCHAR(255),
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Store Settings Table
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
