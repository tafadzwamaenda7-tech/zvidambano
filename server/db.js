import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, '..', 'zvida.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('farmer','broker','offtaker','driver','supplier','admin')),
    phone TEXT,
    avatar_url TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS farms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    location TEXT,
    gps_lat REAL,
    gps_lng REAL,
    size_hectares REAL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS commodities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('GRAIN','BRAN_FEED','LIVESTOCK','INPUTS','EQUIPMENT')),
    unit TEXT NOT NULL DEFAULT 'kg',
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seller_id INTEGER NOT NULL REFERENCES users(id),
    commodity_id INTEGER NOT NULL REFERENCES commodities(id),
    title TEXT NOT NULL,
    description TEXT,
    quantity REAL NOT NULL,
    unit TEXT NOT NULL DEFAULT 'kg',
    asking_price REAL,
    category TEXT,
    grade TEXT,
    origin TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active','sold','expired','draft')),
    supplier_reserve_price REAL,
    broker_listed_price REAL,
    is_distressed INTEGER DEFAULT 0,
    photo_url TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS contracts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_number TEXT UNIQUE NOT NULL,
    farmer_id INTEGER REFERENCES users(id),
    offtaker_id INTEGER REFERENCES users(id),
    broker_id INTEGER REFERENCES users(id),
    commodity_id INTEGER REFERENCES commodities(id),
    listing_id INTEGER REFERENCES listings(id),
    quantity REAL,
    unit TEXT DEFAULT 'kg',
    farmer_price REAL,
    offtaker_price REAL,
    broker_commission REAL,
    status TEXT DEFAULT 'PENDING' CHECK(status IN (
      'PENDING','LOADING','FIRST_WEIGHT','IN_TRANSIT',
      'SECOND_WEIGHT','PENDING_SETTLEMENT','SUCCESSFUL','PAID','CANCELLED'
    )),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS deliveries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_id INTEGER NOT NULL REFERENCES contracts(id),
    driver_id INTEGER REFERENCES users(id),
    vehicle_reg TEXT,
    origin TEXT,
    destination TEXT,
    first_weight REAL,
    first_weighbridge_ticket TEXT,
    second_weight REAL,
    second_weighbridge_ticket TEXT,
    bucket_count INTEGER,
    bucket_capacity_kg REAL,
    bucket_photo_url TEXT,
    bucket_approved INTEGER DEFAULT 0,
    status TEXT DEFAULT 'PENDING' CHECK(status IN (
      'PENDING','LOADING','FIRST_WEIGHT','IN_TRANSIT',
      'SECOND_WEIGHT','DELIVERED'
    )),
    gps_lat REAL,
    gps_lng REAL,
    estimated_arrival TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_id INTEGER NOT NULL REFERENCES contracts(id),
    payer_id INTEGER REFERENCES users(id),
    payee_id INTEGER REFERENCES users(id),
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    method TEXT,
    reference TEXT,
    status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING','PROCESSING','COMPLETED','FAILED')),
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS farmer_settlements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_id INTEGER NOT NULL REFERENCES contracts(id),
    farmer_id INTEGER NOT NULL REFERENCES users(id),
    net_payout REAL NOT NULL,
    gross_amount REAL,
    status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING','PAID')),
    paid_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS offtaker_invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_id INTEGER NOT NULL REFERENCES contracts(id),
    offtaker_id INTEGER NOT NULL REFERENCES users(id),
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING','PAID')),
    paid_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS broker_commission_ledger (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_id INTEGER NOT NULL REFERENCES contracts(id),
    broker_id INTEGER NOT NULL REFERENCES users(id),
    commission_amount REAL NOT NULL,
    farmer_buy_price REAL,
    offtaker_sell_price REAL,
    spread REAL,
    status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING','SETTLED')),
    settled_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS quality_scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_id INTEGER REFERENCES contracts(id),
    listing_id INTEGER REFERENCES listings(id),
    scanned_by INTEGER REFERENCES users(id),
    moisture REAL,
    protein REAL,
    foreign_matter REAL,
    damaged_grains REAL,
    grade TEXT,
    result TEXT CHECK(result IN ('pass','fail')),
    notes TEXT,
    photo_url TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_id INTEGER REFERENCES contracts(id),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    file_url TEXT,
    generated_by INTEGER REFERENCES users(id),
    metadata TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS disputes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_id INTEGER NOT NULL REFERENCES contracts(id),
    raised_by INTEGER NOT NULL REFERENCES users(id),
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'OPEN' CHECK(status IN ('OPEN','IN_REVIEW','RESOLVED','CLOSED')),
    resolution TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    resolved_at TEXT
  );

  CREATE TABLE IF NOT EXISTS price_board (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    commodity_id INTEGER NOT NULL REFERENCES commodities(id),
    region TEXT,
    buying_price REAL,
    selling_price REAL,
    currency TEXT DEFAULT 'USD',
    source TEXT,
    recorded_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    body TEXT,
    type TEXT DEFAULT 'info',
    read INTEGER DEFAULT 0,
    action_url TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL REFERENCES users(id),
    receiver_id INTEGER NOT NULL REFERENCES users(id),
    body TEXT NOT NULL,
    read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS input_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_id INTEGER REFERENCES users(id),
    farmer_id INTEGER REFERENCES users(id),
    product_name TEXT NOT NULL,
    quantity REAL,
    unit TEXT DEFAULT 'kg',
    amount REAL,
    status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING','CONFIRMED','DELIVERED','PAID')),
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS financing_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    farmer_id INTEGER NOT NULL REFERENCES users(id),
    amount REAL NOT NULL,
    purpose TEXT,
    farm_id INTEGER REFERENCES farms(id),
    status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING','REVIEW','APPROVED','DISBURSED','REPAID')),
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS equipment_listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    condition TEXT,
    price_per_day REAL,
    available INTEGER DEFAULT 1,
    photo_url TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
  CREATE INDEX IF NOT EXISTS idx_listings_seller ON listings(seller_id);
  CREATE INDEX IF NOT EXISTS idx_listings_commodity ON listings(commodity_id);
  CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
  CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
  CREATE INDEX IF NOT EXISTS idx_contracts_farmer ON contracts(farmer_id);
  CREATE INDEX IF NOT EXISTS idx_contracts_offtaker ON contracts(offtaker_id);
  CREATE INDEX IF NOT EXISTS idx_deliveries_contract ON deliveries(contract_id);
  CREATE INDEX IF NOT EXISTS idx_payments_contract ON payments(contract_id);
  CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
  CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
  CREATE INDEX IF NOT EXISTS idx_disputes_contract ON disputes(contract_id);
  CREATE INDEX IF NOT EXISTS idx_quality_scans_contract ON quality_scans(contract_id);
  CREATE INDEX IF NOT EXISTS idx_documents_contract ON documents(contract_id);
  CREATE INDEX IF NOT EXISTS idx_price_board_commodity ON price_board(commodity_id);
`);

export default db;
