import { Router } from 'express';
import { pool } from '../src/db.js';
import { ok, serverError } from '../utils/respond.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/stock-balance', authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM stock_balance ORDER BY product_name');
    return ok(res, rows);
  } catch (e) { return serverError(res, e); }
}); 

router.get('/logs', authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT al.*, e.full_name AS employee_name
      FROM activity_logs al
      LEFT JOIN employees e ON al.employee_id = e.employee_id
      ORDER BY al.created_at DESC, al.log_id DESC
      LIMIT 500
    `);
    return ok(res, rows);
  } catch (e) { return serverError(res, e); }
});

export default router;
