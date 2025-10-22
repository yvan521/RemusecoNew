import { Router } from 'express';
import { pool } from '../src/db.js';
import { ok, created, notFound, bad, serverError } from '../utils/respond.js';
import { authRequired, requireRole } from '../middleware/auth.js';
import { hashPassword } from '../utils/password.js';
import { logAction } from '../middleware/logger.js';

const router = Router();

router.get('/', authRequired, requireRole('manager'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT employee_id, full_name, username, role, active FROM employees ORDER BY full_name'
    );
    return ok(res, rows);
  } catch (e) {
    return serverError(res, e);
  }
});

router.post('/', authRequired, requireRole('manager'), async (req, res) => {
  try {
    const { full_name, username, password, role = 'staff' } = req.body;
    if (!full_name || !username || !password) return bad(res, 'Missing fields');
    const hashed = await hashPassword(password);
    const [result] = await pool.query(
      'INSERT INTO employees (full_name, username, password, role) VALUES (?,?,?,?)',
      [full_name, username, hashed, role]
    );
    await logAction(req, 'CREATE_EMPLOYEE', 'employee', result.insertId, {
      full_name,
      role,
    });
    return created(res, {
      employee_id: result.insertId,
      full_name,
      username,
      role,
    });
  } catch (e) {
    return serverError(res, e);
  }
});

router.put('/:id', authRequired, requireRole('manager'), async (req, res) => {
  try {
    const { full_name, role, active } = req.body;
    const [r] = await pool.query(
      'UPDATE employees SET full_name=COALESCE(?, full_name), role=COALESCE(?, role), active=COALESCE(?, active) WHERE employee_id=?',
      [full_name ?? null, role ?? null, active ?? null, req.params.id]
    );
    if (!r.affectedRows) return notFound(res, 'Employee not found');
    await logAction(req, 'UPDATE_EMPLOYEE', 'employee', req.params.id, {
      full_name,
      role,
      active,
    });
    return ok(res, { updated: true });
  } catch (e) {
    return serverError(res, e);
  }
});

router.put('/:id/password', authRequired, requireRole('manager'), async (req, res) => {
  try {
    const { new_password } = req.body;
    if (!new_password) return bad(res, 'new_password required');
    const hashed = await hashPassword(new_password);
    const [r] = await pool.query('UPDATE employees SET password=? WHERE employee_id=?', [
      hashed,
      req.params.id,
    ]);
    if (!r.affectedRows) return notFound(res, 'Employee not found');
    await logAction(req, 'RESET_PASSWORD', 'employee', req.params.id);
    return ok(res, { updated: true });
  } catch (e) {
    return serverError(res, e);
  }
});
/** 🔹 Delete employee */
router.delete('/:id', authRequired, requireRole('manager'), async (req, res) => {
  try {
    const employeeId = req.params.id;

    // Prevent deleting own account
    if (parseInt(employeeId) === req.user.employee_id) {
      return bad(res, "You cannot delete your own account");
    }

    const [r] = await pool.query('DELETE FROM employees WHERE employee_id=?', [
      employeeId,
    ]);
    if (!r.affectedRows) return notFound(res, 'Employee not found');

    await logAction(req, 'DELETE_EMPLOYEE', 'employee', employeeId, {
      message: `Employee ${employeeId} deleted`,
    });

    return ok(res, { deleted: true });
  } catch (e) {
    return serverError(res, e);
  }
});

export default router;
