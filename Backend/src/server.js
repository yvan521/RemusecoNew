import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes from '../routes/auth.js';
import unitRoutes from '../routes/units.js';
import productRoutes from '../routes/products.js';
import employeeRoutes from '../routes/employees.js';
import transactionRoutes from '../routes/transactions.js';
import reportRoutes from '../routes/reports.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev')); 

app.get('/', (req, res) => res.json({ ok: true, name: 'Stock API' }));

app.use('/api/auth', authRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/products', productRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
