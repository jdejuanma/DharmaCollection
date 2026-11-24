CREATE TABLE IF NOT EXISTS admin_members (
  user_id TEXT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS inventory (
  product_id TEXT PRIMARY KEY,
  stock INTEGER CHECK (stock BETWEEN 0 AND 100000),
  on_request BOOLEAN NOT NULL DEFAULT FALSE,
  version INTEGER NOT NULL DEFAULT 0 CHECK (version >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS inventory_movements (
  id BIGSERIAL PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES inventory(product_id),
  old_stock INTEGER,
  new_stock INTEGER,
  on_request BOOLEAN NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('venta','reposicion','correccion')),
  actor_id TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
