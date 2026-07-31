import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import searchRoutes from './routes/search.js';
import authRoutes from './routes/auth.js';
import listingsRoutes from './routes/listings.js';
import contractsRoutes from './routes/contracts.js';
import deliveriesRoutes from './routes/deliveries.js';
import paymentsRoutes from './routes/payments.js';
import disputesRoutes from './routes/disputes.js';
import notificationsRoutes from './routes/notifications.js';
import messagesRoutes from './routes/messages.js';
import settlementsRoutes from './routes/settlements.js';
import commissionsRoutes from './routes/commissions.js';
import qualityRoutes from './routes/quality.js';
import documentsRoutes from './routes/documents.js';
import pricesRoutes from './routes/prices.js';
import farmsRoutes from './routes/farms.js';
import inputOrdersRoutes from './routes/input-orders.js';
import financingRoutes from './routes/financing.js';
import equipmentRoutes from './routes/equipment.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/search', searchRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/contracts', contractsRoutes);
app.use('/api/deliveries', deliveriesRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/disputes', disputesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/settlements', settlementsRoutes);
app.use('/api/commissions', commissionsRoutes);
app.use('/api/quality', qualityRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/prices', pricesRoutes);
app.use('/api/farms', farmsRoutes);
app.use('/api/input-orders', inputOrdersRoutes);
app.use('/api/financing', financingRoutes);
app.use('/api/equipment', equipmentRoutes);

app.use(express.static(join(__dirname, '..', 'dist')));

app.get('/{*path}', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(join(__dirname, '..', 'dist', 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`ZVIDAMBANO API running on http://localhost:${PORT}`);
});
