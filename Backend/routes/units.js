import { Router } from 'express';
import { pool } from '../src/db.js'
import { ok, created, notFound, bad, serverError } from '../utils/respond.js';
import { authRequired, requireRole } from '../middleware/auth.js';
import { logAction } from '../middleware/logger.js';

const router = Router();

router.get('/', authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM units ORDER BY unit_name');
    return ok(res, rows);
  } catch (e) { return serverError(res, e); }
});

router.post('/', authRequired, requireRole('manager'), async (req, res) => {
  try {
    const { unit_name, unit_type } = req.body;
    if (!unit_name || !unit_type) return bad(res, 'unit_name and unit_type required');
    const [result] = await pool.query(
      'INSERT INTO units (unit_name, unit_type) VALUES (?,?)',
      [unit_name, unit_type]
    );
    await logAction(req, 'CREATE_UNIT', 'unit', result.insertId, { unit_name, unit_type });
    return created(res, { unit_id: result.insertId, unit_name, unit_type });
  } catch (e) { return serverError(res, e); }
});

router.put('/:id', authRequired, requireRole('manager'), async (req, res) => {
  try {
    const { unit_name, unit_type } = req.body;
    const [r] = await pool.query('UPDATE units SET unit_name=?, unit_type=? WHERE unit_id=?', [unit_name, unit_type, req.params.id]);
    if (!r.affectedRows) return notFound(res, 'Unit not found');
    await logAction(req, 'UPDATE_UNIT', 'unit', req.params.id, { unit_name, unit_type });
    return ok(res, { unit_id: req.params.id, unit_name, unit_type });
  } catch (e) { return serverError(res, e); }
});

router.delete('/:id', authRequired, requireRole('manager'), async (req, res) => {
  try {
    const [r] = await pool.query('DELETE FROM units WHERE unit_id=?', [req.params.id]);
    if (!r.affectedRows) return notFound(res, 'Unit not found');
    await logAction(req, 'DELETE_UNIT', 'unit', req.params.id);
    return ok(res, { deleted: true });
  } catch (e) { return serverError(res, e); }
});

export default router;
