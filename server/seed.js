import db from './db.js';
import crypto from 'crypto';

function hashPw(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(pw, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

const pw = hashPw('password123');

const insertUser = db.prepare('INSERT OR IGNORE INTO users (email, password_hash, full_name, role, phone) VALUES (?, ?, ?, ?, ?)');
const insertCommodity = db.prepare('INSERT OR IGNORE INTO commodities (name, category, unit, description) VALUES (?, ?, ?, ?)');
const insertListing = db.prepare('INSERT OR IGNORE INTO listings (seller_id, commodity_id, title, description, quantity, unit, asking_price, category, grade, origin, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
const insertContract = db.prepare('INSERT OR IGNORE INTO contracts (contract_number, farmer_id, offtaker_id, broker_id, commodity_id, quantity, unit, farmer_price, offtaker_price, broker_commission, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
const insertPrice = db.prepare('INSERT OR IGNORE INTO price_board (commodity_id, region, buying_price, selling_price, source) VALUES (?, ?, ?, ?, ?)');

const seed = db.transaction(() => {
  insertUser.run('farmer1@zvida.zw', pw, 'Tinashe Moyo', 'farmer', '+263771234567');
  insertUser.run('farmer2@zvida.zw', pw, 'Chiedza Nhamo', 'farmer', '+263772345678');
  insertUser.run('farmer3@zvida.zw', pw, 'Blessing Chikomo', 'farmer', '+263773456789');
  insertUser.run('broker1@zvida.zw', pw, 'Tafadzwa Chikombe', 'broker', '+263774567890');
  insertUser.run('broker2@zvida.zw', pw, 'Rutendo Gwaze', 'broker', '+263775678901');
  insertUser.run('offtaker1@zvida.zw', pw, 'Simba Mills Ltd', 'offtaker', '+263776789012');
  insertUser.run('offtaker2@zvida.zw', pw, 'Nyika Foods', 'offtaker', '+263777890123');
  insertUser.run('driver1@zvida.zw', pw, 'Farai Mupfurutsa', 'driver', '+263778901234');
  insertUser.run('driver2@zvida.zw', pw, 'Tendai Musakwa', 'driver', '+263779012345');
  insertUser.run('supplier1@zvida.zw', pw, 'AgroChem Zimbabwe', 'supplier', '+263770123456');
  insertUser.run('supplier2@zvida.zw', pw, 'SeedCo Zimbabwe', 'supplier', '+263771123456');
  insertUser.run('admin@zvida.zw', pw, 'System Admin', 'admin', '+263772123456');

  insertCommodity.run('Wheat', 'GRAIN', 'kg', 'Grade A winter wheat');
  insertCommodity.run('Maize', 'GRAIN', 'kg', 'Yellow maize feed grade');
  insertCommodity.run('Soybeans', 'GRAIN', 'kg', 'Non-GMO soybeans');
  insertCommodity.run('Millet', 'GRAIN', 'kg', 'Pearl millet');
  insertCommodity.run('Sorghum', 'GRAIN', 'kg', 'Red sorghum');
  insertCommodity.run('Wheat Bran', 'BRAN_FEED', 'kg', 'Wheat bran animal feed');
  insertCommodity.run('Maize Bran', 'BRAN_FEED', 'kg', 'Maize bran');
  insertCommodity.run('Cattle', 'LIVESTOCK', 'head', 'Beef cattle');
  insertCommodity.run('Goats', 'LIVESTOCK', 'head', 'Boer goats');
  insertCommodity.run('Fertilizer NPK', 'INPUTS', '50kg bag', 'NPK 2:3:2 compound');
  insertCommodity.run('Ammonium Nitrate', 'INPUTS', '50kg bag', 'AN fertilizer');
  insertCommodity.run('Seed Maize', 'INPUTS', 'kg', 'Hybrid maize seed');
  insertCommodity.run('Tractor', 'EQUIPMENT', 'unit', 'John Deere 5075E');

  insertListing.run(1, 1, 'Premium Winter Wheat', 'High quality winter wheat from Mutare farms', 5000, 'kg', 450, 'GRAIN', 'Grade A', 'Manicaland', 'active');
  insertListing.run(1, 2, 'Yellow Maize Feed', 'Feed grade yellow maize', 10000, 'kg', 320, 'GRAIN', 'Feed', 'Mashonaland East', 'active');
  insertListing.run(2, 3, 'Non-GMO Soybeans', 'Certified non-GMO soybeans', 3000, 'kg', 580, 'GRAIN', 'Grade A', 'Masvingo', 'active');
  insertListing.run(3, 4, 'Pearl Millet', 'Traditional pearl millet', 2000, 'kg', 380, 'GRAIN', 'Standard', 'Matabeleland South', 'active');
  insertListing.run(2, 5, 'Red Sorghum', 'Brewing grade sorghum', 4000, 'kg', 290, 'GRAIN', 'Brewing', 'Midlands', 'active');
  insertListing.run(1, 1, 'Distressed Wheat Stock', 'Overbought wheat needs quick sale', 8000, 'kg', 350, 'GRAIN', 'Feed', 'Harare', 'active');

  insertContract.run('ZV-001', 1, 6, 4, 1, 5000, 'kg', 420, 450, 30, 'SUCCESSFUL');
  insertContract.run('ZV-002', 2, 6, 4, 3, 3000, 'kg', 550, 580, 30, 'IN_TRANSIT');
  insertContract.run('ZV-003', 1, 7, 5, 2, 8000, 'kg', 300, 320, 20, 'LOADING');
  insertContract.run('ZV-004', 3, 7, 4, 4, 2000, 'kg', 350, 380, 30, 'PENDING');
  insertContract.run('ZV-005', 2, 6, 5, 5, 4000, 'kg', 260, 290, 30, 'SECOND_WEIGHT');

  insertPrice.run(1, 'Harare', 420, 450, 'ZVIDAMBANO');
  insertPrice.run(1, 'Bulawayo', 415, 445, 'ZVIDAMBANO');
  insertPrice.run(2, 'Harare', 300, 320, 'ZVIDAMBANO');
  insertPrice.run(2, 'Mutare', 295, 318, 'ZVIDAMBANO');
  insertPrice.run(3, 'Harare', 550, 580, 'ZVIDAMBANO');
  insertPrice.run(3, 'Masvingo', 540, 570, 'ZVIDAMBANO');
  insertPrice.run(4, 'Harare', 350, 380, 'ZVIDAMBANO');
  insertPrice.run(5, 'Harare', 260, 290, 'ZVIDAMBANO');
  insertPrice.run(6, 'Harare', 180, 210, 'ZVIDAMBANO');
  insertPrice.run(10, 'Harare', 850, 920, 'ZVIDAMBANO');
});

seed();
console.log('Database seeded successfully');
