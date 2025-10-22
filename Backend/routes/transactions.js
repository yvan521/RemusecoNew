import { Router } from 'express';
import { pool } from '../src/db.js';
import { ok, created, bad, notFound, serverError } from '../utils/respond.js';
import { authRequired } from '../middleware/auth.js';
import { logAction } from '../middleware/logger.js';

const router = Router();

/** List transactions */
router.get('/', authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT st.*, p.product_name, u.unit_name, e.full_name AS employee_name
      FROM stock_transactions st
      JOIN products p ON st.product_id = p.product_id
      JOIN units u ON p.unit_id = u.unit_id
      JOIN employees e ON st.employee_id = e.employee_id
      ORDER BY st.transaction_date DESC, st.transaction_id DESC
      LIMIT 500
    `);
    return ok(res, rows);
  } catch (e) { return serverError(res, e); }
});

/** Helper: ensure stock won’t go negative for OUT */
async function hasSufficientStock(product_id, outQty) {
  const [rows] = await pool.query('SELECT current_quantity FROM stock_balance WHERE product_id=?', [product_id]);
  const current = rows.length ? Number(rows[0].current_quantity) : 0;
  return current >= Number(outQty);
}

/** Create IN / OUT */
router.post('/', authRequired, async (req, res) => {
  try {
    const { product_id, transaction_type, quantity, remarks } = req.body;
    if (!product_id || !transaction_type || !quantity) return bad(res, 'product_id, transaction_type, quantity required');
    if (!['IN','OUT'].includes(transaction_type)) return bad(res, 'transaction_type must be IN or OUT');
    if (Number(quantity) <= 0) return bad(res, 'quantity must be > 0');

    if (transaction_type === 'OUT') {
      const okStock = await hasSufficientStock(product_id, quantity);
      if (!okStock) return bad(res, 'Insufficient stock for OUT');
    }

    const [result] = await pool.query(
      `INSERT INTO stock_transactions (product_id, employee_id, transaction_type, quantity, remarks)
       VALUES (?,?,?,?,?)`,
      [product_id, req.user.employee_id, transaction_type, quantity, remarks || null]
    );

    await logAction(req, transaction_type === 'IN' ? 'STOCK_IN' : 'STOCK_OUT', 'transaction', result.insertId, { product_id, quantity });

    return created(res, { transaction_id: result.insertId });
  } catch (e) { return serverError(res, e); }
});

/** Delete a transaction */
router.delete('/:id', authRequired, async (req, res) => {
  try {
    const { id } = req.params;

    // delete transaction
    const [result] = await pool.query(
      'DELETE FROM stock_transactions WHERE transaction_id = ?',
      [id]
    );

    if (result.affectedRows === 0) return notFound(res, 'Transaction not found');

    // log deletion action (but don’t remove old logs)
    await logAction(
      req,
      'DELETE_TRANSACTION',
      'transaction',
      id,
      { message: `Transaction ${id} deleted` }
    );

    return ok(res, { deleted: id });
  } catch (e) {
    return serverError(res, e);
  }
});


export default router;
